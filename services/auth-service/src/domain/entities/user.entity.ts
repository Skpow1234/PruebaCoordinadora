export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  TRANSPORTER = 'transporter'
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(email: string, password: string, role: UserRole = UserRole.USER): User {
    const now = new Date();
    return new User(
      crypto.randomUUID(),
      email,
      password,
      role,
      now,
      now
    );
  }

  public updatePassword(newPassword: string): User {
    return new User(
      this.id,
      this.email,
      newPassword,
      this.role,
      this.createdAt,
      new Date()
    );
  }
} 