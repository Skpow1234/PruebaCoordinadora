import Redis from 'ioredis';

async function initializeRedis() {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  });

  try {
    // Test connection
    await redis.ping();
    console.log('Redis connection successful');

    // Set default TTL for analytics cache (1 hour)
    await redis.config('SET', 'maxmemory-policy', 'allkeys-lru');
    await redis.config('SET', 'maxmemory', '1gb');

    console.log('Redis initialized successfully');
  } catch (error) {
    console.error('Error initializing Redis:', error);
    throw error;
  } finally {
    await redis.quit();
  }
}

// Run initialization
initializeRedis().catch(console.error); 