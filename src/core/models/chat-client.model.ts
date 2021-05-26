export interface ChatClient {
  // this is an interface, but also a domain model object
  id: string;
  nickname: string;
  typing?: boolean;
}
