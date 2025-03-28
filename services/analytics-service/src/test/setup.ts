import { createPool } from 'mysql2/promise';
import Redis from 'ioredis';
import amqp from 'amqplib';

// Mock MySQL
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    execute: jest.fn(),
    query: jest.fn(),
    getConnection: jest.fn(),
    end: jest.fn(),
  })),
}));

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
    on: jest.fn(),
  }));
});

// Mock RabbitMQ
jest.mock('amqplib', () => ({
  connect: jest.fn(() => ({
    createChannel: jest.fn(() => ({
      assertExchange: jest.fn(),
      assertQueue: jest.fn(),
      bindQueue: jest.fn(),
      publish: jest.fn(),
      consume: jest.fn(),
      close: jest.fn(),
    })),
    close: jest.fn(),
  })),
}));

// Global test setup
beforeAll(() => {
  // Clear all mocks before tests
  jest.clearAllMocks();
});

// Global test teardown
afterAll(() => {
  // Clean up any remaining mocks
  jest.restoreAllMocks();
}); 