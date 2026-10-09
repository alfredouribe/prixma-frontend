import { identitySchema } from '../identitySchema';

const GENDER_ID = '11111111-1111-1111-1111-111111111111';
const ORIENTATION_ID = '22222222-2222-2222-2222-222222222222';
const INTERESTED_GENDER_ID = '33333333-3333-3333-3333-333333333333';

function buildValidPayload(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    display_name: 'Alex',
    gender_identity_ids: [GENDER_ID],
    custom_gender_identity: '',
    orientation_ids: [ORIENTATION_ID],
    custom_orientation: '',
    interested_in_all_genders: false,
    interested_gender_identity_ids: [INTERESTED_GENDER_ID],
    ...overrides,
  };
}

describe('identitySchema — "¿A quién te gustaría conocer?"', () => {
  it('es válido cuando se marca "Todes / sin preferencia" sin ninguna identidad específica', () => {
    const result = identitySchema.safeParse(
      buildValidPayload({ interested_in_all_genders: true, interested_gender_identity_ids: [] }),
    );
    expect(result.success).toBe(true);
  });

  it('es válido cuando se selecciona al menos una identidad específica sin marcar "Todes"', () => {
    const result = identitySchema.safeParse(
      buildValidPayload({
        interested_in_all_genders: false,
        interested_gender_identity_ids: [INTERESTED_GENDER_ID],
      }),
    );
    expect(result.success).toBe(true);
  });

  it('falla si no se marca "Todes" ni ninguna identidad específica', () => {
    const result = identitySchema.safeParse(
      buildValidPayload({ interested_in_all_genders: false, interested_gender_identity_ids: [] }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('interested_gender_identity_ids'));
      expect(issue).toBeDefined();
    }
  });

  it('no acepta texto libre como alternativa — el campo no existe en el schema de este selector', () => {
    const result = identitySchema.safeParse(
      buildValidPayload({ interested_in_all_genders: false, interested_gender_identity_ids: [] }),
    );
    // A diferencia de gender_identity_ids/orientation_ids, no hay ningún
    // "custom_interested_genders" que pueda sustituir la selección — sigue
    // inválido sin importar qué otros campos de texto libre estén llenos.
    expect(result.success).toBe(false);
  });

  it('rechaza ids que no sean uuid', () => {
    const result = identitySchema.safeParse(
      buildValidPayload({ interested_gender_identity_ids: ['no-es-un-uuid'] }),
    );
    expect(result.success).toBe(false);
  });
});
