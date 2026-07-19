// Utilidades de formato de fecha/hora para Chat. No hay librería de fechas
// instalada en el proyecto (ver package.json) — se usa `Intl` nativo, sin
// agregar una dependencia nueva para un cálculo tan acotado.

/** Hora corta para el timestamp de cada burbuja de mensaje, ej. "10:32 a.m." */
export function formatMessageTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' }).format(date);
}

/**
 * Tiempo relativo compacto para la lista de conversaciones, ej. "2m", "3h",
 * "1d" — mismo formato que el mockup `design/chat/list.png`.
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Ahora';
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;

  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}sem`;
}
