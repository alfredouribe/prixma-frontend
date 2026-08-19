import { fireEvent, render, screen } from '@testing-library/react-native';
import { CardActions } from '../CardActions';

describe('CardActions', () => {
  const baseProps = {
    intention: null,
    onSkip: jest.fn(),
    onLike: jest.fn(),
    onSuperLike: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('no muestra el botón de deshacer swipe cuando canRewind es false', () => {
    render(<CardActions {...baseProps} canRewind={false} />);

    expect(screen.queryByTestId('rewind-button')).toBeNull();
  });

  it('no muestra el botón de deshacer swipe cuando canRewind no se pasa', () => {
    render(<CardActions {...baseProps} />);

    expect(screen.queryByTestId('rewind-button')).toBeNull();
  });

  it('muestra el botón de deshacer swipe cuando canRewind es true y lo presiona', () => {
    const onRewind = jest.fn();
    render(<CardActions {...baseProps} canRewind={true} onRewind={onRewind} />);

    const button = screen.getByTestId('rewind-button');
    fireEvent.press(button);

    expect(onRewind).toHaveBeenCalledTimes(1);
  });

  it('deshabilita el botón de deshacer swipe mientras isRewinding es true', () => {
    const onRewind = jest.fn();
    render(
      <CardActions {...baseProps} canRewind={true} onRewind={onRewind} isRewinding={true} />,
    );

    fireEvent.press(screen.getByTestId('rewind-button'));

    expect(onRewind).not.toHaveBeenCalled();
  });

  it('deshabilita todos los botones de acción cuando disabled es true', () => {
    const onSkip = jest.fn();
    render(<CardActions {...baseProps} onSkip={onSkip} disabled={true} />);

    fireEvent.press(screen.getByLabelText('Pasar'));

    expect(onSkip).not.toHaveBeenCalled();
  });
});
