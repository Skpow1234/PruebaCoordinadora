# Logistics Shipping and Route Management API

A microservices-based API for managing logistics shipping and route management, built with TypeScript, Express, and following Clean Architecture principles.

## Architecture

The project follows a microservices architecture with the following services:

- **Auth Service**: Handles user authentication and authorization
- **Shipment Service**: Manages shipment orders and tracking
- **Tracking Service**: Real-time shipment status updates
- **Analytics Service**: Performance reports and analytics

Each service follows Clean Architecture principles with the following layers:
- Domain (Entities, Value Objects, Repository Interfaces)
- Application (Use Cases, Services)
- Infrastructure (Repository Implementations, External Services)
- Interface (Controllers, Routes)

## Technology Stack

- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL
- **Cache**: Redis
- **Message Broker**: RabbitMQ
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **Code Quality**: SonarQube

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- Docker and Docker Compose
- MySQL (if running locally)
- Redis (if running locally)
- RabbitMQ (if running locally)

### Installation

1. Clone the repository:
```bash
git clone <https://github.com/Skpow1234/PruebaCoordinadora>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the services using Docker Compose:
```bash
npm run docker:up
```

This will start all services:
- Auth Service: http://localhost:3000
- MySQL: localhost:3306
- Redis: localhost:6379
- RabbitMQ: localhost:5672
- RabbitMQ Management: http://localhost:15672
- SonarQube: http://localhost:9000

### API Documentation

Once the services are running, you can access the Swagger documentation at:
- Auth Service: http://localhost:3000/docs
- Shipment Service: http://localhost:3001/docs
- Tracking Service: http://localhost:3002/docs
- Analytics Service: http://localhost:3003/docs

## Testing

Run tests for all services:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Code Quality

The project uses SonarQube for code quality analysis. Access the SonarQube dashboard at http://localhost:9000 after starting the services.

## Security

- JWT-based authentication
- Role-based access control (Admin, User, Transporter)
- Password hashing with bcrypt
- Input validation with Zod
- Secure headers with helmet
- Rate limiting

## License

This project is licensed under the MIT License - see the LICENSE file for details.