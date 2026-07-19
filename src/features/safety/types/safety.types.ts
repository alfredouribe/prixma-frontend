// Motivos de reporte — mismo enum que `ReportRequest` en el backend
// (app/Http/Requests/Safety/ReportRequest.php) y que
// features/safety/specs/spec.md → "Reportar perfil".
export type ReportReason =
  | 'harassment'
  | 'discrimination'
  | 'fake_profile'
  | 'inappropriate_content'
  | 'other';

export interface CreateReportPayload {
  reported_id: string;
  reason: ReportReason;
  description?: string | null;
}

export interface BlockedUserSummary {
  id: string;
  display_name: string;
  photo: string | null;
}

// Shape real de `BlockResource` — el `id` es el id del registro `blocks`
// (necesario para desbloquear vía DELETE /safety/blocks/{uuid}), no el id
// del usuario bloqueado (ese vive en `blocked_user.id`).
export interface Block {
  id: string;
  blocked_user: BlockedUserSummary | null;
  created_at: string;
}

export interface CreateBlockPayload {
  blocked_id: string;
}

// Shape real de `GeoBlockResource`.
export interface GeoBlock {
  id: string;
  label: string | null;
  latitude: number;
  longitude: number;
  radius_km: number;
  created_at: string;
}

export interface CreateGeoBlockPayload {
  label?: string | null;
  latitude: number;
  longitude: number;
  radius_km: number;
}
