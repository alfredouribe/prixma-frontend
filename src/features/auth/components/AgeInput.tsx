import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, surfaces, text, spacing, radius, typography } from '../../../lib/theme';

interface AgeInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

function computeAge(dateString: string): number {
  const today = new Date();
  const birth = new Date(dateString);
  if (isNaN(birth.getTime())) return -1;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function AgeInput({ value, onChange, onBlur, error }: AgeInputProps) {
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yyyy, setYyyy] = useState('');

  const mmRef = useRef<TextInput>(null);
  const yyyyRef = useRef<TextInput>(null);

  // Si el padre ya trae un valor (ej. edición futura), parsear al montar
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-');
      setYyyy(y);
      setMm(m);
      setDd(d);
    }
  }, []);

  function compose(d: string, m: string, y: string) {
    if (d.length === 2 && m.length === 2 && y.length === 4) {
      onChange(`${y}-${m}-${d}`);
    } else {
      onChange('');
    }
  }

  function handleDd(raw: string) {
    const clean = raw.replace(/\D/g, '').slice(0, 2);
    setDd(clean);
    compose(clean, mm, yyyy);
    if (clean.length === 2) mmRef.current?.focus();
  }

  function handleMm(raw: string) {
    const clean = raw.replace(/\D/g, '').slice(0, 2);
    setMm(clean);
    compose(dd, clean, yyyy);
    if (clean.length === 2) yyyyRef.current?.focus();
  }

  function handleYyyy(raw: string) {
    const clean = raw.replace(/\D/g, '').slice(0, 4);
    setYyyy(clean);
    compose(dd, mm, clean);
  }

  // Retroceso: si el campo queda vacío, volver al anterior
  function handleMmKeyPress(key: string) {
    if (key === 'Backspace' && mm === '') mmRef.current?.blur();
  }

  function handleYyyyKeyPress(key: string) {
    if (key === 'Backspace' && yyyy === '') mmRef.current?.focus();
  }

  const showAgeWarning =
    value.length === 10 && !error && computeAge(value) >= 0 && computeAge(value) < 18;

  const hasError = !!error;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Fecha de nacimiento</Text>

      <View style={styles.row}>
        <View style={[styles.inputBox, hasError && styles.inputBoxError]}>
          <TextInput
            value={dd}
            onChangeText={handleDd}
            onBlur={onBlur}
            placeholder="DD"
            placeholderTextColor={text.tertiary}
            keyboardType="number-pad"
            maxLength={2}
            style={styles.input}
            textAlign="center"
          />
        </View>

        <View style={[styles.inputBox, hasError && styles.inputBoxError]}>
          <TextInput
            ref={mmRef}
            value={mm}
            onChangeText={handleMm}
            onBlur={onBlur}
            onKeyPress={({ nativeEvent }) => handleMmKeyPress(nativeEvent.key)}
            placeholder="MM"
            placeholderTextColor={text.tertiary}
            keyboardType="number-pad"
            maxLength={2}
            style={styles.input}
            textAlign="center"
          />
        </View>

        <View style={[styles.inputBox, styles.inputBoxWide, hasError && styles.inputBoxError]}>
          <TextInput
            ref={yyyyRef}
            value={yyyy}
            onChangeText={handleYyyy}
            onBlur={onBlur}
            onKeyPress={({ nativeEvent }) => handleYyyyKeyPress(nativeEvent.key)}
            placeholder="AAAA"
            placeholderTextColor={text.tertiary}
            keyboardType="number-pad"
            maxLength={4}
            style={styles.input}
            textAlign="center"
          />
        </View>
      </View>

      <Text style={styles.hint}>Debes tener al menos 18 años para usar Prixma.</Text>

      {showAgeWarning && (
        <Text style={styles.warning}>⚠️ Debes tener al menos 18 años para usar Prixma.</Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: text.secondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  inputBox: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: surfaces.card,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBoxWide: {
    flex: 1.6,
  },
  inputBoxError: {
    borderColor: colors.rose,
  },
  input: {
    ...typography.body,
    color: text.primary,
    width: '100%',
    paddingVertical: 0,
  },
  hint: {
    ...typography.caption,
    color: text.tertiary,
    marginTop: spacing.xs,
  },
  warning: {
    ...typography.small,
    color: colors.orange,
    marginTop: spacing.xs,
  },
  error: {
    ...typography.small,
    color: colors.rose,
    marginTop: spacing.xs,
  },
});
