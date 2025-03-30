#!/bin/bash

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
while ! redis-cli -h $REDIS_HOST -p $REDIS_PORT ping; do
  sleep 1
done

# Set default TTL for analytics cache (1 hour)
redis-cli -h $REDIS_HOST -p $REDIS_PORT config set maxmemory-policy allkeys-lru
redis-cli -h $REDIS_HOST -p $REDIS_PORT config set maxmemory 1gb

# Set default TTL for shipment status cache (5 minutes)
redis-cli -h $REDIS_HOST -p $REDIS_PORT config set maxmemory-policy volatile-lru
redis-cli -h $REDIS_HOST -p $REDIS_PORT config set maxmemory 512mb

# Set default TTL for user session cache (24 hours)
redis-cli -h $REDIS_HOST -p $REDIS_PORT config set maxmemory-policy volatile-lru
redis-cli -h $REDIS_HOST -p $REDIS_PORT config set maxmemory 256mb

echo "Redis initialized successfully" 