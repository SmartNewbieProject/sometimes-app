import { capitalize, truncate, toCamelCase } from '../src/shared/utils/string-utils';

describe('String Utils', () => {
  describe('capitalize', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should return an empty string when given an empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle already capitalized strings', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });
  });

  describe('truncate', () => {
    it('should truncate a string that exceeds the max length', () => {
      expect(truncate('This is a long string', 10)).toBe('This is a ...');
    });

    it('should not truncate a string that is shorter than the max length', () => {
      expect(truncate('Short', 10)).toBe('Short');
    });

    it('should return an empty string when given an empty string', () => {
      expect(truncate('', 10)).toBe('');
    });
  });

  describe('toCamelCase', () => {
    it('should convert a space-separated string to camelCase', () => {
      expect(toCamelCase('hello world')).toBe('helloWorld');
    });

    it('should handle already camelCase strings', () => {
      expect(toCamelCase('helloWorld')).toBe('helloWorld');
    });

    it('should return an empty string when given an empty string', () => {
      expect(toCamelCase('')).toBe('');
    });
  });
});
