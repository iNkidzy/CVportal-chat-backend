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
import { JoinChatDto } from "../dtos/join-chat.dto";
import { ChatClient } from "../../core/models/chat-client.model";

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

  @SubscribeMessage('joinChat')
  async handleJoinChatEvent(
    @MessageBody() joinChatClientDto: JoinChatDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      let chatClient: ChatClient = JSON.parse(JSON.stringify(joinChatClientDto));
      chatClient = await this.chatService.addClient(chatClient);
      const chatClients = await this.chatService.getAllClients();
      const welcome: WelcomeDto = {
        clients: chatClients,
        messages: this.chatService.getAllMessages(),
        client: chatClient,
      };
      client.emit('welcome', welcome);
      this.server.emit('clients', chatClients);
    } catch (e) {
      client.error(e.message);
    }
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<any> {
    client.emit('allMessages', this.chatService.getAllMessages());
    this.server.emit('clients', await this.chatService.getAllClients());
  }

  async handleDisconnect(client: any): Promise<any> {
    await this.chatService.deleteClient(client.id);
    this.server.emit('clients', await this.chatService.getAllClients());
  }
}
