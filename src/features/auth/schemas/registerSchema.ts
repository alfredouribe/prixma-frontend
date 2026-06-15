import { z } from 'zod';

function computeAge(dateString: string): number {
  const today = new Date();
  const birth = new Date(dateString);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export const registerSchema = z
  .object({
    email: z.string().email('Correo inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string().min(1, 'Confirma tu contraseña'),
    date_of_birth: z
      .string()
      .min(1, 'Fecha requerida')
      .refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida')
      .refine(
        (val) => computeAge(val) >= 18,
        '⚠️ Debes tener al menos 18 años para usar Prixma.',
      ),
    terms_accepted: z
      .boolean()
      .refine((v) => v === true, 'Debes aceptar los Términos de uso de Prixma'),
    privacy_accepted: z
      .boolean()
      .refine(
        (v) => v === true,
        'Debes aceptar la Política de privacidad y el manejo de mis datos',
      ),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
