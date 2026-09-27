import { reverseGeocode, searchPlace } from '../nominatim';

function mockFetchOnce(body: unknown, ok = true) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: async () => body,
  });
}

describe('nominatim', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  describe('reverseGeocode', () => {
    it('bug real: una dirección completa (150+ chars) se acorta a "Ciudad, Estado" usando el address de Nominatim', async () => {
      const longAddress =
        'Calle Independencia 123, Colonia Centro, Alcaldía Cuauhtémoc, Ciudad de México, Distrito Federal, 06000, México';
      expect(longAddress.length).toBeGreaterThan(100);

      mockFetchOnce({
        display_name: longAddress,
        lat: '19.4326',
        lon: '-99.1332',
        address: { city: 'Ciudad de México', state: 'Ciudad de México' },
      });

      const result = await reverseGeocode(19.4326, -99.1332);

      expect(result).toEqual({
        display_name: 'Ciudad de México, Ciudad de México',
        lat: '19.4326',
        lon: '-99.1332',
      });
      expect(result!.display_name.length).toBeLessThanOrEqual(100);
    });

    it('usa town/village/municipality/county como fallback cuando no hay `city`', async () => {
      mockFetchOnce({
        display_name: 'Camino Real 45, Tlajomulco de Zúñiga, Jalisco, México',
        lat: '20.47',
        lon: '-103.44',
        address: { town: 'Tlajomulco de Zúñiga', state: 'Jalisco' },
      });

      const result = await reverseGeocode(20.47, -103.44);

      expect(result?.display_name).toBe('Tlajomulco de Zúñiga, Jalisco');
    });

    it('sin `address` en la respuesta, recorta el display_name crudo a 100 caracteres en vez de fallar', async () => {
      const longAddress = 'X'.repeat(150);
      mockFetchOnce({ display_name: longAddress, lat: '19.4326', lon: '-99.1332' });

      const result = await reverseGeocode(19.4326, -99.1332);

      expect(result?.display_name).toBe('X'.repeat(100));
      expect(result?.display_name.length).toBe(100);
    });

    it('pide addressdetails=1 al endpoint de reverse', async () => {
      mockFetchOnce({
        display_name: 'Guadalajara, Jalisco, México',
        lat: '20.6597',
        lon: '-103.3496',
        address: { city: 'Guadalajara', state: 'Jalisco' },
      });

      await reverseGeocode(20.6597, -103.3496);

      const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(url).toContain('addressdetails=1');
    });

    it('devuelve null si la respuesta no viene ok', async () => {
      mockFetchOnce({}, false);
      expect(await reverseGeocode(0, 0)).toBeNull();
    });

    it('devuelve null si la respuesta no tiene el shape esperado', async () => {
      mockFetchOnce({ foo: 'bar' });
      expect(await reverseGeocode(0, 0)).toBeNull();
    });

    it('devuelve null si fetch lanza', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network'));
      expect(await reverseGeocode(0, 0)).toBeNull();
    });
  });

  describe('searchPlace', () => {
    it('devuelve los resultados tal cual (display_name corto, sin transformar)', async () => {
      mockFetchOnce([{ display_name: 'Ciudad de México, México', lat: '19.4326', lon: '-99.1332' }]);

      const result = await searchPlace('Ciudad de Mex');

      expect(result).toEqual([{ display_name: 'Ciudad de México, México', lat: '19.4326', lon: '-99.1332' }]);
    });

    it('devuelve [] si la respuesta no es un arreglo', async () => {
      mockFetchOnce({ not: 'an array' });
      expect(await searchPlace('x')).toEqual([]);
    });

    it('devuelve [] si fetch lanza', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network'));
      expect(await searchPlace('x')).toEqual([]);
    });
  });
});
