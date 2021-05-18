import { ChatMessage } from '../models/chat-message.model';
import { ChatClient } from '../models/chat-client.model';

export const IChatServiceProvider = 'IChatServiceProvider';
export interface IChatService {
  addMessage(message: string, clientId: string): ChatMessage;

  addClient(chatClient: ChatClient): Promise<ChatClient>;

  getAllClients(): Promise<ChatClient[]>;

  getAllMessages(): ChatMessage[];

  deleteClient(id: string): Promise<void>;

  updateTyping(typing: boolean, id: string): ChatClient;
}
