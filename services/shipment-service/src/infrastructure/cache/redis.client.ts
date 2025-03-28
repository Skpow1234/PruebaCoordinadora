import { createClient, RedisClientType } from 'redis';

export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, expirationInSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

export class RedisClientImpl implements RedisClient {
  private client: RedisClientType;

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly password?: string
  ) {
    this.client = createClient({
      url: `redis://${this.host}:${this.port}`,
      password: this.password
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client.connect();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, expirationInSeconds?: number): Promise<void> {
    if (expirationInSeconds) {
      await this.client.setEx(key, expirationInSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
} 