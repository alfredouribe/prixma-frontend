import * as Location from 'expo-location';

// `Location.getCurrentPositionAsync()` no expone una opción de timeout
// propia (verificado en los tipos de `expo-location` instalado) — si el
// dispositivo no logra un fix de ubicación (típico en un AVD de Android sin
// ubicación configurada, o con GPS/red apagados), la promesa nunca se
// resuelve ni rechaza y la UI que la espera queda "pensando" para siempre.
// Reportado por el humano 2026-08-03 en el flujo de bloqueo geográfico
// (`GeoBlockMap.tsx`); mismo patrón vulnerable encontrado en
// `CityPicker.tsx` — centralizado aquí para no duplicar la lógica de
// timeout en los dos lugares.
const LOCATION_TIMEOUT_MS = 10_000;

export async function getCurrentPositionWithTimeout(
  options: Location.LocationOptions = {},
): Promise<Location.LocationObject> {
  let timeoutId: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([
      Location.getCurrentPositionAsync(options),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('location-timeout')), LOCATION_TIMEOUT_MS);
      }),
    ]);
  } finally {
    // Limpia el timer sin importar cuál de las dos promesas ganó la
    // carrera — evita dejarlo pendiente (relevante sobre todo en tests).
    clearTimeout(timeoutId!);
  }
}
