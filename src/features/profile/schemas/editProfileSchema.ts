import { z } from 'zod';

export const editProfileSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  bio: z.string().max(300).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  intention: z.enum(['partner', 'friendship', 'community', 'mentorship']).optional(),
  gender_identity_ids: z.array(z.string().uuid()).optional(),
  orientation_ids: z.array(z.string().uuid()).optional(),
  pronoun_ids: z.array(z.string().uuid()).optional(),
  interest_ids: z.array(z.string().uuid()).optional(),
  custom_gender_identity: z.string().max(100).nullable().optional(),
  custom_orientation: z.string().max(100).nullable().optional(),
  custom_pronouns: z.string().max(100).nullable().optional(),
  custom_interests: z.string().max(200).nullable().optional(),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
