import { useCallback, useEffect, useState } from 'react';
import { matchingService } from '../../matching/services/matchingService';
import { extractApiError } from '../../../lib/extractApiError';

interface UseRewindOptions {
  // Saldo inicial de créditos — viene de `usePremiumSettings().settings.rewind_credits`,
  // ya traído una vez por sesión por el llamador (ver
  // features/premium/specs/plan.md → "Frontend").
  initialCredits: number;
  // Se llama con el índice a restaurar tras un rewind exitoso — el propio
  // hook no conoce `useExploreQueue`, el llamador (`ExploreScreen`) conecta
  // ambos pasándole `rewindTo`.
  onRewind: (index: number) => void;
}

/**
 * Deshace el último swipe del usuario (ver
 * features/premium/specs/spec.md → "Deshacer swipe / rewind"). El backend
 * valida 100% del lado del servidor (créditos, si hay algo que deshacer, si
 * el último swipe ya generó un match) y responde 400 con `{ message }`
 * genérico en cualquiera de esos casos — no hay un código especial que
 * distinguirlos, así que el frontend solo muestra el mensaje del servidor.
 */
export function useRewind({ initialCredits, onRewind }: UseRewindOptions) {
  const [rewindCredits, setRewindCredits] = useState(initialCredits);
  const [isRewinding, setIsRewinding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // `ExploreScreen` llama a este hook antes de que `usePremiumSettings`
  // haya resuelto (mismo timing que `useExploreQueue({ adInterval })`) —
  // `initialCredits` empieza en 0 y pasa a ser el valor real una sola vez,
  // cuando el fetch de settings resuelve. Sin este efecto, `rewindCredits`
  // se quedaría congelado en el 0 con el que montó el `useState` inicial.
  // Una vez que el usuario hace un rewind exitoso, `initialCredits` (el
  // valor fijo original de settings) ya no vuelve a cambiar, así que este
  // efecto no puede pisar el saldo actualizado por el servidor.
  useEffect(() => {
    setRewindCredits(initialCredits);
  }, [initialCredits]);

  const rewind = useCallback(
    async (index: number) => {
      setIsRewinding(true);
      setError(null);

      try {
        const result = await matchingService.rewind();
        setRewindCredits(result.rewind_credits);
        onRewind(index);
      } catch (err) {
        setError(extractApiError(err, 'No se pudo deshacer el swipe. Intenta de nuevo.'));
      } finally {
        setIsRewinding(false);
      }
    },
    [onRewind],
  );

  return { rewind, isRewinding, rewindCredits, error };
}
