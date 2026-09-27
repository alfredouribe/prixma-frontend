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

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
}

interface RawReverseResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
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

function isRawReverseResult(value: unknown): value is RawReverseResult {
  return isNominatimPlace(value);
}

/**
 * El reverse geocode de Nominatim devuelve la dirección más específica del
 * punto exacto del GPS (calle, número, colonia...) en `display_name` — a
 * veces 150+ caracteres, muy por encima del límite de 100 de `city` en
 * `editProfileSchema.ts`. Como `EditProfileScreen` nunca mostraba
 * `errors.city`, guardar quedaba roto en silencio: el botón "Guardar"
 * (`form.handleSubmit`) simplemente no hacía nada, sin ningún mensaje — bug
 * real reportado por el humano 2026-09-27 (no reproducible en logcat/adb,
 * es una validación silenciosa, no un crash). Fix real: reconstruir un
 * label a nivel de ciudad ("Ciudad, Estado"), el mismo nivel de detalle que
 * ya devuelve `searchPlace()` para una búsqueda por texto — no solo subir
 * el límite del schema, que seguiría guardando una dirección completa como
 * si fuera una ciudad.
 */
function buildCityLabel(address: NominatimAddress | undefined, fallbackDisplayName: string): string {
  const cityLevel = address?.city ?? address?.town ?? address?.village ?? address?.municipality ?? address?.county;
  if (!cityLevel) return fallbackDisplayName.slice(0, 100);
  return [cityLevel, address?.state].filter(Boolean).join(', ');
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
    const url = `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!isRawReverseResult(data)) return null;
    return {
      display_name: buildCityLabel(data.address, data.display_name),
      lat: data.lat,
      lon: data.lon,
    };
  } catch {
    return null;
  }
}
