import { z } from 'zod';

export const intentionSchema = z.object({
  intention: z.enum(['partner', 'friendship', 'community', 'mentorship'], {
    required_error: 'Debes seleccionar una intención.',
  }),
});

export type IntentionFormData = z.infer<typeof intentionSchema>;
