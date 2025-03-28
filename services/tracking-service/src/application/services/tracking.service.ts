import { Tracking, Location } from '../../domain/entities/tracking.entity';
import { TrackingRepository } from '../../domain/repositories/tracking.repository';
import { RedisClient } from '../../infrastructure/cache/redis.client';
import { RabbitMQClient } from '../../infrastructure/messaging/rabbitmq.client';
import { Server } from 'socket.io';

export class TrackingService {
  constructor(
    private readonly trackingRepository: TrackingRepository,
    private readonly cacheClient: RedisClient,
    private readonly messagingClient: RabbitMQClient,
    private readonly io: Server
  ) {
    this.setupMessageHandlers();
  }

  private setupMessageHandlers(): void {
    // Listen for shipment status updates
    this.messagingClient.subscribe('shipment.*', async (message) => {
      const { shipmentId, status } = message;
      const tracking = await this.findByShipmentId(shipmentId);
      
      if (tracking) {
        // Update tracking status
        const updatedTracking = tracking.updateLocation(
          tracking.currentLocation,
          status
        );
        await this.updateTracking(updatedTracking);
      }
    });
  }

  async createTracking(
    shipmentId: string,
    location: Location,
    status: string
  ): Promise<Tracking> {
    const tracking = Tracking.create(shipmentId, location, status);
    const savedTracking = await this.trackingRepository.create(tracking);
    
    // Cache the tracking data
    await this.cacheClient.set(
      `tracking:${shipmentId}`,
      JSON.stringify(savedTracking),
      300 // Cache for 5 minutes
    );

    // Notify connected clients
    this.io.emit(`tracking:${shipmentId}`, savedTracking);

    return savedTracking;
  }

  async updateLocation(
    shipmentId: string,
    location: Location,
    status: string,
    description?: string
  ): Promise<Tracking> {
    const tracking = await this.findByShipmentId(shipmentId);
    if (!tracking) {
      throw new Error('Tracking not found');
    }

    const updatedTracking = tracking.updateLocation(location, status, description);
    const savedTracking = await this.trackingRepository.update(updatedTracking);

    // Update cache
    await this.cacheClient.set(
      `tracking:${shipmentId}`,
      JSON.stringify(savedTracking),
      300
    );

    // Notify connected clients
    this.io.emit(`tracking:${shipmentId}`, savedTracking);

    return savedTracking;
  }

  async findByShipmentId(shipmentId: string): Promise<Tracking | null> {
    // Try to get from cache first
    const cached = await this.cacheClient.get(`tracking:${shipmentId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const tracking = await this.trackingRepository.findByShipmentId(shipmentId);
    if (tracking) {
      // Cache for 5 minutes
      await this.cacheClient.set(
        `tracking:${shipmentId}`,
        JSON.stringify(tracking),
        300
      );
    }

    return tracking;
  }

  async findById(id: string): Promise<Tracking | null> {
    return this.trackingRepository.findById(id);
  }

  async updateTracking(tracking: Tracking): Promise<Tracking> {
    const savedTracking = await this.trackingRepository.update(tracking);
    
    // Update cache
    await this.cacheClient.set(
      `tracking:${tracking.shipmentId}`,
      JSON.stringify(savedTracking),
      300
    );

    return savedTracking;
  }

  async deleteTracking(id: string): Promise<void> {
    const tracking = await this.findById(id);
    if (tracking) {
      await this.trackingRepository.delete(id);
      await this.cacheClient.del(`tracking:${tracking.shipmentId}`);
    }
  }

  async findActiveTrackings(): Promise<Tracking[]> {
    return this.trackingRepository.findActiveTrackings();
  }

  async findTrackingsByDateRange(startDate: Date, endDate: Date): Promise<Tracking[]> {
    return this.trackingRepository.findTrackingsByDateRange(startDate, endDate);
  }

  async findTrackingsByStatus(status: string): Promise<Tracking[]> {
    return this.trackingRepository.findTrackingsByStatus(status);
  }
} 