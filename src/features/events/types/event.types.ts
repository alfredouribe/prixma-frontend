// Shape real de `EventResource`/`EventService`/`EventController` (backend)
// — ver backend/app/Http/Resources/EventResource.php,
// backend/app/Services/EventService.php, backend/app/Http/Controllers/Api/
// Events/EventController.php. No confirmado por inspección: no hay tests
// backend que impriman el shape exacto de paginación de `GET /api/events`,
// pero `EventController@index` devuelve un `AnonymousResourceCollection`
// sobre un `LengthAwarePaginator` sin ningún wrapping custom (confirmado —
// no hay `Resource::wrap`/`withoutWrapping`/macro de paginación en el
// backend), así que sigue el shape default de Laravel:
// `{ data: [...], links: {...}, meta: { current_page, last_page, per_page,
// total, ... } }` — mismo patrón ya usado por `chatService.getMessages()`.

export type EventCategory = 'pride' | 'social' | 'art' | 'activism';

export type RsvpStatus = 'interested' | 'going' | 'not_going';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  event_date: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  external_link: string | null;
  image_url: string | null;
  // `not_going_count` nunca se expone (ver spec.md → "Estados de asistencia").
  interested_count: number;
  going_count: number;
  my_rsvp_status: RsvpStatus | null;
  created_at: string;
}

export interface EventsFilters {
  category?: EventCategory;
  date_from?: string;
  date_to?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  per_page?: number;
  page?: number;
}

export interface EventsPageMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface EventsPage {
  events: Event[];
  meta: EventsPageMeta;
}
