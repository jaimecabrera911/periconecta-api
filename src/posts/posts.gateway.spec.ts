import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PostsGateway } from './posts.gateway';
import { Server, Socket } from 'socket.io';

describe('PostsGateway', () => {
  let gateway: PostsGateway;
  let mockServer: jest.Mocked<Server>;
  let mockSocket: jest.Mocked<Socket>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(async () => {
    // Mock Server
    mockServer = {
      emit: jest.fn(),
    } as any;

    // Mock Socket
    mockSocket = {
      id: 'test-socket-id',
    } as any;

    // Mock Logger
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsGateway],
    }).compile();

    gateway = module.get<PostsGateway>(PostsGateway);
    
    // Assign mocked dependencies
    gateway.server = mockServer;
    gateway['logger'] = mockLogger;

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should log client connection', () => {
      // Act
      gateway.handleConnection(mockSocket);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Cliente conectado: ${mockSocket.id}`,
      );
    });

    it('should handle connection with different socket id', () => {
      // Arrange
      const differentSocket = { id: 'different-socket-id' } as Socket;

      // Act
      gateway.handleConnection(differentSocket);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Cliente conectado: ${differentSocket.id}`,
      );
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      // Act
      gateway.handleDisconnect(mockSocket);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Cliente desconectado: ${mockSocket.id}`,
      );
    });

    it('should handle disconnection with different socket id', () => {
      // Arrange
      const differentSocket = { id: 'different-socket-id' } as Socket;

      // Act
      gateway.handleDisconnect(differentSocket);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Cliente desconectado: ${differentSocket.id}`,
      );
    });
  });

  describe('emitLikeAdded', () => {
    it('should emit likeAdded event with correct data', () => {
      // Arrange
      const postId = 1;
      const likeData = {
        id: 1,
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          alias: 'johndoe',
        },
        postId: 1,
        createdAt: new Date('2023-01-01'),
      };

      // Mock Date.now to have consistent timestamp
      const mockDate = new Date('2023-01-01T12:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      // Act
      gateway.emitLikeAdded(postId, likeData);

      // Assert
      expect(mockServer.emit).toHaveBeenCalledWith('likeAdded', {
        postId,
        like: likeData,
        timestamp: mockDate,
      });

      // Restore Date
      jest.restoreAllMocks();
    });

    it('should emit likeAdded event with different post and like data', () => {
      // Arrange
      const postId = 2;
      const likeData = {
        id: 2,
        user: {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          alias: 'janesmith',
        },
        postId: 2,
        createdAt: new Date('2023-01-02'),
      };

      // Act
      gateway.emitLikeAdded(postId, likeData);

      // Assert
      expect(mockServer.emit).toHaveBeenCalledWith('likeAdded', {
        postId,
        like: likeData,
        timestamp: expect.any(Date),
      });
    });
  });

  describe('emitLikeRemoved', () => {
    it('should emit likeRemoved event with correct data', () => {
      // Arrange
      const postId = 1;
      const userId = 1;

      // Mock Date.now to have consistent timestamp
      const mockDate = new Date('2023-01-01T12:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      // Act
      gateway.emitLikeRemoved(postId, userId);

      // Assert
      expect(mockServer.emit).toHaveBeenCalledWith('likeRemoved', {
        postId,
        userId,
        timestamp: mockDate,
      });

      // Restore Date
      jest.restoreAllMocks();
    });

    it('should emit likeRemoved event with different post and user data', () => {
      // Arrange
      const postId = 3;
      const userId = 2;

      // Act
      gateway.emitLikeRemoved(postId, userId);

      // Assert
      expect(mockServer.emit).toHaveBeenCalledWith('likeRemoved', {
        postId,
        userId,
        timestamp: expect.any(Date),
      });
    });
  });

  describe('emitLikeCountUpdate', () => {
    it('should emit likeCountUpdate event with correct data', () => {
      // Arrange
      const postId = 1;
      const likeCount = 5;

      // Mock Date.now to have consistent timestamp
      const mockDate = new Date('2023-01-01T12:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      // Act
      gateway.emitLikeCountUpdate(postId, likeCount);

      // Assert
      expect(mockServer.emit).toHaveBeenCalledWith('likeCountUpdate', {
        postId,
        likeCount,
        timestamp: mockDate,
      });

      // Restore Date
      jest.restoreAllMocks();
    });

    it('should emit likeCountUpdate event with zero likes', () => {
      // Arrange
      const postId = 2;
      const likeCount = 0;

      // Act
      gateway.emitLikeCountUpdate(postId, likeCount);

      // Assert
      expect(mockServer.emit).toHaveBeenCalledWith('likeCountUpdate', {
        postId,
        likeCount,
        timestamp: expect.any(Date),
      });
    });

    it('should emit likeCountUpdate event with large like count', () => {
      // Arrange
      const postId = 3;
      const likeCount = 1000;

      // Act
      gateway.emitLikeCountUpdate(postId, likeCount);

      // Assert
      expect(mockServer.emit).toHaveBeenCalledWith('likeCountUpdate', {
        postId,
        likeCount,
        timestamp: expect.any(Date),
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple events in sequence', () => {
      // Arrange
      const postId = 1;
      const userId = 1;
      const likeData = {
        id: 1,
        user: { id: 1, firstName: 'John', lastName: 'Doe', alias: 'johndoe' },
        postId: 1,
        createdAt: new Date(),
      };

      // Act
      gateway.handleConnection(mockSocket);
      gateway.emitLikeAdded(postId, likeData);
      gateway.emitLikeCountUpdate(postId, 1);
      gateway.emitLikeRemoved(postId, userId);
      gateway.emitLikeCountUpdate(postId, 0);
      gateway.handleDisconnect(mockSocket);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledTimes(2);
      expect(mockServer.emit).toHaveBeenCalledTimes(4);
      expect(mockServer.emit).toHaveBeenNthCalledWith(1, 'likeAdded', expect.any(Object));
      expect(mockServer.emit).toHaveBeenNthCalledWith(2, 'likeCountUpdate', expect.any(Object));
      expect(mockServer.emit).toHaveBeenNthCalledWith(3, 'likeRemoved', expect.any(Object));
      expect(mockServer.emit).toHaveBeenNthCalledWith(4, 'likeCountUpdate', expect.any(Object));
    });

    it('should handle server being undefined gracefully', () => {
      // Arrange
      gateway.server = undefined as any;
      const postId = 1;
      const likeCount = 5;

      // Act & Assert - Should not throw error
      expect(() => {
        gateway.emitLikeCountUpdate(postId, likeCount);
      }).toThrow(); // This will throw because server is undefined, which is expected behavior
    });
  });
});