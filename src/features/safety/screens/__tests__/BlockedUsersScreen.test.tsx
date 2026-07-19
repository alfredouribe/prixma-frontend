import { Alert } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { BlockedUsersScreen } from '../BlockedUsersScreen';
import { useBlocks } from '../../hooks/useBlocks';
import type { Block } from '../../types/safety.types';

jest.mock('../../hooks/useBlocks');

function buildBlock(overrides: Partial<Block> = {}): Block {
  return {
    id: 'block-1',
    blocked_user: { id: 'user-1', display_name: 'Roberto', photo: null },
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('BlockedUsersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el título de la pantalla', () => {
    (useBlocks as jest.Mock).mockReturnValue({
      blocks: [buildBlock()],
      isLoading: false,
      error: null,
      unblockUser: jest.fn(),
      reload: jest.fn(),
    });

    render(<BlockedUsersScreen />);

    expect(screen.getByText('Bloqueades')).toBeTruthy();
  });

  it('muestra el estado vacío cuando no hay bloqueados', () => {
    (useBlocks as jest.Mock).mockReturnValue({
      blocks: [],
      isLoading: false,
      error: null,
      unblockUser: jest.fn(),
      reload: jest.fn(),
    });

    render(<BlockedUsersScreen />);

    expect(screen.getByText('No has bloqueado a nadie')).toBeTruthy();
  });

  it('pide confirmación antes de desbloquear y llama a unblockUser al confirmar', () => {
    const unblockUser = jest.fn();
    (useBlocks as jest.Mock).mockReturnValue({
      blocks: [buildBlock()],
      isLoading: false,
      error: null,
      unblockUser,
      reload: jest.fn(),
    });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    render(<BlockedUsersScreen />);
    fireEvent.press(screen.getByTestId('unblock-btn-block-1'));

    expect(alertSpy).toHaveBeenCalledWith(
      '¿Desbloquear a Roberto?',
      undefined,
      expect.arrayContaining([expect.objectContaining({ text: 'Sí, desbloquear' })]),
    );

    const buttons = alertSpy.mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>;
    const confirmButton = buttons.find((b) => b.text === 'Sí, desbloquear');
    confirmButton?.onPress?.();

    expect(unblockUser).toHaveBeenCalledWith('block-1');
  });
});
