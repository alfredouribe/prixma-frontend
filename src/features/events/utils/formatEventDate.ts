// Utilidades de formato de fecha para Eventos. Sin librería de fechas
// instalada en el proyecto (ver package.json) — mismo criterio ya usado en
// `features/chat/utils/formatChatTime.ts`: `Intl` nativo, sin dependencia nueva.

export interface EventDateBadge {
  day: string;
  month: string;
}

/** Badge corto de fecha para la card, ej. { day: '24', month: 'JUL' }. */
export function formatEventDateBadge(isoDate: string): EventDateBadge {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return { day: '--', month: '---' };

  return {
    day: new Intl.DateTimeFormat('es-MX', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('es-MX', { month: 'short' })
      .format(date)
      .replace('.', '')
      .toUpperCase(),
  };
}

/** Fecha + hora completa para el detalle, ej. "vie, 1 de ago, 8:00 p. m.". */
export function formatEventDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const datePart = new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' }).format(date);

  return `${datePart}, ${timePart}`;
}

/** Solo la hora, ej. "8:00 p. m." — usado en la meta line de la card. */
export function formatEventTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' }).format(date);
}

/**
 * Rango `date_from`/`date_to` (formato `YYYY-MM-DD`, el backend filtra con
 * `whereDate`) para el filtro rápido "Esta semana": hoy hasta +7 días.
 */
export function thisWeekRange(): { date_from: string; date_to: string } {
  const now = new Date();
  const to = new Date(now);
  to.setDate(to.getDate() + 7);
  return { date_from: toDateOnly(now), date_to: toDateOnly(to) };
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
