import express from 'express';
import mysql from 'mysql2/promise';
import swaggerUi from 'swagger-ui-express';
import { createShipmentRouter } from './interface/routes/shipment.routes';
import { ShipmentController } from './interface/controllers/shipment.controller';
import { ShipmentService } from './application/services/shipment.service';
import { MySQLShipmentRepository } from './infrastructure/repositories/mysql-shipment.repository';
import { RedisClientImpl } from './infrastructure/cache/redis.client';
import { RabbitMQClientImpl } from './infrastructure/messaging/rabbitmq.client';
import { AuthMiddleware } from './interface/middleware/auth.middleware';
import { AuthService } from '../../auth-service/src/application/services/auth.service';

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'logistics_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Redis client
const redisClient = new RedisClientImpl(
  process.env.REDIS_HOST || 'localhost',
  parseInt(process.env.REDIS_PORT || '6379'),
  process.env.REDIS_PASSWORD
);

// RabbitMQ client
const rabbitmqClient = new RabbitMQClientImpl(
  process.env.RABBITMQ_HOST || 'localhost',
  process.env.RABBITMQ_USER || 'admin',
  process.env.RABBITMQ_PASSWORD || 'admin'
);

// Dependencies
const shipmentRepository = new MySQLShipmentRepository(pool);
const shipmentService = new ShipmentService(
  shipmentRepository,
  redisClient,
  rabbitmqClient
);
const shipmentController = new ShipmentController(shipmentService);

// Auth service for middleware
const authService = new AuthService(
  null as any, // User repository not needed for token validation
  process.env.JWT_SECRET || 'your-secret-key',
  process.env.JWT_EXPIRES_IN || '1h'
);
const authMiddleware = new AuthMiddleware(authService);

// Routes
app.use('/api/shipments', createShipmentRouter(shipmentController, authMiddleware));

// Swagger documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Logistics API - Shipment Service',
    version: '1.0.0',
    description: 'Shipment management service for the Logistics API'
  },
  paths: {
    '/api/shipments': {
      post: {
        summary: 'Create a new shipment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  packageDetails: {
                    type: 'object',
                    properties: {
                      weight: { type: 'number' },
                      dimensions: {
                        type: 'object',
                        properties: {
                          length: { type: 'number' },
                          width: { type: 'number' },
                          height: { type: 'number' }
                        }
                      },
                      productType: { type: 'string' }
                    }
                  },
                  destinationAddress: {
                    type: 'object',
                    properties: {
                      street: { type: 'string' },
                      city: { type: 'string' },
                      state: { type: 'string' },
                      country: { type: 'string' },
                      postalCode: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Shipment created successfully'
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
app.listen(port, () => {
  console.log(`Shipment service running on port ${port}`);
}); 