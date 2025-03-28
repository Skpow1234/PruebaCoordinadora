export enum ShipmentStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered'
}

export interface PackageDetails {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  productType: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export class Shipment {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly packageDetails: PackageDetails,
    public readonly destinationAddress: Address,
    public readonly status: ShipmentStatus,
    public readonly carrierId?: string,
    public readonly routeId?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(
    userId: string,
    packageDetails: PackageDetails,
    destinationAddress: Address
  ): Shipment {
    return new Shipment(
      crypto.randomUUID(),
      userId,
      packageDetails,
      destinationAddress,
      ShipmentStatus.PENDING
    );
  }

  public assignCarrier(carrierId: string, routeId: string): Shipment {
    return new Shipment(
      this.id,
      this.userId,
      this.packageDetails,
      this.destinationAddress,
      ShipmentStatus.IN_TRANSIT,
      carrierId,
      routeId,
      this.createdAt,
      new Date()
    );
  }

  public markAsDelivered(): Shipment {
    return new Shipment(
      this.id,
      this.userId,
      this.packageDetails,
      this.destinationAddress,
      ShipmentStatus.DELIVERED,
      this.carrierId,
      this.routeId,
      this.createdAt,
      new Date()
    );
  }
} 