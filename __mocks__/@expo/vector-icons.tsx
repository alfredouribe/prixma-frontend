import React from 'react';
import { Text } from 'react-native';

const Ionicons = ({
  name,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: object;
}) => <Text testID={`icon-${name}`}>{name}</Text>;

Ionicons.glyphMap = {} as Record<string, number>;

export { Ionicons };
