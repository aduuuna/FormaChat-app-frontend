export type SessionStatus = 'active' | 'ended' | 'abandoned';

export type MessageRole = 'user' | 'assistant' | 'system';

export type IntentType = 'enquiry' | 'booking' | 'purchase' | 'support';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'spam';

export interface ContactInfo {
  captured: boolean;
  email?: string;
  phone?: string;
  name?: string;
  capturedAt?: Date;
  capturedInMessageId?: string;
}

export interface Intent {
  type: IntentType;
  confidence?: number;
  detectedAt?: Date;
}

export interface AgentHandoff {
  isHandedOff: boolean;
  agentType?: string;
  handOffAt?: Date;
  completedAt?: Date;
}

export interface ChatSession {
  sessionId: string;
  businessId: string;
  visitorId?: string;
  contact: ContactInfo;
  status: SessionStatus;
  startedAt: Date;
  lastMessageAt: Date;
  endedAt?: Date;
  messageCount: number;
  userMessageCount: number;
  botMessageCount: number;
  intent?: Intent;
  agentHandoff?: AgentHandoff;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  hasUnreadMessages: boolean;
  isStarred: boolean;
  tags: string[];
  deletedAt?: Date;
}

export interface ChatMessage {
  _id?: string;
  sessionId: string;
  businessId: string;
  role: MessageRole;
  content: string;
  extractedContact?: {
    email?: string;
    phone?: string;
    name?: string;
    confidence?: number;
  };
  llmModel?: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  latency?: number;
  vectorsUsed?: Array<{
    chunkId: string;
    relevanceScore: number;
    sourceType: 'questionnaire' | 'document' | 'image';
  }>;
  timestamp: Date;
}

export interface ContactLead {
  _id: string;
  businessId: string;
  email?: string;
  phone?: string;
  name?: string;
  firstSessionId: string;
  lastSessionId: string;
  firstContactDate: Date;
  lastContactDate: Date;
  totalSessions: number;
  totalMessages: number;
  status: LeadStatus;
  leadScore?: number;
  tags: string[];
  notes?: string;
  firstSource?: string;
  capturedIntent?: string;
  isStarred: boolean;
  assignedTo?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionRequest {
  businessId: string;
  visitorId?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  visitorId: string;
  businessInfo: {
    businessName: string;
    chatbotGreeting?: string;
    chatbotTone: string;
  };
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
  contactCaptured: boolean;
}


export interface GetMessagesResponse {
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SessionListResponse {
  sessions: ChatSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LeadListResponse {
  leads: ContactLead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SessionDetailsResponse {
  session: ChatSession;
  messages: ChatMessage[];
}

export interface SessionFilters {
  status?: SessionStatus;
  contactCaptured?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface LeadFilters {
  status?: LeadStatus;
  startDate?: Date;
  endDate?: Date;
}