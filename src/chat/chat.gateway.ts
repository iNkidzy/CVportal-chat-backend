import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './shared/chat.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private chatService: ChatService) {}
  @WebSocketServer() server;

  @SubscribeMessage('message')
  handleChatEvent(@MessageBody() message: string): void {
    console.log(message);
    this.chatService.addMessage(message);
    this.server.emit('newMessage', message);
  }

  @SubscribeMessage('nickname')
  handleNicknameEvent(
    @MessageBody() nickname: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.chatService.addClient(client.id, nickname);
    console.log('All Nicknames:', this.chatService.getAllClients());
    this.server.emit('clients', this.chatService.getAllClients());
  }

  handleConnection(client: Socket, ...args: any[]): any {
    console.log('Client Connect', client.id);
    client.emit('allMessages', this.chatService.getAllMessages());
    this.server.emit('clients', this.chatService.getAllClients());
  }

  handleDisconnect(client: any): any {
    this.chatService.deleteClient(client.id);
    this.server.emit('clients', this.chatService.getAllClients());
  }
}
