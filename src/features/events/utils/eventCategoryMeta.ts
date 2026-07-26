import type { EventCategory } from '../types/event.types';

// Copy exacto: brand/copies.md → "Eventos" → Categorías.
export const CATEGORY_LABELS: Record<EventCategory, string> = {
  pride: 'Pride',
  social: 'Social',
  art: 'Arte',
  activism: 'Activismo',
};

// Emoji de respaldo cuando el evento no tiene `image_url` — criterio visual
// propio (no es copy/texto de interfaz), ver
// features/events/specs/tasks.md → FRONTEND, nota sobre `EventCard`.
export const CATEGORY_EMOJI: Record<EventCategory, string> = {
  pride: '🏳️‍🌈',
  social: '🎉',
  art: '🎨',
  activism: '✊',
};
