import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json(error.toResponse());
    return;
  }

  // Handle validation errors from Zod
  if (error.name === 'ZodError') {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: error
    });
    return;
  }

  // Handle MySQL errors
  if (error.name === 'MysqlError') {
    res.status(500).json({
      code: 'DATABASE_ERROR',
      message: 'Database operation failed',
      details: error
    });
    return;
  }

  // Handle Redis errors
  if (error.name === 'RedisError') {
    res.status(500).json({
      code: 'CACHE_ERROR',
      message: 'Cache operation failed',
      details: error
    });
    return;
  }

  // Handle RabbitMQ errors
  if (error.name === 'RabbitMQError') {
    res.status(500).json({
      code: 'MESSAGING_ERROR',
      message: 'Message queue operation failed',
      details: error
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? error : undefined
  });
}; 