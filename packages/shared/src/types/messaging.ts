export type ChannelType =
  | "whatsapp"
  | "instagram"
  | "telegram"
  | "facebook"
  | "tiktok"
  | "twitter"
  | "gmail";

export type ChannelConnectionStatus =
  | "disconnected"
  | "connecting"
  | "qr"
  | "phone"
  | "code"
  | "password"
  | "connected"
  | "error";

export interface ChannelSession {
  businessId: string;
  channel: ChannelType;
  status: ChannelConnectionStatus;
  phone?: string;
  name?: string;
  error?: string;
}

export type MessageType = "text" | "image" | "video" | "audio" | "document" | "sticker" | "other";

export interface UnifiedMessage {
  id: string;
  businessId: string;
  channel: ChannelType;
  chatJid: string;
  fromMe: boolean;
  senderName?: string;
  type: MessageType;
  body: string;
  mediaPath?: string;
  timestamp: number;
  status?: string;
}

export interface Conversation {
  businessId: string;
  channel: ChannelType;
  jid: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessageBody?: string;
  lastMessageType?: MessageType;
  lastMessageAt?: number;
  lastMessageFromMe?: boolean;
}
