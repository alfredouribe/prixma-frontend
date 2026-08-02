import { pushDataToRoute } from '../pushNotificationPayload';

describe('pushDataToRoute', () => {
  it('resuelve la conversación para type=match con conversation_id', () => {
    expect(pushDataToRoute({ type: 'match', conversation_id: 'conv-1' })).toEqual({
      pathname: '/(app)/chat/[id]',
      params: { id: 'conv-1' },
    });
  });

  it('resuelve la conversación para type=message con conversation_id', () => {
    expect(pushDataToRoute({ type: 'message', conversation_id: 'conv-2' })).toEqual({
      pathname: '/(app)/chat/[id]',
      params: { id: 'conv-2' },
    });
  });

  it('resuelve la conversación para type=request_accepted con conversation_id', () => {
    expect(pushDataToRoute({ type: 'request_accepted', conversation_id: 'conv-3' })).toEqual({
      pathname: '/(app)/chat/[id]',
      params: { id: 'conv-3' },
    });
  });

  it('resuelve Explorar para type=super_like sin necesitar conversation_id', () => {
    expect(pushDataToRoute({ type: 'super_like' })).toBe('/(app)/(tabs)/explore');
  });

  it('devuelve null si falta conversation_id para un tipo que lo requiere', () => {
    expect(pushDataToRoute({ type: 'match' })).toBeNull();
  });

  it('devuelve null si el type no es reconocido', () => {
    expect(pushDataToRoute({ type: 'algo_desconocido', conversation_id: 'conv-1' })).toBeNull();
  });

  it('devuelve null si data es null o undefined', () => {
    expect(pushDataToRoute(null)).toBeNull();
    expect(pushDataToRoute(undefined)).toBeNull();
  });

  it('devuelve null si falta el campo type por completo', () => {
    expect(pushDataToRoute({ conversation_id: 'conv-1' })).toBeNull();
  });
});
