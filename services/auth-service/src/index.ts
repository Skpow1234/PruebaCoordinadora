import express from 'express';
import mysql from 'mysql2/promise';
import swaggerUi from 'swagger-ui-express';
import { createAuthRouter } from './interface/routes/auth.routes';
import { AuthController } from './interface/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { MySQLUserRepository } from './infrastructure/repositories/mysql-user.repository';

const app = express();
const port = process.env.PORT || 3000;

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

// Dependencies
const userRepository = new MySQLUserRepository(pool);
const authService = new AuthService(
  userRepository,
  process.env.JWT_SECRET || 'your-secret-key',
  process.env.JWT_EXPIRES_IN || '1h'
);
const authController = new AuthController(authService);

// Routes
app.use('/api/auth', createAuthRouter(authController));

// Swagger documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Logistics API - Auth Service',
    version: '1.0.0',
    description: 'Authentication service for the Logistics API'
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  role: { type: 'string', enum: ['admin', 'user', 'transporter'] }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User registered successfully'
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful'
          }
        }
      }
    }
  }
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
app.listen(port, () => {
  console.log(`Auth service running on port ${port}`);
}); 