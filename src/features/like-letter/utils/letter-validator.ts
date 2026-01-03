const MAX_LETTER_LENGTH = 50;

const PHONE_PATTERNS = [
  /01[0-9]-?\d{3,4}-?\d{4}/g,
  /\d{2,3}-?\d{3,4}-?\d{4}/g,
  /\+82-?\d{1,2}-?\d{3,4}-?\d{4}/g,
];

const CONTACT_PATTERNS = [
  /@[\w.]+/gi,
  /kakao\s*:?\s*[\w]+/gi,
  /카카오\s*:?\s*[\w가-힣]+/gi,
  /카톡\s*:?\s*[\w가-힣]+/gi,
  /라인\s*:?\s*[\w]+/gi,
  /line\s*:?\s*[\w]+/gi,
  /인스타\s*:?\s*[\w]+/gi,
  /insta\s*:?\s*[\w]+/gi,
  /ig\s*:?\s*[\w]+/gi,
  /텔레그램\s*:?\s*[\w]+/gi,
  /telegram\s*:?\s*[\w]+/gi,
  /페이스북\s*:?\s*[\w]+/gi,
  /facebook\s*:?\s*[\w]+/gi,
  /[\w.+-]+@[\w.-]+\.\w{2,}/gi,
];

const INAPPROPRIATE_WORDS = [
  "섹스", '섹', "야동", "성관계", "자위", "음란",
  "가슴", "엉덩이", "몸매", "야해", "벗어",
  "만나서", "만나자", "뭐해", '잠', "자고",
];

export type ValidationResult = {
  isValid: boolean;
  errorKeys: string[];
  hasContactInfo: boolean;
  hasInappropriateContent: boolean;
  detectedPatterns: string[];
};

export function countGraphemes(text: string): number {
  if (!text) return 0;

  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text)).length;
  }

  const graphemePattern = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u0000-\uFFFF]/g;
  const matches = text.match(graphemePattern);
  return matches ? matches.length : 0;
}

export function truncateToGraphemes(text: string, maxLength: number): string {
  if (!text) return '';

  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(text));
    return segments.slice(0, maxLength).map(s => s.segment).join('');
  }

  return text.slice(0, maxLength);
}

export function detectContactInfo(text: string): string[] {
  const detected: string[] = [];

  for (const pattern of PHONE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      detected.push(...matches);
    }
  }

  for (const pattern of CONTACT_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      detected.push(...matches);
    }
  }

  return [...new Set(detected)];
}

export function detectInappropriateContent(text: string): string[] {
  const detected: string[] = [];
  const lowerText = text.toLowerCase();

  for (const word of INAPPROPRIATE_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      detected.push(word);
    }
  }

  return detected;
}

export function validateLetter(text: string): ValidationResult {
  const errorKeys: string[] = [];
  const detectedPatterns: string[] = [];

  const graphemeCount = countGraphemes(text);
  if (graphemeCount > MAX_LETTER_LENGTH) {
    errorKeys.push('features.like-letter.validation.max_length');
  }

  const contactMatches = detectContactInfo(text);
  const hasContactInfo = contactMatches.length > 0;
  if (hasContactInfo) {
    errorKeys.push('features.like-letter.validation.contact_info');
    detectedPatterns.push(...contactMatches);
  }

  const inappropriateMatches = detectInappropriateContent(text);
  const hasInappropriateContent = inappropriateMatches.length > 0;
  if (hasInappropriateContent) {
    errorKeys.push('features.like-letter.validation.inappropriate');
    detectedPatterns.push(...inappropriateMatches);
  }

  return {
    isValid: errorKeys.length === 0,
    errorKeys,
    hasContactInfo,
    hasInappropriateContent,
    detectedPatterns,
  };
}

export function highlightContactInfo(text: string): { text: string; isHighlighted: boolean }[] {
  const result: { text: string; isHighlighted: boolean }[] = [];
  const contactMatches = detectContactInfo(text);

  if (contactMatches.length === 0) {
    return [{ text, isHighlighted: false }];
  }

  let remainingText = text;

  for (const match of contactMatches) {
    const index = remainingText.indexOf(match);
    if (index === -1) continue;

    if (index > 0) {
      result.push({ text: remainingText.slice(0, index), isHighlighted: false });
    }
    result.push({ text: match, isHighlighted: true });
    remainingText = remainingText.slice(index + match.length);
  }

  if (remainingText) {
    result.push({ text: remainingText, isHighlighted: false });
  }

  return result;
}

export const LETTER_PROMPT_KEYS = [
  'features.like-letter.prompts.travel',
  'features.like-letter.prompts.running',
  'features.like-letter.prompts.design',
];

export { MAX_LETTER_LENGTH };
