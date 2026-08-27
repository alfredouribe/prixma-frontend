import { render, screen } from '@testing-library/react-native';
import { PremiumPerksCard } from '../PremiumPerksCard';

describe('PremiumPerksCard', () => {
  it('siempre se muestra, incluso en 0 (a diferencia del badge anterior)', () => {
    render(
      <PremiumPerksCard isPremium={false} premiumUntil={null} rewindCredits={0} extraSuperLikes={0} />
    );

    expect(screen.getByTestId('premium-perks-card')).toBeTruthy();
    // Ambos contadores en 0 — dos elementos con el mismo texto, no uno.
    expect(screen.getAllByText('0', { exact: true })).toHaveLength(2);
  });

  it('muestra "no activo" cuando is_premium es false', () => {
    render(
      <PremiumPerksCard isPremium={false} premiumUntil={null} rewindCredits={0} extraSuperLikes={0} />
    );

    expect(screen.getByText(/no activo/i)).toBeTruthy();
  });

  it('muestra "activo" a secas cuando is_premium es true sin premium_until', () => {
    render(
      <PremiumPerksCard isPremium={true} premiumUntil={null} rewindCredits={0} extraSuperLikes={0} />
    );

    expect(screen.getByText('Prixma+ activo')).toBeTruthy();
  });

  it('muestra "activo hasta {fecha}" cuando premium_until está en el futuro', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);

    render(
      <PremiumPerksCard
        isPremium={true}
        premiumUntil={future.toISOString()}
        rewindCredits={0}
        extraSuperLikes={0}
      />
    );

    expect(screen.getByText(/Prixma\+ activo hasta/)).toBeTruthy();
  });

  it('muestra "activo" a secas (sin fecha) cuando premium_until ya expiró pero is_premium sigue true', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);

    render(
      <PremiumPerksCard
        isPremium={true}
        premiumUntil={past.toISOString()}
        rewindCredits={0}
        extraSuperLikes={0}
      />
    );

    expect(screen.getByText('Prixma+ activo')).toBeTruthy();
  });

  it('muestra los conteos correctos de rewind y super likes extra', () => {
    render(
      <PremiumPerksCard isPremium={true} premiumUntil={null} rewindCredits={3} extraSuperLikes={7} />
    );

    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
  });
});
