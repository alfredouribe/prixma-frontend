import { render, screen } from '@testing-library/react-native';
import { UnreadBadge } from '../UnreadBadge';

describe('UnreadBadge', () => {
  it('no renderiza nada cuando count es 0', () => {
    render(<UnreadBadge count={0} />);

    expect(screen.queryByTestId('unread-badge')).toBeNull();
  });

  it('muestra el número exacto cuando count está por debajo de 100', () => {
    render(<UnreadBadge count={42} />);

    expect(screen.getByText('42')).toBeTruthy();
  });

  it('muestra "99+" cuando count supera 99', () => {
    render(<UnreadBadge count={150} />);

    expect(screen.getByText('99+')).toBeTruthy();
    expect(screen.queryByText('150')).toBeNull();
  });

  it('muestra "99" exacto en el límite (no "99+")', () => {
    render(<UnreadBadge count={99} />);

    expect(screen.getByText('99')).toBeTruthy();
  });
});
