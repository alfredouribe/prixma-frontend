import { z } from 'zod';

export const editProfileSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  bio: z.string().max(300).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  intention: z.enum(['partner', 'friendship', 'community', 'mentorship']).optional(),
  gender_identity_ids: z.array(z.string().uuid()).optional(),
  orientation_ids: z.array(z.string().uuid()).optional(),
  pronoun_ids: z.array(z.string().uuid()).optional(),
  interest_ids: z.array(z.string().uuid()).optional(),
  custom_gender_identity: z.string().max(100).nullable().optional(),
  custom_orientation: z.string().max(100).nullable().optional(),
  custom_pronouns: z.string().max(100).nullable().optional(),
  custom_interests: z.string().max(200).nullable().optional(),
  // "¿A quién te gustaría conocer?" — ver features/matching/specs/spec.md →
  // "Compatibilidad de género". Igual que el resto de catálogos de este
  // schema (gender_identity_ids, orientation_ids, etc.), sin `.refine()`
  // cruzado — el backend (`UpdateProfileRequest`) tampoco lo exige en este
  // endpoint (`sometimes`), a diferencia del paso de Onboarding.
  interested_in_all_genders: z.boolean().optional(),
  interested_gender_identity_ids: z.array(z.string().uuid()).optional(),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
