import { AuthService } from '../auth.service';
import { User, UserRole } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    authService = new AuthService(
      mockUserRepository,
      'test-secret',
      '1h'
    );
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const role = UserRole.USER;

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation(async (user: User) => user);

      const result = await authService.register(email, password, role);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.user.role).toBe(role);
      expect(result.token).toBeDefined();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockUserRepository.findByEmail.mockResolvedValue(
        new User('1', email, 'hashed', UserRole.USER, new Date(), new Date())
      );

      await expect(authService.register(email, password)).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await require('bcryptjs').hash(password, 10);

      const user = new User('1', email, hashedPassword, UserRole.USER, new Date(), new Date());
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await authService.login(email, password);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.token).toBeDefined();
    });

    it('should throw error with invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      const user = new User('1', 'test@example.com', 'hashed', UserRole.USER, new Date(), new Date());
      const token = await require('jsonwebtoken').sign(
        { id: user.id, email: user.email, role: user.role },
        'test-secret',
        { expiresIn: '1h' }
      );

      const result = await authService.validateToken(token);

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.role).toBe(user.role);
    });

    it('should throw error with invalid token', async () => {
      await expect(authService.validateToken('invalid-token')).rejects.toThrow('Invalid token');
    });
  });
}); 