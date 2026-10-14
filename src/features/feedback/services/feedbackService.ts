import api from '../../../lib/api';
import type { SubmitFeedbackPayload } from '../types/feedback.types';

export const feedbackService = {
  async submit(payload: SubmitFeedbackPayload): Promise<void> {
    await api.post('/feedback', payload);
  },
};
