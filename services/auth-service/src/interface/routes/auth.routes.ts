import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export function createAuthRouter(authController: AuthController): Router {
  const router = Router();

  router.post('/register', (req, res) => authController.register(req, res));
  router.post('/login', (req, res) => authController.login(req, res));

  return router;
} 