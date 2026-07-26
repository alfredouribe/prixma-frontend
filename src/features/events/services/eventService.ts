import api from '../../../lib/api';
import type { Event, EventsFilters, EventsPage, RsvpStatus } from '../types/event.types';

interface LaravelPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const eventService = {
  async getEvents(filters: EventsFilters = {}): Promise<EventsPage> {
    const { data } = await api.get<{ data: Event[]; meta: LaravelPaginationMeta }>('/events', {
      params: filters,
    });
    return {
      events: data.data,
      meta: {
        currentPage: data.meta.current_page,
        lastPage: data.meta.last_page,
        perPage: data.meta.per_page,
        total: data.meta.total,
      },
    };
  },

  async getEvent(id: string): Promise<Event> {
    const { data } = await api.get<{ data: Event }>(`/events/${id}`);
    return data.data;
  },

  async rsvp(eventId: string, status: RsvpStatus): Promise<Event> {
    const { data } = await api.post<{ data: Event }>(`/events/${eventId}/rsvp`, { status });
    return data.data;
  },
};
