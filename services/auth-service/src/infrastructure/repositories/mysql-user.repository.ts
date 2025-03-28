import mysql from 'mysql2/promise';
import { User, UserRole } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';

export class MySQLUserRepository implements UserRepository {
  constructor(private readonly pool: mysql.Pool) {}

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const user = (rows as any[])[0];
    if (!user) return null;

    return new User(
      user.id,
      user.email,
      user.password,
      user.role as UserRole,
      new Date(user.created_at),
      new Date(user.updated_at)
    );
  }

  async findById(id: string): Promise<User | null> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    const user = (rows as any[])[0];
    if (!user) return null;

    return new User(
      user.id,
      user.email,
      user.password,
      user.role as UserRole,
      new Date(user.created_at),
      new Date(user.updated_at)
    );
  }

  async create(user: User): Promise<User> {
    const [result] = await this.pool.execute(
      'INSERT INTO users (id, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        user.id,
        user.email,
        user.password,
        user.role,
        user.createdAt,
        user.updatedAt
      ]
    );

    return user;
  }

  async update(user: User): Promise<User> {
    await this.pool.execute(
      'UPDATE users SET password = ?, updated_at = ? WHERE id = ?',
      [user.password, user.updatedAt, user.id]
    );

    return user;
  }

  async delete(id: string): Promise<void> {
    await this.pool.execute('DELETE FROM users WHERE id = ?', [id]);
  }
} 