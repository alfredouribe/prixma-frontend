import { Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const GLOW_SIZE = width + 80;

export function AuthGlow() {
  return (
    <Image
      source={require('../../../../assets/images/purple_glow_transparent.png')}
      style={styles.glow}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: -(GLOW_SIZE / 2),
    left: (width - GLOW_SIZE) / 2,
    width: GLOW_SIZE,
    height: GLOW_SIZE,
  },
});
