import { render, screen, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { VerificationTeaserScreen } from '../VerificationTeaserScreen';

describe('VerificationTeaserScreen', () => {
  it('muestra el copy del gate de Explorar', () => {
    render(<VerificationTeaserScreen onVerifyNow={jest.fn()} />);

    expect(screen.getByText('Recuerda verificar tu identidad para iniciar la aventura')).toBeTruthy();
    expect(screen.getByText('Protégete y protege a la comunidad.')).toBeTruthy();
    expect(screen.getByText('Verificar ahora')).toBeTruthy();
    expect(screen.getByText('¿Por qué pedimos esto?')).toBeTruthy();
  });

  it('llama a onVerifyNow al tocar "Verificar ahora"', () => {
    const onVerifyNow = jest.fn();
    render(<VerificationTeaserScreen onVerifyNow={onVerifyNow} />);

    fireEvent.press(screen.getByText('Verificar ahora'));

    expect(onVerifyNow).toHaveBeenCalledTimes(1);
  });

  it('muestra la nota de privacidad al tocar "¿Por qué pedimos esto?" sin inventar copy nuevo', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    render(<VerificationTeaserScreen onVerifyNow={jest.fn()} />);

    fireEvent.press(screen.getByText('¿Por qué pedimos esto?'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Verifica tu identidad',
      'Tu documento se usa únicamente para verificar tu identidad. No lo compartimos con nadie ni lo guardamos después de la revisión.',
    );
  });
});
