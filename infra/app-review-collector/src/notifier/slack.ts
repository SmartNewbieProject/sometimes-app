import type { ReviewRecord } from '../types.js';

function ratingEmoji(rating: number): string {
  if (rating >= 4) return '\u{1F7E2}'; // green circle
  if (rating === 3) return '\u{1F7E1}'; // yellow circle
  return '\u{1F534}'; // red circle
}

function storeEmoji(store: string): string {
  return store === 'APP_STORE' ? '\u{1F34E}' : '\u{1F916}'; // apple / robot
}

function stars(rating: number): string {
  return '\u2B50'.repeat(rating);
}

function storeName(store: string): string {
  return store === 'APP_STORE' ? 'App Store' : 'Play Store';
}

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

function formatReview(review: ReviewRecord): string {
  const lines = [
    `${ratingEmoji(review.rating)} ${storeEmoji(review.store)} ${storeName(review.store)} | ${stars(review.rating)}`,
  ];

  if (review.title) {
    lines.push(`*${review.title}*`);
  }
  lines.push(`"${review.body}"`);

  const meta = [review.author];
  if (review.appVersion) meta.push(`v${review.appVersion}`);
  meta.push(formatDate(review.createdAt));
  lines.push(`- ${meta.join(' | ')}`);

  return lines.join('\n');
}

export async function notifySlack(
  token: string,
  channel: string,
  reviews: ReviewRecord[],
): Promise<void> {
  if (reviews.length === 0) return;

  const header = `*:bell: ${reviews.length}건의 새로운 리뷰*\n`;
  const blocks = reviews.map(formatReview);
  const text = header + blocks.join('\n\n---\n\n');

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel, text }),
  });

  const result = await response.json();
  if (!result.ok) {
    console.error('Slack API error:', result.error);
    throw new Error(`Slack notification failed: ${result.error}`);
  }

  console.log(`Slack: sent ${reviews.length} review notifications`);
}
