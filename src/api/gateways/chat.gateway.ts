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
import { WelcomeDto } from '../dtos/welcome.dto';
import { Inject } from '@nestjs/common';
import {
  IChatService,
  IChatServiceProvider,
} from '../../core/primary-ports/chat.service.interface';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(IChatServiceProvider) private chatService: IChatService,
  ) {}
  @WebSocketServer() server;

  @SubscribeMessage('message')
  handleChatEvent(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ): void {
    const chatMessage = this.chatService.addMessage(message, client.id);
    this.server.emit('newMessage', chatMessage);
  }

  @SubscribeMessage('typing')
  handleTypingEvent(
    @MessageBody() typing: boolean,
    @ConnectedSocket() client: Socket,
  ): void {
    const chatClient = this.chatService.updateTyping(typing, client.id);
    if (chatClient) {
      this.server.emit('clientTyping', chatClient);
    }
  }

  @SubscribeMessage('nickname')
  async handleNicknameEvent(
    @MessageBody() nickname: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const chatClient = await this.chatService.addClient(client.id, nickname);
      console.log('chatClient', chatClient);
      const welcome: WelcomeDto = {
        clients: this.chatService.getAllClients(),
        messages: this.chatService.getAllMessages(),
        client: chatClient,
      };
      client.emit('welcome', welcome);
      this.server.emit('clients', this.chatService.getAllClients());
    } catch (e) {
      client.error(e.message);
    }
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
