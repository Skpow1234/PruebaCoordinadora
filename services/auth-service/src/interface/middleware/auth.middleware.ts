import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { UserRole } from '../../domain/entities/user.entity';

export class AuthMiddleware {
  constructor(private readonly authService: AuthService) {}

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const token = authHeader.split(' ')[1];
      const decoded = await this.authService.validateToken(token);
      
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  authorize = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      next();
    };
  };
} 