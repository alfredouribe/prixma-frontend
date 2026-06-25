import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Intention, MatchingPreferences } from '../types/matching.types';
import { AgeRangeSlider } from './AgeRangeSlider';
import { DistanceSlider } from './DistanceSlider';

interface FilterSheetProps {
  visible: boolean;
  preferences: MatchingPreferences;
  onApply: (prefs: Partial<MatchingPreferences>) => void;
  onClose: () => void;
}

const INTENTION_OPTIONS: { value: Intention; label: string }[] = [
  { value: 'partner', label: 'Pareja' },
  { value: 'friendship', label: 'Amistad' },
  { value: 'community', label: 'Comunidad' },
  { value: 'mentorship', label: 'Mentoría' },
];

export function FilterSheet({ visible, preferences, onApply, onClose }: FilterSheetProps) {
  const [local, setLocal] = useState<MatchingPreferences>(preferences);

  useEffect(() => {
    setLocal(preferences);
  }, [preferences, visible]);

  function toggleIntention(value: Intention) {
    const current = local.intentions ?? [];
    const next = current.includes(value)
      ? current.filter((i) => i !== value)
      : [...current, value];
    setLocal((p) => ({ ...p, intentions: next.length ? next : null }));
  }

  function handleApply() {
    onApply({
      age_min: local.age_min,
      age_max: local.age_max,
      max_distance_km: local.max_distance_km,
      intentions: local.intentions,
      verified_only: local.verified_only,
      has_video_only: local.has_video_only,
    });
    onClose();
  }

  function handleClear() {
    setLocal({
      ...preferences,
      age_min: 18,
      age_max: 55,
      max_distance_km: 50,
      intentions: null,
      verified_only: false,
      has_video_only: false,
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filtrar perfiles</Text>
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearButton}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <AgeRangeSlider
            minAge={local.age_min}
            maxAge={local.age_max}
            onChangeMin={(v) => setLocal((p) => ({ ...p, age_min: v }))}
            onChangeMax={(v) => setLocal((p) => ({ ...p, age_max: v }))}
          />

          <View style={styles.separator} />

          <DistanceSlider
            value={local.max_distance_km}
            onChange={(v) => setLocal((p) => ({ ...p, max_distance_km: v }))}
          />

          <View style={styles.separator} />

          <Text style={styles.sectionLabel}>Intención</Text>
          <View style={styles.chips}>
            {INTENTION_OPTIONS.map((opt) => {
              const selected = local.intentions?.includes(opt.value) ?? false;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => toggleIntention(opt.value)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.separator} />

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Solo perfiles verificados</Text>
            <Switch
              value={local.verified_only}
              onValueChange={(v) => setLocal((p) => ({ ...p, verified_only: v }))}
              trackColor={{ false: '#3a3a4a', true: '#9b5dff' }}
              thumbColor="#ffffff"
              accessibilityLabel="Solo perfiles verificados"
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Solo perfiles con video</Text>
            <Switch
              value={local.has_video_only}
              onValueChange={(v) => setLocal((p) => ({ ...p, has_video_only: v }))}
              trackColor={{ false: '#3a3a4a', true: '#9b5dff' }}
              thumbColor="#ffffff"
              accessibilityLabel="Solo perfiles con video"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply} accessibilityRole="button">
            <Text style={styles.applyButtonText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#1e1e28',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3a3a4a',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'PoppinsRounded-SemiBold',
    fontSize: 18,
    color: '#ffffff',
  },
  clearButton: {
    fontFamily: 'PoppinsRounded-Medium',
    fontSize: 14,
    color: '#9b5dff',
  },
  content: {
    paddingBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#2a2a38',
    marginVertical: 20,
  },
  sectionLabel: {
    fontFamily: 'PoppinsRounded-Medium',
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 0.5,
    borderColor: '#3a3a4a',
    backgroundColor: '#17171f',
  },
  chipSelected: {
    borderColor: '#9b5dff',
    backgroundColor: 'rgba(155, 93, 255, 0.15)',
  },
  chipText: {
    fontFamily: 'PoppinsRounded-Medium',
    fontSize: 13,
    color: '#a0a0b8',
  },
  chipTextSelected: {
    color: '#9b5dff',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleLabel: {
    fontFamily: 'PoppinsRounded-Regular',
    fontSize: 15,
    color: '#ffffff',
    flex: 1,
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a38',
  },
  applyButton: {
    backgroundColor: '#9b5dff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontFamily: 'PoppinsRounded-SemiBold',
    fontSize: 15,
    color: '#ffffff',
  },
});
