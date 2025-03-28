import express from 'express';
import mysql from 'mysql2/promise';
import swaggerUi from 'swagger-ui-express';
import { AnalyticsController } from './interface/controllers/analytics.controller';
import { createAnalyticsRouter } from './interface/routes/analytics.routes';
import { MySQLAnalyticsRepository } from './infrastructure/repositories/mysql-analytics.repository';
import { AnalyticsService } from './application/services/analytics.service';
import { RedisClientImpl } from './infrastructure/cache/redis.client';
import { RabbitMQClientImpl } from './infrastructure/messaging/rabbitmq.client';
import { AuthService } from '../shared/services/auth.service';
import { AuthMiddleware } from '../shared/middleware/auth.middleware';

const app = express();
const port = process.env.PORT || 3004;

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
const analyticsRepository = new MySQLAnalyticsRepository(pool);
const analyticsService = new AnalyticsService(
  analyticsRepository,
  redisClient,
  rabbitMQClient
);

const analyticsController = new AnalyticsController(analyticsService);

// Auth service and middleware
const authService = new AuthService();
const authMiddleware = new AuthMiddleware(authService);

// Routes
const analyticsRouter = createAnalyticsRouter(analyticsController, authMiddleware);
app.use('/api/analytics', analyticsRouter);

// Swagger documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Analytics Service API',
    version: '1.0.0',
    description: 'API for shipment analytics and performance reports'
  },
  paths: {
    '/api/analytics/metrics': {
      get: {
        summary: 'Get shipment metrics',
        tags: ['Analytics'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'startDate',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              format: 'date-time'
            }
          },
          {
            name: 'endDate',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              format: 'date-time'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Shipment metrics retrieved successfully'
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
app.listen(port, () => {
  console.log(`Analytics service running on port ${port}`);
}); 