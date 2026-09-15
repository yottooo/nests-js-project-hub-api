import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('joinProject')
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { projectId: number },
  ) {
    const { projectId } = payload;
    await client.join(this.roomName(projectId));
    return { event: 'joinedProject', data: { projectId } };
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { projectId: number; text: string },
  ) {
    const { projectId, text } = payload;
    this.server.to(this.roomName(projectId)).emit('newMessage', {
      projectId,
      text,
      senderId: client.id,
      sentAt: new Date(),
    });
  }

  private roomName(projectId: number): string {
    return `project-${projectId}`;
  }
}
