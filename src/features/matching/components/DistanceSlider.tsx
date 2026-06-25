import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

interface DistanceSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function DistanceSlider({ value, onChange }: DistanceSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Distancia</Text>
        <Text style={styles.value}>{value} km</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={100}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#9b5dff"
        maximumTrackTintColor="#2a2a38"
        thumbTintColor="#9b5dff"
        accessibilityLabel={`Distancia máxima: ${value} kilómetros`}
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
    marginBottom: 8,
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
  slider: {
    width: '100%',
    height: 36,
  },
});
