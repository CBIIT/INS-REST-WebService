import { describe, it, expect } from 'vitest';
const utils = require('./index.js');

describe('getSearchableText', () => {
  it('should return filtered text with terms longer than 2 characters', () => {
    const result = utils.getSearchableText('hello world test');
    expect(result).toBe('hello world test');
  });

  it('should filter out terms with 2 or fewer characters', () => {
    const result = utils.getSearchableText('hello to a world');
    expect(result).toBe('hello world');
  });

  it('should handle extra spaces between words', () => {
    const result = utils.getSearchableText('hello   world   test');
    expect(result).toBe('hello world test');
  });

  it('should handle leading and trailing spaces', () => {
    const result = utils.getSearchableText('  hello world  ');
    expect(result).toBe('hello world');
  });

  it('should return empty string when all terms are 2 or fewer characters', () => {
    const result = utils.getSearchableText('a to in at');
    expect(result).toBe('');
  });

  it('should return empty string for empty input', () => {
    const result = utils.getSearchableText('');
    expect(result).toBe('');
  });

  it('should return empty string for whitespace only input', () => {
    const result = utils.getSearchableText('   ');
    expect(result).toBe('');
  });

  it('should handle single word longer than 2 characters', () => {
    const result = utils.getSearchableText('test');
    expect(result).toBe('test');
  });

  it('should filter out single word with 2 or fewer characters', () => {
    const result = utils.getSearchableText('at');
    expect(result).toBe('');
  });

  it('should handle mixed case text', () => {
    const result = utils.getSearchableText('Hello WORLD Test');
    expect(result).toBe('Hello WORLD Test');
  });

  it('should preserve special characters in terms longer than 2 characters', () => {
    const result = utils.getSearchableText('test-123 data@2024');
    expect(result).toBe('test-123 data@2024');
  });

  it('should handle terms with exactly 3 characters', () => {
    const result = utils.getSearchableText('the cat dog');
    expect(result).toBe('the cat dog');
  });

  it('should filter terms with exactly 2 characters', () => {
    const result = utils.getSearchableText('in on at to my cat');
    expect(result).toBe('cat');
  });

  it('should filter terms with exactly 1 character', () => {
    const result = utils.getSearchableText('a b c test hello');
    expect(result).toBe('test hello');
  });

  it('should handle complex mixed input', () => {
    const result = utils.getSearchableText('  a  hello   to  world  in  test  ');
    expect(result).toBe('hello world test');
  });
});
