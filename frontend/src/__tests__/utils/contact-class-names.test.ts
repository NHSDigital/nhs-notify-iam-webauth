import concatClassNames from '@/utils/concat-class-names';

describe('concatClassNames function', () => {
  it('calls the concatClassName function with string classes parameters separated by comma', () => {
    expect(concatClassNames('class1', 'class2')).toBe('class1 class2');
  });
  it('calls the concatClassName function without any/undefined parameters', () => {
    expect(concatClassNames()).toBe('');
  });
  it('calls the concatClassName function with false boolean parameter', () => {
    expect(concatClassNames(false)).toBe('');
  });

  it('removes additional spaces around class names', () => {
    expect(concatClassNames(' foo ', ' bar ')).toEqual('foo bar');
  });
});
