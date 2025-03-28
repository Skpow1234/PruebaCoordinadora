@echo off

:: Set test environment variables
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=password
set DB_NAME=logistics_test_db
set JWT_SECRET=test-secret-key
set JWT_EXPIRES_IN=1h
set PORT=3000

:: Run tests with coverage
call npm run test:coverage 