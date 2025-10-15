import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from '../entities/post.entity';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsGateway } from './posts.gateway';

describe('PostsService', () => {
  let service: PostsService;
  let postRepository: jest.Mocked<Repository<Post>>;
  let likeRepository: jest.Mocked<Repository<Like>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let postsGateway: jest.Mocked<PostsGateway>;

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

  const mockPost: Post = {
    id: 1,
    content: 'Test post content',
    userId: 1,
    likesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    likes: [],
  };

  const mockLike: Like = {
    id: 1,
    postId: 1,
    userId: 1,
    createdAt: new Date(),
    post: mockPost,
    user: mockUser,
  };

  const mockPostRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockLikeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockPostsGateway = {
    emitLikeAdded: jest.fn(),
    emitLikeRemoved: jest.fn(),
    emitLikeCountUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
        {
          provide: getRepositoryToken(Like),
          useValue: mockLikeRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: PostsGateway,
          useValue: mockPostsGateway,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postRepository = module.get(getRepositoryToken(Post));
    likeRepository = module.get(getRepositoryToken(Like));
    userRepository = module.get(getRepositoryToken(User));
    postsGateway = module.get(PostsGateway);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createPostDto: CreatePostDto = {
      content: 'Test post content',
    };

    it('should successfully create a new post', async () => {
      // Arrange
      const userId = 1;
      postRepository.create.mockReturnValue(mockPost);
      postRepository.save.mockResolvedValue(mockPost);

      // Act
      const result = await service.create(createPostDto, userId);

      // Assert
      expect(postRepository.create).toHaveBeenCalledWith({
        content: createPostDto.content,
        userId,
      });
      expect(postRepository.save).toHaveBeenCalledWith(mockPost);
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAll', () => {
    it('should return all posts with relations', async () => {
      // Arrange
      const posts = [mockPost];
      postRepository.find.mockResolvedValue(posts);

      // Act
      const result = await service.findAll();

      // Assert
      expect(postRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'likes'],
        select: {
          user: {
            id: true,
            firstName: true,
            lastName: true,
            alias: true,
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual(posts);
    });
  });

  describe('findMyPosts', () => {
    it('should return posts for a specific user', async () => {
      // Arrange
      const userId = 1;
      const posts = [mockPost];
      postRepository.find.mockResolvedValue(posts);

      // Act
      const result = await service.findMyPosts(userId);

      // Assert
      expect(postRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['user', 'likes'],
        select: {
          user: {
            id: true,
            firstName: true,
            lastName: true,
            alias: true,
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual(posts);
    });
  });

  describe('findOne', () => {
    it('should return a post when it exists', async () => {
      // Arrange
      const postId = 1;
      postRepository.findOne.mockResolvedValue(mockPost);

      // Act
      const result = await service.findOne(postId);

      // Assert
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
        relations: ['user', 'likes'],
        select: {
          user: {
            id: true,
            firstName: true,
            lastName: true,
            alias: true,
          },
        },
      });
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      const postId = 999;
      postRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(postId)).rejects.toThrow(
        new NotFoundException('Publicación no encontrada'),
      );
    });
  });

  describe('likePost', () => {
    const postId = 1;
    const userId = 1;

    it('should successfully like a post', async () => {
      // Arrange
      postRepository.findOne
        .mockResolvedValueOnce(mockPost) // First call to check if post exists
        .mockResolvedValueOnce({ ...mockPost, likes: [mockLike] }); // Second call to get updated post
      likeRepository.findOne.mockResolvedValue(null); // No existing like
      likeRepository.create.mockReturnValue(mockLike);
      likeRepository.save.mockResolvedValue(mockLike);
      userRepository.findOne.mockResolvedValue(mockUser);
      postRepository.increment.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: []
      } as UpdateResult);

      // Act
      const result = await service.likePost(postId, userId);

      // Assert
      expect(postRepository.findOne).toHaveBeenCalledWith({ where: { id: postId } });
      expect(likeRepository.findOne).toHaveBeenCalledWith({
        where: { postId, userId },
      });
      expect(likeRepository.create).toHaveBeenCalledWith({ postId, userId });
      expect(likeRepository.save).toHaveBeenCalledWith(mockLike);
      expect(postRepository.increment).toHaveBeenCalledWith({ id: postId }, 'likesCount', 1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'alias'],
      });
      expect(postsGateway.emitLikeAdded).toHaveBeenCalledWith(postId, {
        id: mockLike.id,
        user: mockUser,
        postId: postId,
        createdAt: mockLike.createdAt,
      });
      expect(postsGateway.emitLikeCountUpdate).toHaveBeenCalledWith(postId, 1);
      expect(result).toEqual({ message: 'Like agregado exitosamente' });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      postRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.likePost(postId, userId)).rejects.toThrow(
        new NotFoundException('Publicación no encontrada'),
      );
      expect(likeRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when like already exists', async () => {
      // Arrange
      postRepository.findOne.mockResolvedValue(mockPost);
      likeRepository.findOne.mockResolvedValue(mockLike);

      // Act & Assert
      await expect(service.likePost(postId, userId)).rejects.toThrow(
        new ConflictException('Ya has dado like a esta publicación'),
      );
      expect(likeRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('unlikePost', () => {
    const postId = 1;
    const userId = 1;

    it('should successfully unlike a post', async () => {
      // Arrange
      postRepository.findOne
        .mockResolvedValueOnce(mockPost) // First call to check if post exists
        .mockResolvedValueOnce({ ...mockPost, likes: [] }); // Second call to get updated post
      likeRepository.findOne.mockResolvedValue(mockLike);
      likeRepository.remove.mockResolvedValue(mockLike);
      postRepository.decrement.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: []
      } as UpdateResult);

      // Act
      const result = await service.unlikePost(postId, userId);

      // Assert
      expect(postRepository.findOne).toHaveBeenCalledWith({ where: { id: postId } });
      expect(likeRepository.findOne).toHaveBeenCalledWith({
        where: { postId, userId },
      });
      expect(likeRepository.remove).toHaveBeenCalledWith(mockLike);
      expect(postRepository.decrement).toHaveBeenCalledWith({ id: postId }, 'likesCount', 1);
      expect(postsGateway.emitLikeRemoved).toHaveBeenCalledWith(postId, userId);
      expect(postsGateway.emitLikeCountUpdate).toHaveBeenCalledWith(postId, 0);
      expect(result).toEqual({ message: 'Like removido exitosamente' });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      postRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.unlikePost(postId, userId)).rejects.toThrow(
        new NotFoundException('Publicación no encontrada'),
      );
      expect(likeRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when like does not exist', async () => {
      // Arrange
      postRepository.findOne.mockResolvedValue(mockPost);
      likeRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.unlikePost(postId, userId)).rejects.toThrow(
        new NotFoundException('No has dado like a esta publicación'),
      );
      expect(likeRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('getPostsWithLikes', () => {
    it('should return posts with likes using query builder', async () => {
      // Arrange
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPost]),
      };
      postRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.getPostsWithLikes();

      // Assert
      expect(postRepository.createQueryBuilder).toHaveBeenCalledWith('post');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('post.user', 'user');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('post.likes', 'likes');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('likes.user', 'likeUser');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'post.id',
        'post.message',
        'post.likesCount',
        'post.createdAt',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.alias',
        'likes.id',
        'likeUser.id',
        'likeUser.firstName',
        'likeUser.lastName',
        'likeUser.alias',
      ]);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('post.createdAt', 'DESC');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual([mockPost]);
    });
  });
});