import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    alias: 'johndoe',
    birthDate: new Date('1990-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    posts: [],
    likes: [],
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return user when user exists', async () => {
      // Arrange
      const userId = 1;
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'alias', 'birthDate', 'email'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = 999;
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(userId)).rejects.toThrow(
        new NotFoundException('Usuario no encontrado'),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'alias', 'birthDate', 'email'],
      });
    });
  });

  describe('findByAlias', () => {
    it('should return user when user with alias exists', async () => {
      // Arrange
      const alias = 'johndoe';
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByAlias(alias);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { alias },
        select: ['id', 'firstName', 'lastName', 'alias', 'birthDate', 'email'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user with alias does not exist', async () => {
      // Arrange
      const alias = 'nonexistent';
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByAlias(alias)).rejects.toThrow(
        new NotFoundException('Usuario no encontrado'),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { alias },
        select: ['id', 'firstName', 'lastName', 'alias', 'birthDate', 'email'],
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile when user exists', async () => {
      // Arrange
      const userId = 1;
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.getProfile(userId);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'alias', 'birthDate', 'email'],
      });
      expect(result).toEqual({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        alias: mockUser.alias,
        birthDate: mockUser.birthDate,
        email: mockUser.email,
      });
    });

    it('should throw NotFoundException when user does not exist for profile', async () => {
      // Arrange
      const userId = 999;
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProfile(userId)).rejects.toThrow(
        new NotFoundException('Usuario no encontrado'),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'alias', 'birthDate', 'email'],
      });
    });
  });

  describe('edge cases', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      const userId = 1;
      const databaseError = new Error('Database connection failed');
      userRepository.findOne.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(service.findById(userId)).rejects.toThrow(databaseError);
    });

    it('should handle empty string alias', async () => {
      // Arrange
      const alias = '';
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByAlias(alias)).rejects.toThrow(
        new NotFoundException('Usuario no encontrado'),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { alias },
        select: ['id', 'firstName', 'lastName', 'alias', 'birthDate', 'email'],
      });
    });

    it('should handle zero userId', async () => {
      // Arrange
      const userId = 0;
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(userId)).rejects.toThrow(
        new NotFoundException('Usuario no encontrado'),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'alias', 'birthDate', 'email'],
      });
    });

    it('should handle negative userId', async () => {
      // Arrange
      const userId = -1;
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(userId)).rejects.toThrow(
        new NotFoundException('Usuario no encontrado'),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'alias', 'birthDate', 'email'],
      });
    });
  });
});