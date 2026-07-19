import React from 'react';
import { View } from 'react-native';

const MapView = React.forwardRef((props: Record<string, unknown>, _ref) => (
  <View testID="map-view">{props.children as React.ReactNode}</View>
));
MapView.displayName = 'MapView';

export const Marker = (props: Record<string, unknown>) => (
  <View testID="map-marker">{props.children as React.ReactNode}</View>
);
export const Circle = (props: Record<string, unknown>) => <View testID="map-circle" {...props} />;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

export default MapView;
