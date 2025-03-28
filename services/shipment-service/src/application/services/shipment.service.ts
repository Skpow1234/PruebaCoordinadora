import { Shipment, ShipmentStatus, PackageDetails, Address } from '../../domain/entities/shipment.entity';
import { ShipmentRepository } from '../../domain/repositories/shipment.repository';
import { RedisClient } from '../../infrastructure/cache/redis.client';
import { RabbitMQClient } from '../../infrastructure/messaging/rabbitmq.client';

export class ShipmentService {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly cacheClient: RedisClient,
    private readonly messagingClient: RabbitMQClient
  ) {}

  async createShipment(
    userId: string,
    packageDetails: PackageDetails,
    destinationAddress: Address
  ): Promise<Shipment> {
    const shipment = Shipment.create(userId, packageDetails, destinationAddress);
    const savedShipment = await this.shipmentRepository.create(shipment);
    
    // Publish event for tracking service
    await this.messagingClient.publish(
      'shipment.created',
      { shipmentId: savedShipment.id, status: savedShipment.status }
    );

    return savedShipment;
  }

  async assignCarrier(
    shipmentId: string,
    carrierId: string,
    routeId: string
  ): Promise<Shipment> {
    const shipment = await this.getShipmentById(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const updatedShipment = shipment.assignCarrier(carrierId, routeId);
    const savedShipment = await this.shipmentRepository.update(updatedShipment);

    // Invalidate cache
    await this.cacheClient.del(`shipment:${shipmentId}`);

    // Publish event for tracking service
    await this.messagingClient.publish(
      'shipment.assigned',
      { 
        shipmentId: savedShipment.id,
        carrierId,
        routeId,
        status: savedShipment.status
      }
    );

    return savedShipment;
  }

  async markAsDelivered(shipmentId: string): Promise<Shipment> {
    const shipment = await this.getShipmentById(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const updatedShipment = shipment.markAsDelivered();
    const savedShipment = await this.shipmentRepository.update(updatedShipment);

    // Invalidate cache
    await this.cacheClient.del(`shipment:${shipmentId}`);

    // Publish event for tracking service
    await this.messagingClient.publish(
      'shipment.delivered',
      { 
        shipmentId: savedShipment.id,
        status: savedShipment.status
      }
    );

    return savedShipment;
  }

  async getShipmentById(id: string): Promise<Shipment | null> {
    // Try to get from cache first
    const cached = await this.cacheClient.get(`shipment:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const shipment = await this.shipmentRepository.findById(id);
    if (shipment) {
      // Cache for 5 minutes
      await this.cacheClient.set(
        `shipment:${id}`,
        JSON.stringify(shipment),
        300
      );
    }

    return shipment;
  }

  async getShipmentsByUserId(userId: string): Promise<Shipment[]> {
    return this.shipmentRepository.findByUserId(userId);
  }

  async getShipmentsByStatus(status: ShipmentStatus): Promise<Shipment[]> {
    return this.shipmentRepository.findByStatus(status);
  }

  async getShipmentsByCarrier(carrierId: string): Promise<Shipment[]> {
    return this.shipmentRepository.findByCarrierId(carrierId);
  }

  async getActiveShipmentsByCarrier(carrierId: string): Promise<Shipment[]> {
    return this.shipmentRepository.findActiveShipmentsByCarrier(carrierId);
  }

  async getShipmentsByDateRange(startDate: Date, endDate: Date): Promise<Shipment[]> {
    return this.shipmentRepository.findByDateRange(startDate, endDate);
  }

  async getShipmentCountByStatus(status: ShipmentStatus): Promise<number> {
    const cacheKey = `shipment:count:${status}`;
    
    // Try to get from cache first
    const cached = await this.cacheClient.get(cacheKey);
    if (cached) {
      return parseInt(cached, 10);
    }

    const count = await this.shipmentRepository.countByStatus(status);
    
    // Cache for 5 minutes
    await this.cacheClient.set(cacheKey, count.toString(), 300);

    return count;
  }
} 