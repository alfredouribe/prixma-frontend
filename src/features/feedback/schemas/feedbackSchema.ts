import { z } from 'zod';

// Mismo límite que el backend (`POST /feedback` → `message` max 2000, ver
// prompt de esta tarea). Mensaje de error exacto: brand/copies.md → "Mi
// perfil" → "Reportar un problema" → "Error de validación — mensaje vacío".
export const feedbackSchema = z.object({
  type: z.enum(['bug', 'comment']),
  message: z
    .string()
    .min(1, 'Escribe un mensaje antes de enviar.')
    .max(2000),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;
