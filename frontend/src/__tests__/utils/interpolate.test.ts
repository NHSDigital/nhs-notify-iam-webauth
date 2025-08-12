import { interpolate } from '@/utils/interpolate';

describe('interpolate', () => {
  it('returns empty string if input is empty', () => {
    expect(interpolate('', { name: 'Test' })).toBe('');
  });

  it('returns the same string if no placeholders are present', () => {
    expect(interpolate('No interpolation needed.', {})).toBe(
      'No interpolation needed.'
    );
  });

  it('replaces simple variables', () => {
    expect(interpolate('Hello {{name}}!', { name: 'Test' })).toBe(
      'Hello Test!'
    );
  });

  it('removes variable if missing', () => {
    expect(interpolate('Hello {{name}}!', {})).toBe('Hello !');
  });

  it('replaces plural based on numeric value', () => {
    expect(interpolate('{{count|item|items}}', { count: 1 })).toBe('item');
    expect(interpolate('{{count|item|items}}', { count: 3 })).toBe('items');
  });

  it('falls back to plural if variable is not a number', () => {
    expect(interpolate('{{count|item|items}}', { count: 'abc' })).toBe('items');
  });

  it('replaces variable and plural in the same string', () => {
    expect(interpolate('{{count}} {{count|item|items}}', { count: 2 })).toBe(
      '2 items'
    );
    expect(interpolate('{{count}} {{count|item|items}}', { count: 1 })).toBe(
      '1 item'
    );
  });

  it('replaces multiple variables and plurals in same string', () => {
    expect(
      interpolate(
        '{{characters}} {{characters|character|characters}} as {{count}} {{count|text message|text messages}}',
        { characters: 2, count: 1 }
      )
    ).toBe('2 characters as 1 text message');
  });

  it('handles missing variables by not including them', () => {
    expect(
      interpolate(
        '{{characters}} {{characters|character|characters}} and {{missing}} {{missing|apple|apples}}',
        { characters: 1 }
      )
    ).toBe('1 character and  apples');
  });
});
