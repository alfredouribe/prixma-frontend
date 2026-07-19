/**
 * Cliente compartido para OpenStreetMap/Nominatim (geocoding gratuito, sin API key).
 *
 * Usa `fetch` nativo a propósito, NO el cliente Axios central (`src/lib/api.ts`) — Nominatim
 * es un servicio externo sin relación con la API de Prixma, la regla de "nunca usar fetch()"
 * de `constitution.md`/`conventions/backend.md` aplica solo a llamadas a la API propia.
 *
 * Política de uso obligatoria de Nominatim (servicio público gratuito, ver
 * https://operations.osmfoundation.org/policies/nominatim/):
 * - Máximo 1 request/segundo — la responsabilidad de hacer debounce vive en el componente
 *   que consume `searchPlace` (ver `features/profile/components/CityPicker.tsx`).
 * - Header `User-Agent` identificando la app, siempre presente en ambas funciones.
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'Prixma/1.0 (contacto@prixma.app)';

export interface NominatimPlace {
  display_name: string;
  lat: string;
  lon: string;
}

function isNominatimPlace(value: unknown): value is NominatimPlace {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.display_name === 'string' &&
    typeof candidate.lat === 'string' &&
    typeof candidate.lon === 'string'
  );
}

/**
 * Búsqueda por texto (forward geocoding). Alimenta la lista de sugerencias mientras el
 * usuario escribe. Si la petición falla (red, 4xx/5xx) o la respuesta no tiene el shape
 * esperado, retorna `[]` — el componente decide qué mostrar (ej. "No se encontraron
 * resultados").
 */
export async function searchPlace(query: string): Promise<NominatimPlace[]> {
  try {
    const url = `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return [];
    return data.filter(isNominatimPlace);
  } catch {
    return [];
  }
}

/**
 * Geocoding inverso. Alimenta el botón "Usar mi ubicación actual" (coordenadas del GPS
 * del dispositivo vía `expo-location`). Si la petición falla o no hay resultado, retorna
 * `null`.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<NominatimPlace | null> {
  try {
    const url = `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lon}&format=json`;
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return isNominatimPlace(data) ? data : null;
  } catch {
    return null;
  }
}
