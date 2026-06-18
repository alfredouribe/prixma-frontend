import { z } from 'zod';

export const pronounsSchema = z
  .object({
    pronoun_ids: z.array(z.string().uuid()).optional().default([]),
    custom_pronouns: z.string().max(100).optional(),
    photo_url: z.string().url().optional().nullable(),
  })
  .refine(
    (d) =>
      (d.pronoun_ids?.length ?? 0) > 0 ||
      (d.custom_pronouns?.trim().length ?? 0) > 0,
    {
      message:
        'Debes seleccionar al menos un pronombre o describirlo con tus propias palabras.',
      path: ['pronoun_ids'],
    },
  );

export type PronounsFormData = z.infer<typeof pronounsSchema>;
