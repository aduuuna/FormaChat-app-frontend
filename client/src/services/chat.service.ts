import { apiDelete, apiGet, apiPost } from '../utils/api.utils';
import { CHAT_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../config/api.config';
import type {
  ChatSession,
  ContactLead,
  SessionListResponse,
  LeadListResponse,
  SessionDetailsResponse,
  SessionFilters,
  LeadFilters
} from '../types/chat.types';


export const createChatSession = async (businessId: string): Promise<{
  sessionId: string;
  visitorId: string;
  businessInfo: {
    businessName: string;
    chatbotGreeting?: string;
    chatbotTone?: string;
  };
}> => {
  console.log('[ChatService] Creating session for business:', businessId);

  const response = await apiPost(CHAT_ENDPOINTS.SESSION_CREATE, {
    businessId
  });

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to create chat session');
  }

  console.log('[ChatService] ✓ Session created:', response.data.sessionId);
  return response.data;
};


export const sendChatMessage = async (
  sessionId: string,
  message: string
): Promise<{
  message: {
    role: string;
    content: string;
    timestamp: string;
  };
  contactCaptured: boolean;
}> => {
  console.log('[ChatService] Sending message to session:', sessionId);

  const response = await apiPost(
    CHAT_ENDPOINTS.SESSION_MESSAGE(sessionId),
    { message }
  );

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to send message');
  }

  return response.data;
};


export const getChatMessages = async (
  sessionId: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}> => {
  console.log('[ChatService] Fetching messages for session:', sessionId);

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await apiGet(
    `${CHAT_ENDPOINTS.SESSION_MESSAGES(sessionId)}?${params.toString()}`
  );

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to fetch messages');
  }

  return response.data;
};


export const endChatSession = async (sessionId: string): Promise<void> => {
  console.log('[ChatService] Ending session:', sessionId);

  const response = await apiPost(CHAT_ENDPOINTS.SESSION_END(sessionId), {});

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to end session');
  }

  console.log('[ChatService] ✓ Session ended');
};


export const getChatSession = async (sessionId: string): Promise<{
  sessionId: string;
  businessId: string;
  status: string;
  messageCount: number;
  contactCaptured: boolean;
  contact?: {
    email?: string;
    phone?: string;
    name?: string;
  };
}> => {
  console.log('[ChatService] Fetching session:', sessionId);

  const response = await apiGet(CHAT_ENDPOINTS.SESSION_GET(sessionId));

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to fetch session');
  }

  return response.data;
};


export const getBusinessSessions = async (
  businessId: string,
  filters?: SessionFilters,
  page: number = 1,
  limit: number = 20
): Promise<ChatSession[]> => {
  console.log('[ChatService] Fetching sessions for business:', businessId);

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (filters?.status) {
    params.append('status', filters.status);
  }

  if (filters?.contactCaptured !== undefined) {
    params.append('contactCaptured', filters.contactCaptured.toString());
  }

  if (filters?.startDate) {
    params.append('startDate', filters.startDate.toISOString());
  }

  if (filters?.endDate) {
    params.append('endDate', filters.endDate.toISOString());
  }

  const url = `${CHAT_ENDPOINTS.BUSINESS_SESSIONS(businessId)}?${params.toString()}`;

  const response: ApiResponse<SessionListResponse> = await apiGet(url);

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to fetch sessions');
  }

  console.log('[ChatService] ✓ Fetched', response.data.sessions.length, 'sessions');
  return response.data.sessions;
};


export const getBusinessLeads = async (
  businessId: string,
  filters?: LeadFilters,
  page: number = 1,
  limit: number = 50
): Promise<ContactLead[]> => {
  console.log('[ChatService] Fetching leads for business:', businessId);

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (filters?.status) {
    params.append('status', filters.status);
  }

  if (filters?.startDate) {
    params.append('startDate', filters.startDate.toISOString());
  }

  if (filters?.endDate) {
    params.append('endDate', filters.endDate.toISOString());
  }

  const url = `${CHAT_ENDPOINTS.BUSINESS_LEADS(businessId)}?${params.toString()}`;

  const response: ApiResponse<LeadListResponse> = await apiGet(url);

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to fetch leads');
  }

  console.log('[ChatService] ✓ Fetched', response.data.leads.length, 'leads');
  return response.data.leads;
};


export const getSessionDetails = async (
  businessId: string,
  sessionId: string
): Promise<SessionDetailsResponse> => {
  console.log('[ChatService] Fetching session details:', sessionId);

  const url = CHAT_ENDPOINTS.BUSINESS_SESSION_DETAILS(businessId, sessionId);

  const response: ApiResponse<SessionDetailsResponse> = await apiGet(url);

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to fetch session details');
  }

  console.log('[ChatService] ✓ Fetched session with', response.data.messages.length, 'messages');
  return response.data;
};


export interface AnalyticsSummary {
  totalSessions: number;
  activeSessions: number;
  totalLeads: number;
  totalMessages: number;
  conversionRate: number; 
}

export const getAnalyticsSummary = async (
  businessId: string
): Promise<AnalyticsSummary> => {
  console.log('[ChatService] Fetching analytics summary for:', businessId);

  try {
   
    const [allSessions, leads] = await Promise.all([
      getBusinessSessions(businessId, undefined, 1, 100),
      getBusinessLeads(businessId, undefined, 1, 100)
      
    ]);

    const activeSessions = allSessions.filter(s => s.status === 'active').length;
    const totalMessages = allSessions.reduce((sum, s) => sum + s.messageCount, 0);
    const sessionsWithContact = allSessions.filter(s => s.contact?.captured).length;
    const conversionRate = allSessions.length > 0 
      ? (sessionsWithContact / allSessions.length) * 100 
      : 0;

    return {
      totalSessions: allSessions.length,
      activeSessions,
      totalLeads: leads.length,
      totalMessages,
      conversionRate: Math.round(conversionRate)
    };
  } catch (error) {
    console.error('[ChatService] Failed to get analytics summary:', error);
    throw error;
  }
};

export const getDashboardSummary = async (
  businessId: string
): Promise<{
  sessions: ChatSession[];
  leads: ContactLead[];
  analytics: AnalyticsSummary;
}> => {
  console.log('[ChatService] Fetching dashboard summary for:', businessId);

  const response = await apiGet(
    CHAT_ENDPOINTS.BUSINESS_DASHBOARD_SUMMARY(businessId)
  );

  if (!response.success) {
    throw new Error(response.error.message || 'Failed to fetch dashboard summary');
  }

  console.log('[ChatService] ✓ Dashboard summary retrieved');
  return response.data;
};

export const deleteSession = async (
  businessId: string,
  sessionId: string 
): Promise<{success: boolean; error?: any}> => {
  console.log('[ChatService] Deleting session:', sessionId);

  const response = await apiDelete(
    CHAT_ENDPOINTS.SESSION_DELETE(businessId, sessionId)
  );

  if (response.success === false){
    return {
      success: false,
      error: response.error
    }
  }
  console.log('[ChatService] ✓ Session deleted');
  return {success:true};
}


export default {
  getBusinessSessions,
  getBusinessLeads,
  getSessionDetails,
  getAnalyticsSummary
};