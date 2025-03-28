import amqp, { Channel, Connection } from 'amqplib';

export interface RabbitMQClient {
  publish(routingKey: string, message: any): Promise<void>;
  subscribe(routingKey: string, callback: (message: any) => Promise<void>): Promise<void>;
}

export class RabbitMQClientImpl implements RabbitMQClient {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly exchange = 'logistics';

  constructor(
    private readonly host: string,
    private readonly username: string,
    private readonly password: string
  ) {}

  private async initialize(): Promise<void> {
    if (!this.connection) {
      this.connection = await amqp.connect({
        hostname: this.host,
        username: this.username,
        password: this.password
      });

      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    }
  }

  async publish(routingKey: string, message: any): Promise<void> {
    await this.initialize();
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    this.channel.publish(
      this.exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
  }

  async subscribe(routingKey: string, callback: (message: any) => Promise<void>): Promise<void> {
    await this.initialize();
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const { queue } = await this.channel.assertQueue('', { exclusive: true });
    await this.channel.bindQueue(queue, this.exchange, routingKey);

    this.channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          this.channel?.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          this.channel?.nack(msg);
        }
      }
    });
  }
} 