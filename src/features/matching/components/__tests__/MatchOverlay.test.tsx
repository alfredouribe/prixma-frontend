import { render } from '@testing-library/react-native';
import { MatchOverlay } from '../MatchOverlay';
import type { ExploreProfile } from '../../types/matching.types';

const mockProfile: ExploreProfile = {
  id: 'profile-uuid',
  display_name: 'Valentina',
  age: 26,
  pronouns: ['ella'],
  gender_identities: ['woman'],
  orientations: ['bisexual'],
  city: 'Guadalajara',
  intention: 'partner',
  is_verified: false,
  has_video: false,
  interests: [],
  photos: [],
};

describe('MatchOverlay', () => {
  it('muestra el título y subtítulo cuando está visible', () => {
    const { getByText } = render(
      <MatchOverlay
        visible={true}
        myPhoto={null}
        otherProfile={mockProfile}
        onSendMessage={jest.fn()}
        onKeepExploring={jest.fn()}
      />,
    );

    expect(getByText('¡Es un match! 🌟')).toBeTruthy();
    expect(getByText('Tú y Valentina se gustaron mutuamente.')).toBeTruthy();
  });

  it('muestra los botones de acción', () => {
    const { getByText } = render(
      <MatchOverlay
        visible={true}
        myPhoto={null}
        otherProfile={mockProfile}
        onSendMessage={jest.fn()}
        onKeepExploring={jest.fn()}
      />,
    );

    expect(getByText('Enviar mensaje')).toBeTruthy();
    expect(getByText('Seguir explorando')).toBeTruthy();
  });

  it('llama a onKeepExploring al tocar el botón secundario', () => {
    const onKeepExploring = jest.fn();
    const { getByText } = render(
      <MatchOverlay
        visible={true}
        myPhoto={null}
        otherProfile={mockProfile}
        onSendMessage={jest.fn()}
        onKeepExploring={onKeepExploring}
      />,
    );

    getByText('Seguir explorando').props.onPress?.();
    expect(onKeepExploring).toHaveBeenCalledTimes(1);
  });

  it('llama a onSendMessage al tocar el botón primario', () => {
    const onSendMessage = jest.fn();
    const { getByText } = render(
      <MatchOverlay
        visible={true}
        myPhoto={null}
        otherProfile={mockProfile}
        onSendMessage={onSendMessage}
        onKeepExploring={jest.fn()}
      />,
    );

    getByText('Enviar mensaje').props.onPress?.();
    expect(onSendMessage).toHaveBeenCalledTimes(1);
  });
});
