# Analytics Service

This service is part of the Logistics Shipping and Route Management system. It provides analytics and reporting capabilities for shipment data, carrier performance, and route efficiency.

## Features

- Real-time shipment metrics and analytics
- Carrier performance tracking
- Route efficiency analysis
- Revenue trend reporting
- Caching with Redis for improved performance
- Event-driven updates via RabbitMQ
- Swagger API documentation

## Prerequisites

- Node.js v20 or later
- MySQL 8.0 or later
- Redis 6.0 or later
- RabbitMQ 3.8 or later
- SonarQube (optional, for code quality analysis)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3004

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=logistics_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin

# SonarQube
SONARQUBE_URL=http://localhost:9000
SONARQUBE_TOKEN=your_token
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize services:
```bash
npm run init:all
```

Or initialize services individually:
```bash
npm run init:db      # Initialize database
npm run init:redis   # Initialize Redis
npm run init:rabbitmq # Initialize RabbitMQ
npm run init:sonarqube # Initialize SonarQube
```

## Development

Start the service in development mode:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Code Quality

Run linting:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## Build

Build for production:
```bash
npm run build
```

## Production

Start the service in production mode:
```bash
npm start
```

## API Documentation

Once the service is running, access the Swagger documentation at:
```
http://localhost:3004/docs
```

## Docker

Build the Docker image:
```bash
docker build -t analytics-service .
```

Run the container:
```bash
docker run -p 3004:3004 analytics-service
```

## Architecture

The service follows Clean Architecture principles with the following layers:

- **Domain**: Core business logic and entities
- **Application**: Use cases and business rules
- **Infrastructure**: External services, database, and messaging
- **Interface**: Controllers and routes

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and ensure they pass
4. Submit a pull request

## License

This project is licensed under the MIT License. 