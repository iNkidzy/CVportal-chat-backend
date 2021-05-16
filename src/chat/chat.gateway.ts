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
import { WelcomeDto } from './shared/welcome.dto';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private chatService: ChatService) {}
  @WebSocketServer() server;

  @SubscribeMessage('message')
  handleChatEvent(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(message);
    const chatMessage = this.chatService.addMessage(message, client.id);
    this.server.emit('newMessage', chatMessage);
  }

  @SubscribeMessage('nickname')
  handleNicknameEvent(
    @MessageBody() nickname: string,
    @ConnectedSocket() client: Socket,
  ): void {
    const chatClient = this.chatService.addClient(client.id, nickname);
    const welcome: WelcomeDto = {
      clients: this.chatService.getAllClients(),
      messages: this.chatService.getAllMessages(),
      client: chatClient,
    };
    client.emit('welcome', welcome);
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
