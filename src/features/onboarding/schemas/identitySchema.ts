import { z } from 'zod';

export const identitySchema = z
  .object({
    display_name: z
      .string()
      .min(1, 'El nombre es requerido')
      .max(50, 'Máximo 50 caracteres'),
    gender_identity_ids: z.array(z.string().uuid()).optional().default([]),
    custom_gender_identity: z.string().max(100).optional(),
    orientation_ids: z.array(z.string().uuid()).optional().default([]),
    custom_orientation: z.string().max(100).optional(),
  })
  .refine(
    (d) =>
      (d.gender_identity_ids?.length ?? 0) > 0 ||
      (d.custom_gender_identity?.trim().length ?? 0) > 0,
    {
      message:
        'Debes seleccionar al menos una identidad de género o describirte con tus propias palabras.',
      path: ['gender_identity_ids'],
    },
  )
  .refine(
    (d) =>
      (d.orientation_ids?.length ?? 0) > 0 ||
      (d.custom_orientation?.trim().length ?? 0) > 0,
    {
      message:
        'Debes seleccionar al menos una orientación sexual o describirte con tus propias palabras.',
      path: ['orientation_ids'],
    },
  );

export type IdentityFormData = z.infer<typeof identitySchema>;
