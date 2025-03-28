@echo off

:: Set environment variables
set DB_HOST=mysql
set DB_USER=root
set DB_PASSWORD=password
set DB_NAME=logistics_db
set REDIS_HOST=redis
set REDIS_PORT=6379
set RABBITMQ_HOST=rabbitmq
set RABBITMQ_USER=admin
set RABBITMQ_PASSWORD=admin
set JWT_SECRET=your-secret-key
set JWT_EXPIRES_IN=1h
set PORT=3002

:: Start the service
call npm start 