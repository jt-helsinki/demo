import { describe, expect, it, vi } from 'vitest';
import { capitalize, cn, ensurePrefix, generateId, generateSessionCode } from './utils';

// Mocking nanoid for deterministic results in tests
vi.mock('nanoid', async () => {
  const actual = await vi.importActual<typeof import('nanoid')>('nanoid');
  return {
    ...actual,
    customAlphabet: (alphabet: string, size: number) => {
      return () => alphabet.slice(0, size); // predictable string for testing
    },
  };
});

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('removes falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, null, '')).toBe('foo');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg'); // twMerge resolves conflicts
  });
});

describe('ensurePrefix', () => {
  it('adds prefix when missing', () => {
    expect(ensurePrefix('test', 'pre')).toBe('pre_test');
  });

  it('does not duplicate prefix when already present', () => {
    expect(ensurePrefix('pre_test', 'pre')).toBe('pre_test');
  });

  it('cleans trailing underscores from prefix', () => {
    expect(ensurePrefix('value', 'pre___')).toBe('pre_value');
  });
});

describe('generateId', () => {
  it('creates an ID with the specified prefix', () => {
    const id = generateId('PRE');
    expect(id.startsWith('PRE_')).toBe(true);
  });

  it('creates an ID of the specified total length', () => {
    const id = generateId('PRE', 12);
    expect(id.length).toBe(12);
  });

  it('changes ID length when prefix changes', () => {
    const id1 = generateId('A', 10);
    const id2 = generateId('LONGPREFIX', 15);
    expect(id1.length).toBe(10);
    expect(id2.length).toBe(15);
  });
});

describe('generateSessionCode', () => {
  it('returns an 8-character code', () => {
    const code = generateSessionCode();
    expect(code).toHaveLength(8);
  });

  it('uses the defined alphabet', () => {
    const code = generateSessionCode();
    expect(/^[0-9A-Z]+$/.test(code)).toBe(true);
  });
});

describe('capitalize', () => {
  it('capitalizes the first character of a string', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('returns an empty string when given empty input', () => {
    expect(capitalize('')).toBe('');
  });

  it('returns an empty string when input is falsy', () => {
    expect(capitalize(null as any)).toBe('');
    expect(capitalize(undefined as any)).toBe('');
  });

  it('leaves first character capitalized if already uppercase', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });
});
