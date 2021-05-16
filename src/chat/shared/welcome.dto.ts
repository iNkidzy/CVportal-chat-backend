import { ChatClient } from './chat-client.model';
import { ChatMessage } from './chat-message.model';

export interface WelcomeDto {
  // DTO = Data transfer objects, it is
  // data that transfers from the backend to the frontend in a joined package
  clients: ChatClient[]; //Gives me list of chat clients
  client: ChatClient; //Gives me the client that just entered/Entered Nickname
  messages: ChatMessage[]; //Gives me all the messages available (from the chatMessage[])
}
