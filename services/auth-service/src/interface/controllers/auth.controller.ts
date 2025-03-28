import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../../application/services/auth.service';
import { UserRole } from '../../domain/entities/user.entity';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.TRANSPORTER]).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role } = registerSchema.parse(req.body);
      const result = await this.authService.register(email, password, role);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(401).json({ error: (error as Error).message });
    }
  }
} 