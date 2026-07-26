import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import { useEventRsvp } from '../hooks/useEventRsvp';
import type { Event, RsvpStatus } from '../types/event.types';

interface EventRsvpControlProps {
  eventId: string;
  status: RsvpStatus | null;
  /** Se llama con el `Event` actualizado tras un RSVP exitoso, para que el
   * padre (lista o detalle) refleje los contadores nuevos sin recargar. */
  onChanged?: (updated: Event) => void;
}

// Copy exacto: brand/copies.md → "Eventos" → "Estados de asistencia (RSVP)".
const RSVP_OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: 'interested', label: 'Me interesa' },
  { value: 'going', label: 'Iré' },
  { value: 'not_going', label: 'No iré' },
];

/**
 * Control segmentado de 3 estados — reemplaza el botón binario original (ver
 * plan.md). Mantiene el estado seleccionado localmente (optimista) para que
 * cambiar de opción se refleje de inmediato sin depender de que el padre
 * vuelva a renderizar con un `status` nuevo; si la llamada falla, revierte.
 */
export function EventRsvpControl({ eventId, status, onChanged }: EventRsvpControlProps) {
  const { updateRsvp, isLoading, error } = useEventRsvp();
  const [selected, setSelected] = useState<RsvpStatus | null>(status);

  useEffect(() => {
    setSelected(status);
  }, [status, eventId]);

  async function handlePress(next: RsvpStatus) {
    if (next === selected || isLoading) return;
    const previous = selected;
    setSelected(next);

    const updated = await updateRsvp(eventId, next);
    if (updated) {
      onChanged?.(updated);
    } else {
      setSelected(previous);
    }
  }

  return (
    <View testID={`event-rsvp-control-${eventId}`}>
      <View style={styles.row}>
        {RSVP_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => handlePress(option.value)}
              disabled={isLoading}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: isLoading }}
              testID={`event-rsvp-${eventId}-${option.value}`}
            >
              {isLoading && isSelected ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: surfaces.card,
    borderRadius: radius.full,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: colors.purple,
  },
  optionText: {
    ...typography.label,
    color: text.tertiary,
    fontSize: 11,
  },
  optionTextSelected: {
    color: colors.white,
  },
  errorText: {
    ...typography.caption,
    color: colors.rose,
    marginTop: spacing.xs,
  },
});
