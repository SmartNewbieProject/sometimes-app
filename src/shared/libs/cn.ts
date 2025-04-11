import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind 클래스를 병합하고 충돌을 해결하는 유틸리티 함수
 * @param inputs - 병합할 클래스네임들
 * @returns 병합된 클래스네임 문자열
 * @example
 * cn('px-2 py-1', 'bg-red-500', { 'text-white': true })
 * // 'px-2 py-1 bg-red-500 text-white'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 