import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyExploreProps {
  onOpenFilters: () => void;
}

export function EmptyExplore({ onOpenFilters }: EmptyExploreProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={64} color="#9b5dff" style={styles.icon} />
      <Text style={styles.title}>Por el momento no hay más perfiles cerca</Text>
      <Text style={styles.subtitle}>¡Vuelve pronto o amplía tus filtros!</Text>
      <TouchableOpacity style={styles.button} onPress={onOpenFilters} accessibilityRole="button">
        <Text style={styles.buttonText}>Ampliar filtros</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#0d0d14',
  },
  icon: {
    marginBottom: 24,
    opacity: 0.7,
  },
  title: {
    fontFamily: 'PoppinsRounded-SemiBold',
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'PoppinsRounded-Regular',
    fontSize: 14,
    color: '#a0a0b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#9b5dff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonText: {
    fontFamily: 'PoppinsRounded-SemiBold',
    fontSize: 15,
    color: '#ffffff',
  },
});
