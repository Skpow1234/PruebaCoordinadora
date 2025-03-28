#!/bin/bash

# Set environment variables
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=password
export DB_NAME=logistics_db
export JWT_SECRET=your-secret-key
export JWT_EXPIRES_IN=1h
export PORT=3000

# Initialize database
npm run db:init

# Start the service in development mode
npm run dev 