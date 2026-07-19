import { Alert } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { GeoBlockItem } from '../GeoBlockItem';
import type { GeoBlock } from '../../types/safety.types';

const geoBlock: GeoBlock = {
  id: 'geo-1',
  label: 'Trabajo',
  latitude: 19.4,
  longitude: -99.1,
  radius_km: 3,
  created_at: '2026-01-01T00:00:00Z',
};

describe('GeoBlockItem', () => {
  it('pide confirmación antes de eliminar y llama a onDelete al confirmar', () => {
    const onDelete = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    render(<GeoBlockItem geoBlock={geoBlock} onDelete={onDelete} />);
    fireEvent.press(screen.getByTestId('delete-geoblock-geo-1'));

    expect(alertSpy).toHaveBeenCalledWith(
      '¿Eliminar esta zona?',
      undefined,
      expect.arrayContaining([expect.objectContaining({ text: 'Sí, eliminar' })]),
    );

    const buttons = alertSpy.mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>;
    const confirmButton = buttons.find((b) => b.text === 'Sí, eliminar');
    confirmButton?.onPress?.();

    expect(onDelete).toHaveBeenCalledWith('geo-1');
  });
});
