import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

interface AgeRangeSliderProps {
  minAge: number;
  maxAge: number;
  onChangeMin: (value: number) => void;
  onChangeMax: (value: number) => void;
}

export function AgeRangeSlider({ minAge, maxAge, onChangeMin, onChangeMax }: AgeRangeSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Rango de edad</Text>
        <Text style={styles.value}>
          {minAge} – {maxAge === 55 ? '55+' : maxAge}
        </Text>
      </View>

      <Text style={styles.sublabel}>Mínimo</Text>
      <Slider
        style={styles.slider}
        minimumValue={18}
        maximumValue={maxAge}
        step={1}
        value={minAge}
        onValueChange={onChangeMin}
        minimumTrackTintColor="#9b5dff"
        maximumTrackTintColor="#2a2a38"
        thumbTintColor="#9b5dff"
        accessibilityLabel={`Edad mínima: ${minAge}`}
      />

      <Text style={styles.sublabel}>Máximo</Text>
      <Slider
        style={styles.slider}
        minimumValue={minAge}
        maximumValue={55}
        step={1}
        value={maxAge}
        onValueChange={onChangeMax}
        minimumTrackTintColor="#9b5dff"
        maximumTrackTintColor="#2a2a38"
        thumbTintColor="#9b5dff"
        accessibilityLabel={`Edad máxima: ${maxAge}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontFamily: 'PoppinsRounded-Medium',
    fontSize: 14,
    color: '#ffffff',
  },
  value: {
    fontFamily: 'PoppinsRounded-SemiBold',
    fontSize: 14,
    color: '#9b5dff',
  },
  sublabel: {
    fontFamily: 'PoppinsRounded-Regular',
    fontSize: 12,
    color: '#a0a0b8',
    marginBottom: 4,
    marginLeft: 4,
  },
  slider: {
    width: '100%',
    height: 36,
    marginBottom: 8,
  },
});
