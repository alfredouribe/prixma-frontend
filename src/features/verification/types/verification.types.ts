/**
 * Estado de la VerificationRequest más reciente del perfil (fuente de
 * auditoría). Distinto de `profile.verification_status` (caché rápida en
 * Profile), que usa 'verified' en vez de 'approved' — ver plan.md.
 */
export type VerificationRequestStatus = 'pending' | 'approved' | 'rejected';

/** Tipo de archivo que se sube al bucket privado de verificación. */
export type VerificationDocumentType = 'document' | 'selfie';

export interface VerificationStatusData {
  id: string;
  status: VerificationRequestStatus;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface VerificationPresignedUrl {
  upload_url: string;
  key: string;
}
