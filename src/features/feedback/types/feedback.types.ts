export type FeedbackType = 'bug' | 'comment';

export interface SubmitFeedbackPayload {
  type: FeedbackType;
  message: string;
  app_version?: string;
  platform?: 'ios' | 'android';
}
