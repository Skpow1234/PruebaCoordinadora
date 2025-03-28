import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mysql from 'mysql2/promise';
import swaggerUi from 'swagger-ui-express';
import { TrackingController } from './interface/controllers/tracking.controller';
import { createTrackingRouter } from './interface/routes/tracking.routes';
import { MySQLTrackingRepository } from './infrastructure/repositories/mysql-tracking.repository';
import { TrackingService } from './application/services/tracking.service';
import { RedisClientImpl } from './infrastructure/cache/redis.client';
import { RabbitMQClientImpl } from './infrastructure/messaging/rabbitmq.client';
import { AuthService } from '../shared/services/auth.service';
import { AuthMiddleware } from '../shared/middleware/auth.middleware';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT || 3003;

// Middleware
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'logistics_db'
});

// Redis client
const redisClient = new RedisClientImpl({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
});

// RabbitMQ client
const rabbitMQClient = new RabbitMQClientImpl({
  host: process.env.RABBITMQ_HOST || 'localhost',
  user: process.env.RABBITMQ_USER || 'admin',
  password: process.env.RABBITMQ_PASSWORD || 'admin'
});

// Dependencies
const trackingRepository = new MySQLTrackingRepository(pool);
const trackingService = new TrackingService(
  trackingRepository,
  redisClient,
  rabbitMQClient,
  io
);

const trackingController = new TrackingController(trackingService);

// Auth service and middleware
const authService = new AuthService();
const authMiddleware = new AuthMiddleware(authService);

// Routes
const trackingRouter = createTrackingRouter(trackingController, authMiddleware);
app.use('/api', trackingRouter);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('subscribe', (shipmentId: string) => {
    socket.join(`tracking:${shipmentId}`);
    console.log(`Client subscribed to tracking:${shipmentId}`);
  });

  socket.on('unsubscribe', (shipmentId: string) => {
    socket.leave(`tracking:${shipmentId}`);
    console.log(`Client unsubscribed from tracking:${shipmentId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Swagger documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Tracking Service API',
    version: '1.0.0',
    description: 'API for tracking shipments in real-time'
  },
  paths: {
    '/api/tracking': {
      post: {
        summary: 'Create a new tracking',
        tags: ['Tracking'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  shipmentId: {
                    type: 'string',
                    format: 'uuid'
                  },
                  location: {
                    type: 'object',
                    properties: {
                      latitude: {
                        type: 'number'
                      },
                      longitude: {
                        type: 'number'
                      },
                      address: {
                        type: 'string'
                      }
                    },
                    required: ['latitude', 'longitude']
                  },
                  status: {
                    type: 'string'
                  }
                },
                required: ['shipmentId', 'location', 'status']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Tracking created successfully'
          },
          '400': {
            description: 'Invalid input'
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      }
    }
  }
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
httpServer.listen(port, () => {
  console.log(`Tracking service running on port ${port}`);
}); 