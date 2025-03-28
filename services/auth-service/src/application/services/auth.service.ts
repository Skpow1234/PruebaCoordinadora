import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: string
  ) {}

  async register(email: string, password: string, role: UserRole = UserRole.USER): Promise<{ user: User; token: string }> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = User.create(email, hashedPassword, role);
    const savedUser = await this.userRepository.create(user);

    const token = this.generateToken(savedUser);

    return { user: savedUser, token };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);

    return { user, token };
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
  }

  async validateToken(token: string): Promise<{ id: string; email: string; role: UserRole }> {
    try {
      return jwt.verify(token, this.jwtSecret) as { id: string; email: string; role: UserRole };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
} 