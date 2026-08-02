// Shapes reales de `ConversationResource`/`MessageResource`
// (backend/app/Http/Resources/{ConversationResource,MessageResource}.php)
// y de `ChatService` (backend/app/Services/ChatService.php) — verificadas
// en el código fuente, no asumidas. Ver features/chat/specs/plan.md.

export type ConversationType = 'match' | 'request';

export type ConversationStatus = 'active' | 'pending' | 'rejected' | 'blocked';

export interface ConversationOtherUser {
  id: string;
  display_name: string;
  photo: string | null;
  pronouns: string[];
}

export interface ConversationLastMessage {
  content: string;
  sender_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  status: ConversationStatus;
  other_user: ConversationOtherUser | null;
  last_message: ConversationLastMessage | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface ConversationsInbox {
  matches: Conversation[];
  requests: Conversation[];
}

export interface MessagesPage {
  messages: Message[];
  currentPage: number;
  lastPage: number;
  total: number;
}

export interface SendRequestPayload {
  receiver_id: string;
  content: string;
}

// Payload del evento Reverb `MessageSent` — se transmite tanto al canal
// `conversation.{id}` (hilo abierto) como a `App.Models.User.{recipientId}`
// (toast in-app global, ver features/chat/specs/plan.md → "Toast in-app de
// mensaje nuevo"). Mismo payload en ambos canales — ver
// app/Events/MessageSent.php → `broadcastWith()`.
export interface MessageSentPayload {
  message: Message;
  conversation_id: string;
  sender_name: string;
  sender_photo: string | null;
  preview: string;
}
