import { z } from 'zod';

export const safetySchema = z.object({
  selfie_verification_enabled: z.boolean(),
  incognito_mode_enabled: z.boolean(),
  geo_block_enabled: z.boolean(),
  reports_enabled: z.boolean(),
});

export type SafetyFormData = z.infer<typeof safetySchema>;
