import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PostsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('PostsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Emitir evento cuando se agrega un like
  emitLikeAdded(postId: number, likeData: any) {
    this.server.emit('likeAdded', {
      postId,
      like: likeData,
      timestamp: new Date(),
    });
  }

  // Emitir evento cuando se quita un like
  emitLikeRemoved(postId: number, userId: number) {
    this.server.emit('likeRemoved', {
      postId,
      userId,
      timestamp: new Date(),
    });
  }

  // Emitir evento con el conteo actualizado de likes
  emitLikeCountUpdate(postId: number, likeCount: number) {
    this.server.emit('likeCountUpdate', {
      postId,
      likeCount,
      timestamp: new Date(),
    });
  }
}