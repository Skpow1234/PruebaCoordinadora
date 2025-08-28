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

2 Install dependencies:

```bash
npm install
```

3 Set up environment variables:

```bash
cp .env.example .env
```

## Running the Application

### Option 1: Using Docker Compose (Recommended)

Start all services using Docker Compose:

```bash
npm run docker:up
```

Or directly with Docker Compose:

```bash
docker-compose up --build
```

### Option 2: Using Docker Run Commands

If you prefer to run services individually with `docker run`, follow these steps:

#### Step 1: Create a Docker Network

```bash
docker network create logistics-network
```

#### Step 2: Start Infrastructure Services

**MySQL Database:**

```bash
docker run -d \
  --name mysql \
  --network logistics-network \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=logistics_db \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0
```

**Redis Cache:**

```bash
docker run -d \
  --name redis \
  --network logistics-network \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:6.0-alpine
```

**RabbitMQ Message Broker:**

```bash
docker run -d \
  --name rabbitmq \
  --network logistics-network \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin \
  -v rabbitmq_data:/var/lib/rabbitmq \
  rabbitmq:3.8-management-alpine
```

**SonarQube:**

```bash
docker run -d \
  --name sonarqube \
  --network logistics-network \
  -p 9000:9000 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:latest
```

#### Step 3: Build and Start Application Services

**Auth Service:**

```bash
# Build the image
docker build -t logistics-auth-service ./services/auth-service

# Run the container
docker run -d \
  --name auth-service \
  --network logistics-network \
  -p 3001:3001 \
  -e PORT=3001 \
  -e DB_HOST=mysql \
  -e DB_USER=root \
  -e DB_PASSWORD=password \
  -e DB_NAME=logistics_db \
  -e JWT_SECRET=your_jwt_secret \
  -e JWT_EXPIRES_IN=1h \
  -e JWT_REFRESH_EXPIRES_IN=7d \
  logistics-auth-service
```

**Shipment Service:**

```bash
# Build the image
docker build -t logistics-shipment-service ./services/shipment-service

# Run the container
docker run -d \
  --name shipment-service \
  --network logistics-network \
  -p 3002:3002 \
  -e PORT=3002 \
  -e DB_HOST=mysql \
  -e DB_USER=root \
  -e DB_PASSWORD=password \
  -e DB_NAME=logistics_db \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e RABBITMQ_HOST=rabbitmq \
  -e RABBITMQ_USER=admin \
  -e RABBITMQ_PASSWORD=admin \
  logistics-shipment-service
```

**Tracking Service:**

```bash
# Build the image
docker build -t logistics-tracking-service ./services/tracking-service

# Run the container
docker run -d \
  --name tracking-service \
  --network logistics-network \
  -p 3003:3003 \
  -e DB_HOST=mysql \
  -e DB_USER=root \
  -e DB_PASSWORD=password \
  -e DB_NAME=logistics_db \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e RABBITMQ_HOST=rabbitmq \
  -e RABBITMQ_USER=admin \
  -e RABBITMQ_PASSWORD=admin \
  -e JWT_SECRET=your-secret-key \
  -e JWT_EXPIRES_IN=1h \
  logistics-tracking-service
```

**Analytics Service:**

```bash
# Build the image
docker build -t logistics-analytics-service ./services/analytics-service

# Run the container
docker run -d \
  --name analytics-service \
  --network logistics-network \
  -p 3004:3004 \
  -e PORT=3004 \
  -e DB_HOST=mysql \
  -e DB_USER=root \
  -e DB_PASSWORD=password \
  -e DB_NAME=logistics_db \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e RABBITMQ_HOST=rabbitmq \
  -e RABBITMQ_USER=admin \
  -e RABBITMQ_PASSWORD=admin \
  -e SONARQUBE_URL=http://sonarqube:9000 \
  -e SONARQUBE_TOKEN=${SONARQUBE_TOKEN} \
  logistics-analytics-service
```

**API Gateway:**

```bash
# Build the image
docker build -t logistics-api-gateway ./services/api-gateway

# Run the container
docker run -d \
  --name api-gateway \
  --network logistics-network \
  -p 3000:3000 \
  -e NODE_ENV=development \
  -e PORT=3000 \
  logistics-api-gateway
```

#### Step 4: Initialize Database (Optional)

If you need to initialize the database with sample data:

```bash
# Wait for MySQL to be ready, then run initialization
docker exec -i mysql mysql -uroot -ppassword logistics_db < scripts/init-db.sql
```

#### Step 5: Stop and Clean Up

To stop all services:

```bash
# Stop application services
docker stop api-gateway auth-service shipment-service tracking-service analytics-service

# Stop infrastructure services
docker stop sonarqube rabbitmq redis mysql

# Remove containers
docker rm api-gateway auth-service shipment-service tracking-service analytics-service
docker rm sonarqube rabbitmq redis mysql

# Remove network
docker network rm logistics-network

# Remove volumes (optional - this will delete all data)
docker volume rm mysql_data redis_data rabbitmq_data sonarqube_data sonarqube_extensions sonarqube_logs
```

### Service Endpoints

Once running, you can access:

- **API Gateway**: <http://localhost:3000>
- **Auth Service**: <http://localhost:3001>
- **Shipment Service**: <http://localhost:3002>
- **Tracking Service**: <http://localhost:3003>
- **Analytics Service**: <http://localhost:3004>
- **MySQL Database**: localhost:3306
- **Redis Cache**: localhost:6379
- **RabbitMQ**: localhost:5672
- **RabbitMQ Management**: <http://localhost:15672>
- **SonarQube**: <http://localhost:9000>

### API Documentation

Once the services are running, you can access the Swagger documentation at:

- Auth Service: <http://localhost:3000/docs>
- Shipment Service: <http://localhost:3001/docs>
- Tracking Service: <http://localhost:3002/docs>
- Analytics Service: <http://localhost:3003/docs>

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

The project uses SonarQube for code quality analysis. Access the SonarQube dashboard at <http://localhost:9000> after starting the services.

## Security

- JWT-based authentication
- Role-based access control (Admin, User, Transporter)
- Password hashing with bcrypt
- Input validation with Zod
- Secure headers with helmet
- Rate limiting

## License

This project is licensed under the MIT License - see the LICENSE file for details.
