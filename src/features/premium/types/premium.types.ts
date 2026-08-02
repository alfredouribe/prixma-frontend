export interface PremiumSettings {
  is_premium: boolean;
  free_swipes_per_ad: number;
  free_likes_per_day: number;
  free_chat_minutes_before_ad: number;
  chat_ad_video_url: string | null;
}
