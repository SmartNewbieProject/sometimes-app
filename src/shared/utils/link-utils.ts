/**
 * Link detection and parsing utilities
 */

export interface TextSegment {
  type: 'text' | 'link';
  content: string;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

/**
 * 텍스트에서 URL이 포함되어 있는지 확인
 */
export function hasLinks(text: string): boolean {
  return !!text && URL_REGEX.test(text);
}

/**
 * 텍스트를 파싱하여 링크와 일반 텍스트로 분리
 */
export function parseTextWithLinks(text: string): TextSegment[] {
  if (!text) return [{ type: 'text', content: text }];

  const segments: TextSegment[] = [];
  let lastIndex = 0;

  URL_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null = URL_REGEX.exec(text);
  while (match !== null) {
    const matchStart = match.index;
    const url = match[0];

    if (matchStart > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, matchStart),
      });
    }

    segments.push({
      type: 'link',
      content: url,
    });

    lastIndex = URL_REGEX.lastIndex;
    match = URL_REGEX.exec(text);
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }];
}
