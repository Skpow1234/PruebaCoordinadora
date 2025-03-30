#!/bin/bash

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check required commands
for cmd in mysql redis-cli rabbitmqadmin curl jq; do
  if ! command_exists "$cmd"; then
    echo "Error: $cmd is required but not installed."
    exit 1
  fi
done

# Initialize MySQL
echo "Initializing MySQL..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD < scripts/init-db.sql

# Initialize Redis
echo "Initializing Redis..."
./scripts/init-redis.sh

# Initialize RabbitMQ
echo "Initializing RabbitMQ..."
./scripts/init-rabbitmq.sh

# Initialize SonarQube
echo "Initializing SonarQube..."
./scripts/init-sonarqube.sh

echo "All services initialized successfully" 