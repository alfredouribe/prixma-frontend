export interface PremiumSettings {
  is_premium: boolean;
  // Fecha cruda de expiración del Premium otorgado por paquete — null si
  // nunca se otorgó uno o si ya expiró. Solo mostrar "activo hasta X" si
  // viene presente Y en el futuro; en cualquier otro caso con is_premium
  // true, mostrar "activo" a secas (toggle manual o suscripción, ninguno
  // trae fecha aquí).
  premium_until: string | null;
  free_swipes_per_ad: number;
  free_likes_per_day: number;
  free_chat_minutes_before_ad: number;
  chat_ad_video_url: string | null;
  rewind_credits: number;
  extra_super_likes: number;
}
