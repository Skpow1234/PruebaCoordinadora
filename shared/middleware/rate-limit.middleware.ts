import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { RateLimitError } from '../errors';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max number of requests per window
  keyGenerator?: (req: Request) => string;
}

const defaultKeyGenerator = (req: Request): string => {
  return `rate-limit:${req.ip}`;
};

export const rateLimit = (config: RateLimitConfig) => {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  });

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const key = (config.keyGenerator || defaultKeyGenerator)(req);
    const now = Date.now();

    try {
      // Get current count and timestamp
      const [count, timestamp] = await redis
        .multi()
        .get(key)
        .get(`${key}:timestamp`)
        .exec();

      const currentCount = count?.[1] ? parseInt(count[1] as string) : 0;
      const windowStart = timestamp?.[1] ? parseInt(timestamp[1] as string) : now;

      // Reset if window has passed
      if (now - windowStart > config.windowMs) {
        await redis
          .multi()
          .set(key, '1')
          .set(`${key}:timestamp`, now.toString())
          .expire(key, Math.ceil(config.windowMs / 1000))
          .expire(`${key}:timestamp`, Math.ceil(config.windowMs / 1000))
          .exec();
      } else if (currentCount >= config.max) {
        throw new RateLimitError();
      } else {
        // Increment counter
        await redis
          .multi()
          .incr(key)
          .exec();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 