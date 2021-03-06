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
  async addMessage(message: string, clientId: string): Promise<ChatMessage> {
    const clientDb = await this.clientRepository.findOne({id: clientId});
    const chatMessage: ChatMessage = { message: message, sender: clientDb };
    this.allMessages.push(chatMessage);
    return chatMessage;
  }

  async addClient(chatClient: ChatClient): Promise<ChatClient> {
    // finds the chatclient id in the db and returns it + if nickname found in db throw exception
    const chatClientFindById = await this.clientRepository.findOne({id: chatClient.id});
    if (chatClientFindById){
      return JSON.parse(JSON.stringify(chatClientFindById));
    }
    const chatClientFindByNickname = await this.clientRepository.findOne({nickname: chatClient.nickname});
    if (chatClientFindByNickname) {
      throw new Error('Error: Nickname already exists! Pick a new one ;)');
    } else if(!(chatClientFindByNickname && chatClientFindById)){
      //finally find client and return him
      let client = this.clientRepository.create();
      client.nickname = chatClient.nickname;
      client = await this.clientRepository.save(client);
      const newChatClient = JSON.parse(JSON.stringify(client));
      this.clients.push(newChatClient);
      return newChatClient;
    //video71
  }
  }

  async getAllClients(): Promise<ChatClient[]> {
    const clients = await this.clientRepository.find();
    // takes the list of clients converts into jsonstring and then parse to convert back to object
    const chatClients: ChatClient[] = JSON.parse(JSON.stringify(clients));
    return chatClients;
  }
/*
  async getClient(id: string): Promise<ChatClient> {
    const clientDb: Client = await this.clientRepository.findOne({ id: id });
    return clientDb;
  }
*/

  async getAllMessages(): Promise<ChatMessage[]> {
    return this.allMessages;
  }

  async deleteClient(id: string): Promise<void> {
    await this.clientRepository.delete({ id: id });
  }

  updateTyping(typing: boolean, id: string): ChatClient {
    const chatClient = this.clients.find((c) => c.id === id);
    if (chatClient && chatClient.typing !== typing) {
      chatClient.typing = typing;
      return chatClient;
    }
  }
}
