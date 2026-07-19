import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { reverseGeocode, searchPlace, type NominatimPlace } from '../../../lib/nominatim';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';

/** Debounce mínimo exigido por la política de uso de Nominatim (máx. 1 req/seg). */
const SEARCH_DEBOUNCE_MS = 450;
const MIN_QUERY_LENGTH = 2;
const LOCATION_ERROR_COPY = 'No se pudo obtener tu ubicación.';

interface CityPickerProps {
  value: string;
  latitude: number | null;
  longitude: number | null;
  onChange: (city: string, latitude: number | null, longitude: number | null) => void;
}

export function CityPicker({ value, latitude, longitude, onChange }: CityPickerProps) {
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Evita que un cambio de `value` disparado por una selección (sugerencia o GPS) o por
  // el montaje inicial (perfil ya tiene ciudad guardada) dispare una búsqueda de más.
  const skipNextSearchRef = useRef(true);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const query = value.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setShowNoResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      const results = await searchPlace(query);
      if (cancelled) return;
      setSuggestions(results);
      setShowNoResults(results.length === 0);
      setIsSearching(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value]);

  function handleChangeText(text: string) {
    // Regla de negocio (spec.md): editar el texto a mano invalida coordenadas previas.
    onChange(text, null, null);
  }

  function selectPlace(place: NominatimPlace) {
    skipNextSearchRef.current = true;
    setSuggestions([]);
    setShowNoResults(false);
    onChange(place.display_name, Number(place.lat), Number(place.lon));
  }

  const hasCoordinates = latitude !== null && longitude !== null;

  async function handleUseCurrentLocation() {
    setIsLocating(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(LOCATION_ERROR_COPY);
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const place = await reverseGeocode(position.coords.latitude, position.coords.longitude);
      if (!place) {
        setLocationError(LOCATION_ERROR_COPY);
        return;
      }
      selectPlace(place);
    } catch {
      setLocationError(LOCATION_ERROR_COPY);
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          placeholder="Buscar ciudad..."
          placeholderTextColor={text.tertiary}
          maxLength={100}
          testID="city-picker-input"
        />
        {isSearching && (
          <ActivityIndicator
            color={colors.purple}
            size="small"
            style={styles.spinner}
            testID="city-picker-searching"
          />
        )}
        {!isSearching && hasCoordinates && (
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={colors.green}
            style={styles.spinner}
            testID="city-picker-coordinates-indicator"
          />
        )}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsBox} testID="city-picker-suggestions">
          {suggestions.map((place) => (
            <TouchableOpacity
              key={`${place.lat}-${place.lon}`}
              style={styles.suggestionItem}
              onPress={() => selectPlace(place)}
              activeOpacity={0.7}
              testID={`city-picker-suggestion-${place.lat}-${place.lon}`}
            >
              <Ionicons name="location-outline" size={16} color={text.secondary} />
              <Text style={styles.suggestionText} numberOfLines={2}>
                {place.display_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showNoResults && (
        <Text style={styles.noResults}>No se encontraron resultados</Text>
      )}

      <TouchableOpacity
        style={styles.locationBtn}
        onPress={handleUseCurrentLocation}
        activeOpacity={0.7}
        disabled={isLocating}
        testID="city-picker-use-location"
      >
        {isLocating ? (
          <ActivityIndicator color={colors.purple} size="small" />
        ) : (
          <Ionicons name="locate-outline" size={16} color={colors.purple} />
        )}
        <Text style={styles.locationBtnText}>Usar mi ubicación actual</Text>
      </TouchableOpacity>

      {locationError && <Text style={styles.errorText}>{locationError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  inputRow: { position: 'relative', justifyContent: 'center' },
  input: {
    ...typography.body,
    color: text.primary,
    backgroundColor: surfaces.card,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  spinner: {
    position: 'absolute',
    right: spacing.lg,
  },
  suggestionsBox: {
    backgroundColor: surfaces.card,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: surfaces.border,
  },
  suggestionText: {
    ...typography.small,
    color: text.primary,
    flex: 1,
  },
  noResults: {
    ...typography.small,
    color: text.tertiary,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  locationBtnText: {
    ...typography.label,
    color: colors.purple,
    fontFamily: 'PoppinsRounded-SemiBold',
  },
  errorText: {
    ...typography.small,
    color: colors.rose,
  },
});
