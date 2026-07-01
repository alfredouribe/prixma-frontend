import { View, StyleSheet } from 'react-native';
import { surfaces, colors } from '../../../lib/theme';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export function OnboardingProgress({ currentStep, totalSteps = 6 }: OnboardingProgressProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View key={i} style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: currentStep >= i ? '100%' : '0%' },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 9999,
    backgroundColor: surfaces.elevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: colors.purple,
  },
});
