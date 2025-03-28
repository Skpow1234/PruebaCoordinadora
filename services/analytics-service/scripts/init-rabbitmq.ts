import amqp from 'amqplib';

async function initializeRabbitMQ() {
  const connection = await amqp.connect({
    hostname: process.env.RABBITMQ_HOST || 'localhost',
    username: process.env.RABBITMQ_USER || 'admin',
    password: process.env.RABBITMQ_PASSWORD || 'admin'
  });

  try {
    const channel = await connection.createChannel();

    // Declare exchanges
    await channel.assertExchange('shipment_events', 'topic', { durable: true });
    await channel.assertExchange('analytics_events', 'topic', { durable: true });

    // Declare queues
    await channel.assertQueue('shipment_status_updates', { durable: true });
    await channel.assertQueue('analytics_reports', { durable: true });

    // Bind queues to exchanges
    await channel.bindQueue('shipment_status_updates', 'shipment_events', 'shipment.status.*');
    await channel.bindQueue('analytics_reports', 'analytics_events', 'analytics.report.*');

    console.log('RabbitMQ initialized successfully');
  } catch (error) {
    console.error('Error initializing RabbitMQ:', error);
    throw error;
  } finally {
    await connection.close();
  }
}

// Run initialization
initializeRabbitMQ().catch(console.error); 