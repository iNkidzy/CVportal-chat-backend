import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  allMessages: string[] = [];
  clients: Map<string, string> = new Map<string, string>();
  @WebSocketServer() server;

  @SubscribeMessage('message')
  handleChatEvent(@MessageBody() message: string): string {
    console.log(message);
    this.allMessages.push(message);
    this.server.emit('newMessage', message);
    return message + 'Hello';
  }

  @SubscribeMessage('nickname')
  handleNicknameEvent(
    @MessageBody() nickname: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.clients.set(client.id, nickname);
    console.log('All Nicknames:', this.clients);
  }

  handleConnection(client: Socket, ...args: any[]): any {
    console.log('Client Connect', client.id);
    client.emit('allMessages', this.allMessages);
  }

  handleDisconnect(client: any): any {
    this.clients.delete(client.id);
    console.log('Client Disconnect', this.clients);
  }
}
