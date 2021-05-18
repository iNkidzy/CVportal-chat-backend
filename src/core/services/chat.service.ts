import { Injectable } from '@nestjs/common';
import { ChatClient } from '../models/chat-client.model';
import { ChatMessage } from '../models/chat-message.model';
import { IChatService } from '../primary-ports/chat.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '../../infrastructure/client.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService implements IChatService {
  allMessages: ChatMessage[] = [];
  clients: ChatClient[] = [];
  constructor(
    @InjectRepository(Client) private clientRepository: Repository<Client>,
  ) {}
  addMessage(message: string, clientId: string): ChatMessage {
    const client = this.clients.find((c) => c.id === clientId);
    const chatMessage: ChatMessage = { message: message, sender: client };
    this.allMessages.push(chatMessage);
    return chatMessage;
  }

  async addClient(id: string, nickname: string): Promise<ChatClient> {
    // finding the one and only in db
    const clientDb = await this.clientRepository.findOne({
      nickname: nickname,
    });
    if (clientDb) {
      let client = this.clientRepository.create();
      client.id = id;
      client.nickname = nickname;
      client = await this.clientRepository.save(client);
      return { id: '' + client.id, nickname: client.nickname };
    }
    if (clientDb.id === id) {
      return { id: clientDb.id, nickname: clientDb.nickname };
    } else {
      throw new Error('Error: Nickname already exists! Pick a new one ;)');
    }
  }

  getAllClients(): ChatClient[] {
    return this.clients;
  }

  getAllMessages(): ChatMessage[] {
    return this.allMessages;
  }

  async deleteClient(id: string): Promise<void> {
    this.clients = this.clients.filter((c) => c.id !== id);
  }

  updateTyping(typing: boolean, id: string): ChatClient {
    const chatClient = this.clients.find((c) => c.id === id);
    if (chatClient && chatClient.typing !== typing) {
      chatClient.typing = typing;
      return chatClient;
    }
  }
}
