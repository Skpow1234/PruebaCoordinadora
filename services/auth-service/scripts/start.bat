@echo off

:: Set environment variables
set DB_HOST=mysql
set DB_USER=root
set DB_PASSWORD=password
set DB_NAME=logistics_db
set JWT_SECRET=your-secret-key
set JWT_EXPIRES_IN=1h
set PORT=3000

:: Start the service
call npm start 