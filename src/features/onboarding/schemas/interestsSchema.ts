import { z } from 'zod';

export const interestsSchema = z
  .object({
    interest_ids: z.array(z.string().uuid()).default([]),
    custom_interests: z.array(z.string().min(1).max(50)).default([]),
  })
  .refine(
    (d) => {
      const fromCatalog = d.interest_ids?.length ?? 0;
      const fromCustom = d.custom_interests?.length ?? 0;
      return fromCatalog + fromCustom >= 3;
    },
    {
      message: 'Debes seleccionar al menos 3 intereses.',
      path: ['interest_ids'],
    },
  );

// Tipo explícito para evitar problemas de inferencia con zod refine + React Hook Form
export type InterestsFormData = {
  interest_ids: string[];
  custom_interests: string[];
};
