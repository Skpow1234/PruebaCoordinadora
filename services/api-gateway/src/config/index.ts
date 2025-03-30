import { z } from 'zod';

const configSchema = z.object({
  port: z.number().default(3000),
  services: z.object({
    auth: z.object({
      url: z.string().url(),
      timeout: z.number().default(5000)
    }),
    shipment: z.object({
      url: z.string().url(),
      timeout: z.number().default(5000)
    }),
    analytics: z.object({
      url: z.string().url(),
      timeout: z.number().default(5000)
    })
  }),
  jwt: z.object({
    secret: z.string(),
    expiresIn: z.string(),
    refreshExpiresIn: z.string()
  }),
  rateLimit: z.object({
    windowMs: z.number().default(15 * 60 * 1000), // 15 minutes
    max: z.number().default(100) // limit each IP to 100 requests per windowMs
  }),
  cors: z.object({
    origin: z.string().url(),
    methods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    allowedHeaders: z.array(z.string()).default(['Content-Type', 'Authorization'])
  })
});

const config = configSchema.parse({
  port: parseInt(process.env.PORT || '3000'),
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '5000')
    },
    shipment: {
      url: process.env.SHIPMENT_SERVICE_URL || 'http://shipment-service:3002',
      timeout: parseInt(process.env.SHIPMENT_SERVICE_TIMEOUT || '5000')
    },
    analytics: {
      url: process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3004',
      timeout: parseInt(process.env.ANALYTICS_SERVICE_TIMEOUT || '5000')
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100')
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,PATCH').split(','),
    allowedHeaders: (process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization').split(',')
  }
});

export default config; 