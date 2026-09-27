import { render, screen, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VerificationTeaserScreen } from '../VerificationTeaserScreen';

// `useSafeAreaInsets()` (real bug 2026-09-27: el botón de volver necesita el
// inset real, no un `top` fijo, para no quedar bajo la barra de
// estado/notch) exige un `<SafeAreaProvider>` como ancestro o lanza en
// tiempo real.
const TEST_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen(props: Parameters<typeof VerificationTeaserScreen>[0]) {
  return render(
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <VerificationTeaserScreen {...props} />
    </SafeAreaProvider>,
  );
}

describe('VerificationTeaserScreen', () => {
  it('muestra el copy del gate de Explorar', () => {
    renderScreen({ onVerifyNow: jest.fn() });

    expect(screen.getByText('Recuerda verificar tu identidad para iniciar la aventura')).toBeTruthy();
    expect(screen.getByText('Protégete y protege a la comunidad.')).toBeTruthy();
    expect(screen.getByText('Verificar ahora')).toBeTruthy();
    expect(screen.getByText('¿Por qué pedimos esto?')).toBeTruthy();
  });

  it('llama a onVerifyNow al tocar "Verificar ahora"', () => {
    const onVerifyNow = jest.fn();
    renderScreen({ onVerifyNow });

    fireEvent.press(screen.getByText('Verificar ahora'));

    expect(onVerifyNow).toHaveBeenCalledTimes(1);
  });

  it('muestra la nota de privacidad al tocar "¿Por qué pedimos esto?" sin inventar copy nuevo', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    renderScreen({ onVerifyNow: jest.fn() });

    fireEvent.press(screen.getByText('¿Por qué pedimos esto?'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Verifica tu identidad',
      'Tu documento se usa únicamente para verificar tu identidad. No lo compartimos con nadie ni lo guardamos después de la revisión.',
    );
  });

  it('no muestra botón de volver cuando no se pasa onBack (uso desde el gate de Explorar)', () => {
    renderScreen({ onVerifyNow: jest.fn() });

    expect(screen.queryByLabelText('Volver')).toBeNull();
  });

  it('bug real 2026-09-27: muestra botón de volver y llama a onBack cuando se pasa (entrada desde Configuración del perfil)', () => {
    const onBack = jest.fn();
    renderScreen({ onVerifyNow: jest.fn(), onBack });

    fireEvent.press(screen.getByLabelText('Volver'));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
