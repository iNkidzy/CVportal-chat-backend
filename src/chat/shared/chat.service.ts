import { Injectable } from '@nestjs/common';
import { ChatClient } from './chat-client.model';
import { ChatMessage } from './chat-message.model';

@Injectable()
export class ChatService {
  allMessages: ChatMessage[] = [];
  clients: ChatClient[] = [];

  addMessage(message: string, clientId: string): ChatMessage {
    const client = this.clients.find((c) => c.id === clientId);
    const chatMessage: ChatMessage = { message: message, sender: client };
    this.allMessages.push(chatMessage);
    return chatMessage;
  }

  addClient(id: string, nickname: string): ChatClient {
    const chatClient: ChatClient = { id: id, nickname: nickname };
    this.clients.push(chatClient);
    return chatClient;
  }

  getAllClients(): ChatClient[] {
    return this.clients;
  }

  getAllMessages(): ChatMessage[] {
    return this.allMessages;
  }

  deleteClient(id: string): void {
    this.clients = this.clients.filter((c) => c.id !== id);
  }
}
