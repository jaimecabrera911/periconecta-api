import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsGateway } from './posts.gateway';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private postsGateway: PostsGateway,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    const post = this.postRepository.create({
      content: createPostDto.content,
      userId,
    });

    return this.postRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.find({
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
  }

  async findMyPosts(userId: number): Promise<Post[]> {
    return this.postRepository.find({
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
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
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

    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return post;
  }

  async likePost(postId: number, userId: number): Promise<{ message: string }> {
    // Verificar que el post existe
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Verificar si ya existe el like
    const existingLike = await this.likeRepository.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      throw new ConflictException('Ya has dado like a esta publicación');
    }

    // Crear el like
    const like = this.likeRepository.create({
      postId,
      userId,
    });

    const savedLike = await this.likeRepository.save(like);

    // Actualizar el contador de likes
    await this.postRepository.increment({ id: postId }, 'likesCount', 1);

    // Obtener el usuario que dio like para enviar información completa
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'firstName', 'lastName', 'alias'],
    });

    // Obtener el conteo actualizado de likes
    const updatedPost = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['likes'],
    });

    // Emitir evento WebSocket
    this.postsGateway.emitLikeAdded(postId, {
      id: savedLike.id,
      user: user,
      postId: postId,
      createdAt: savedLike.createdAt,
    });

    if (updatedPost) {
      this.postsGateway.emitLikeCountUpdate(postId, updatedPost.likes.length);
    }

    return { message: 'Like agregado exitosamente' };
  }

  async unlikePost(postId: number, userId: number): Promise<{ message: string }> {
    // Verificar que el post existe
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Verificar si existe el like
    const existingLike = await this.likeRepository.findOne({
      where: { postId, userId },
    });

    if (!existingLike) {
      throw new NotFoundException('No has dado like a esta publicación');
    }

    // Eliminar el like
    await this.likeRepository.remove(existingLike);

    // Actualizar el contador de likes
    await this.postRepository.decrement({ id: postId }, 'likesCount', 1);

    // Obtener el conteo actualizado de likes
    const updatedPost = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['likes'],
    });

    // Emitir eventos WebSocket
    this.postsGateway.emitLikeRemoved(postId, userId);
    if (updatedPost) {
      this.postsGateway.emitLikeCountUpdate(postId, updatedPost.likes.length);
    }

    return { message: 'Like removido exitosamente' };
  }

  async getPostsWithLikes(): Promise<any[]> {
    const posts = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .select([
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
      ])
      .orderBy('post.createdAt', 'DESC')
      .getMany();

    return posts;
  }
}