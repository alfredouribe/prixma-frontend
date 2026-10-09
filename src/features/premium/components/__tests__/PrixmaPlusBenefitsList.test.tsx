import { render } from '@testing-library/react-native';
import { PrixmaPlusBenefitsList } from '../PrixmaPlusBenefitsList';

describe('PrixmaPlusBenefitsList', () => {
  it('muestra los 3 beneficios reales de Prixma+', () => {
    const { getByTestId, getByText } = render(<PrixmaPlusBenefitsList />);

    expect(getByTestId('prixma-plus-benefits')).toBeTruthy();
    expect(getByText('Likes y super likes ilimitados, sin esperar a mañana')).toBeTruthy();
    expect(getByText('Sin anuncios en Explorar ni en el chat')).toBeTruthy();
    expect(getByText('Descubre quién te dio like')).toBeTruthy();
  });
});
