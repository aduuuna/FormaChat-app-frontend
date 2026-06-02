import { apiPost } from '../utils/api.utils';
import { AUTH_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../config/api.config';

export interface SubmitFeedbackRequest {
  message: string;
}

export interface SubmitFeedbackResponse {
  message: string;
}

export const submitFeedback = async (
  message: string
): Promise<ApiResponse<SubmitFeedbackResponse>> => {
  console.log('[FeedbackService] Submitting feedback');

  if (!message || message.trim().length === 0) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Feedback message is required'
      }
    };
  }

  if (message.length > 5000) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Feedback message is too long (max 5000 characters)'
      }
    };
  }

  return await apiPost<SubmitFeedbackResponse>(
    `${AUTH_ENDPOINTS.FEEDBACK}`, 
    { message: message.trim() }
  );
};