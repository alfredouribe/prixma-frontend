import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface CardActionsProps {
  onSkip: () => void;
  onMessage: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  disabled?: boolean;
}

export function CardActions({ onSkip, onMessage, onLike, onSuperLike, disabled }: CardActionsProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.button, styles.skip]}
        onPress={onSkip}
        disabled={disabled}
        accessibilityLabel="Pasar"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={28} color="#ffffff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.message]}
        onPress={onMessage}
        disabled={disabled}
        accessibilityLabel="Mensaje directo"
        accessibilityRole="button"
      >
        <Ionicons name="chatbubble-outline" size={22} color="#2da5ff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.like]}
        onPress={onLike}
        disabled={disabled}
        accessibilityLabel="Like"
        accessibilityRole="button"
      >
        <Ionicons name="heart" size={28} color="#ffffff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.superLike]}
        onPress={onSuperLike}
        disabled={disabled}
        accessibilityLabel="Super like"
        accessibilityRole="button"
      >
        <Ionicons name="star" size={22} color="#ffd43b" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  skip: {
    backgroundColor: '#2a2a38',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  message: {
    backgroundColor: '#17171f',
    borderWidth: 1.5,
    borderColor: '#2da5ff',
  },
  like: {
    backgroundColor: '#ff5e7d',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  superLike: {
    backgroundColor: '#17171f',
    borderWidth: 1.5,
    borderColor: '#ffd43b',
  },
});
