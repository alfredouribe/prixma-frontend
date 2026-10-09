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
    // "¿A quién te gustaría conocer?" — ver features/matching/specs/spec.md
    // → "Compatibilidad de género". A diferencia de identidad/orientación,
    // no acepta texto libre: es un selector estructurado, no una
    // descripción de identidad. default(false) obliga a una elección
    // consciente (ni el chip "Todes" ni ningún id de catálogo vienen
    // premarcados), mismo criterio que el resto de los campos de este
    // paso, que arrancan vacíos.
    interested_in_all_genders: z.boolean().optional().default(false),
    interested_gender_identity_ids: z.array(z.string().uuid()).optional().default([]),
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
  )
  .refine(
    (d) => d.interested_in_all_genders === true || (d.interested_gender_identity_ids?.length ?? 0) > 0,
    {
      message: 'Selecciona a quién te gustaría conocer, o marca "Todes / sin preferencia".',
      path: ['interested_gender_identity_ids'],
    },
  );

export type IdentityFormData = z.infer<typeof identitySchema>;
