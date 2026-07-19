import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import type { CreateGeoBlockPayload } from '../types/safety.types';

const DEFAULT_RADIUS_KM = 5;
const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 50;

interface GeoBlockMapProps {
  visible: boolean;
  isSaving?: boolean;
  onSave: (payload: CreateGeoBlockPayload) => void;
  onClose: () => void;
}

export function GeoBlockMap({ visible, isSaving = false, onSave, onClose }: GeoBlockMapProps) {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [label, setLabel] = useState('');
  const [locationError, setLocationError] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    async function loadLocation() {
      setIsLocating(true);
      setLocationError(false);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) setLocationError(true);
          return;
        }
        const position = await Location.getCurrentPositionAsync({});
        if (!cancelled) {
          setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        }
      } catch {
        if (!cancelled) setLocationError(true);
      } finally {
        if (!cancelled) setIsLocating(false);
      }
    }

    loadLocation();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  function handleClose() {
    setLabel('');
    setRadiusKm(DEFAULT_RADIUS_KM);
    setCoords(null);
    onClose();
  }

  function handleSave() {
    if (!coords) return;
    onSave({
      label: label.trim() || null,
      latitude: coords.latitude,
      longitude: coords.longitude,
      radius_km: radiusKm,
    });
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.7} testID="geoblock-close-btn">
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.mapWrap}>
          {isLocating && (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.purple} size="large" />
            </View>
          )}

          {!isLocating && locationError && (
            <View style={styles.centered}>
              <Text style={styles.errorText}>No se pudo obtener tu ubicación.</Text>
            </View>
          )}

          {!isLocating && !locationError && coords && (
            <MapView
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              testID="geoblock-map"
            >
              <Marker coordinate={coords} />
              <Circle
                center={coords}
                radius={radiusKm * 1000}
                fillColor="rgba(155, 93, 255, 0.15)"
                strokeColor={colors.purple}
              />
            </MapView>
          )}
        </View>

        <View style={styles.controls}>
          <TextInput
            style={styles.labelInput}
            value={label}
            onChangeText={setLabel}
            maxLength={100}
            placeholder="Nombre de la zona (opcional)"
            placeholderTextColor={text.tertiary}
            testID="geoblock-label-input"
          />

          <Text style={styles.radiusValue}>{radiusKm} km</Text>
          <Slider
            style={styles.slider}
            minimumValue={MIN_RADIUS_KM}
            maximumValue={MAX_RADIUS_KM}
            step={1}
            value={radiusKm}
            onValueChange={setRadiusKm}
            minimumTrackTintColor={colors.purple}
            maximumTrackTintColor={surfaces.border}
            thumbTintColor={colors.purple}
            accessibilityLabel={`Radio: ${radiusKm} kilómetros`}
          />

          <TouchableOpacity
            style={[styles.saveButton, (!coords || isSaving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!coords || isSaving}
            activeOpacity={0.85}
            testID="geoblock-save-btn"
          >
            <Ionicons name="checkmark" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: spacing.xl,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'PoppinsRounded-SemiBold',
  },
  mapWrap: {
    flex: 1,
    backgroundColor: surfaces.card,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.body,
    color: text.secondary,
  },
  controls: {
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: surfaces.elevated,
  },
  labelInput: {
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    backgroundColor: surfaces.card,
    color: text.primary,
    paddingHorizontal: spacing.md,
    ...typography.body,
  },
  radiusValue: {
    ...typography.h3,
    color: colors.purple,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 36,
  },
  saveButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
});
