
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { customAlphabet } from 'nanoid';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function ensurePrefix(str: string, prefix: string): string {
  return str.startsWith(prefix) ? str : `${prefix}_${str}`;
}

const alphabet: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoidSessionCode = customAlphabet(alphabet, 8); // 26 chars like your example

export function generateId(prefix: string = '', length: number = 32): string {
  const nanoid = customAlphabet(alphabet, length - prefix.length);
  return ensurePrefix(nanoid(), prefix);
}

export function generateSessionCode(): string {
  return nanoidSessionCode();
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
