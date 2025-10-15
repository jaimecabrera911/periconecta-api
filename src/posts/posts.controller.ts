import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('posts')
@ApiBearerAuth('JWT-auth')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear un nuevo post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Post creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        content: { type: 'string', example: 'Este es mi primer post' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        author: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            alias: { type: 'string', example: 'juanp' },
            firstName: { type: 'string', example: 'Juan' },
            lastName: { type: 'string', example: 'Pérez' }
          }
        },
        likes: { type: 'array', items: { type: 'object' } },
        _count: {
          type: 'object',
          properties: {
            likes: { type: 'number', example: 0 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todos los posts' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de posts',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          content: { type: 'string', example: 'Este es mi primer post' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          author: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              alias: { type: 'string', example: 'juanp' },
              firstName: { type: 'string', example: 'Juan' },
              lastName: { type: 'string', example: 'Pérez' }
            }
          },
          likes: { type: 'array', items: { type: 'object' } },
          _count: {
            type: 'object',
            properties: {
              likes: { type: 'number', example: 5 }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll() {
    return this.postsService.findAll();
  }

  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener mis posts' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de posts del usuario autenticado',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          content: { type: 'string', example: 'Este es mi primer post' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          author: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              alias: { type: 'string', example: 'juanp' },
              firstName: { type: 'string', example: 'Juan' },
              lastName: { type: 'string', example: 'Pérez' }
            }
          },
          likes: { type: 'array', items: { type: 'object' } },
          _count: {
            type: 'object',
            properties: {
              likes: { type: 'number', example: 5 }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findMyPosts(@Request() req) {
    return this.postsService.findMyPosts(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener post por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID del post' })
  @ApiResponse({ 
    status: 200, 
    description: 'Post encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        content: { type: 'string', example: 'Este es mi primer post' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        author: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            alias: { type: 'string', example: 'juanp' },
            firstName: { type: 'string', example: 'Juan' },
            lastName: { type: 'string', example: 'Pérez' }
          }
        },
        likes: { type: 'array', items: { type: 'object' } },
        _count: {
          type: 'object',
          properties: {
            likes: { type: 'number', example: 5 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Post no encontrado' })
  async findOne(@Param('id') id: number) {
    return this.postsService.findOne(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Dar like a un post' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID del post' })
  @ApiResponse({ 
    status: 201, 
    description: 'Like agregado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        userId: { type: 'number', example: 1 },
        postId: { type: 'number', example: 1 },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Post no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya has dado like a este post' })
  async likePost(@Param('id') id: number, @Request() req) {
    return this.postsService.likePost(id, req.user.id);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Quitar like de un post' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID del post' })
  @ApiResponse({ 
    status: 200, 
    description: 'Like removido exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Like removido exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Post no encontrado o like no existe' })
  async unlikePost(@Param('id') id: number, @Request() req) {
    return this.postsService.unlikePost(id, req.user.id);
  }
}