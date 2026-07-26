import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { ReportModal } from '../ReportModal';
import { useReport } from '../../hooks/useReport';
import { useReportEvidence } from '../../hooks/useReportEvidence';

jest.mock('../../hooks/useReport');
jest.mock('../../hooks/useReportEvidence');

describe('ReportModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useReport as jest.Mock).mockReturnValue({
      submitReport: jest.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
    (useReportEvidence as jest.Mock).mockReturnValue({
      profile: null,
      chatMessages: [],
      chatTotal: null,
      isLoading: false,
    });
  });

  it('muestra el título y los motivos disponibles', () => {
    render(<ReportModal visible targetId="user-1" targetName="Alex" onClose={jest.fn()} />);

    expect(screen.getByText('Reportar perfil')).toBeTruthy();
    expect(screen.getByText('Acoso')).toBeTruthy();
    expect(screen.getByText('Discriminación')).toBeTruthy();
    expect(screen.getByText('Perfil falso')).toBeTruthy();
    expect(screen.getByText('Contenido inapropiado')).toBeTruthy();
    expect(screen.getByText('Otro')).toBeTruthy();
  });

  it('deshabilita el botón de enviar sin motivo seleccionado (no llama a submitReport)', async () => {
    const submitReport = jest.fn().mockResolvedValue(true);
    (useReport as jest.Mock).mockReturnValue({ submitReport, isLoading: false, error: null });

    render(<ReportModal visible targetId="user-1" targetName="Alex" onClose={jest.fn()} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('report-submit-btn'));
    });

    expect(submitReport).not.toHaveBeenCalled();
  });

  it('habilita el botón de enviar tras seleccionar un motivo (sí llama a submitReport)', async () => {
    const submitReport = jest.fn().mockResolvedValue(true);
    (useReport as jest.Mock).mockReturnValue({ submitReport, isLoading: false, error: null });

    render(<ReportModal visible targetId="user-1" targetName="Alex" onClose={jest.fn()} />);

    fireEvent.press(screen.getByTestId('report-reason-harassment'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('report-submit-btn'));
    });

    expect(submitReport).toHaveBeenCalledTimes(1);
  });

  it('llama a submitReport con el motivo seleccionado al enviar', async () => {
    const submitReport = jest.fn().mockResolvedValue(true);
    (useReport as jest.Mock).mockReturnValue({ submitReport, isLoading: false, error: null });

    render(<ReportModal visible targetId="user-1" targetName="Alex" onClose={jest.fn()} />);

    fireEvent.press(screen.getByTestId('report-reason-fake_profile'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('report-submit-btn'));
    });

    expect(submitReport).toHaveBeenCalledWith('user-1', 'fake_profile', null);
  });

  it('muestra la confirmación de tolerancia cero tras enviar', async () => {
    render(<ReportModal visible targetId="user-1" targetName="Alex" onClose={jest.fn()} />);

    fireEvent.press(screen.getByTestId('report-reason-other'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('report-submit-btn'));
    });

    expect(screen.getByText('Reporte enviado')).toBeTruthy();
    expect(
      screen.getByText('Gracias por ayudar a mantener Prixma segure. Alex ha sido bloqueade automáticamente.'),
    ).toBeTruthy();
    expect(screen.getByTestId('report-done-btn')).toBeTruthy();
  });

  it('pantalla de confirmación muestra el nombre correcto interpolado', async () => {
    render(<ReportModal visible targetId="user-2" targetName="Nubia" onClose={jest.fn()} />);

    fireEvent.press(screen.getByTestId('report-reason-discrimination'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('report-submit-btn'));
    });

    expect(
      screen.getByText('Gracias por ayudar a mantener Prixma segure. Nubia ha sido bloqueade automáticamente.'),
    ).toBeTruthy();
  });
});
