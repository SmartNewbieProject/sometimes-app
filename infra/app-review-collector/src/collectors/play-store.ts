import { GoogleAuth } from 'google-auth-library';
import type { Config, Review, PlayStoreReview, PlayStoreReviewResponse } from '../types.js';

const PLAY_API = 'https://androidpublisher.googleapis.com/androidpublisher/v3';

function normalizeReview(raw: PlayStoreReview): Review {
  const comment = raw.comments[0]?.userComment;
  if (!comment) throw new Error(`No user comment for review ${raw.reviewId}`);

  return {
    reviewId: raw.reviewId,
    store: 'PLAY_STORE',
    rating: comment.starRating,
    body: comment.text,
    author: raw.authorName,
    appVersion: comment.appVersionName,
    language: comment.reviewerLanguage,
    createdAt: new Date(Number(comment.lastModified.seconds) * 1000).toISOString(),
  };
}

export async function collectPlayStoreReviews(
  config: Config,
  maxPages = 3,
): Promise<Review[]> {
  const credentials = JSON.parse(config.playStoreServiceAccountJson);
  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse.token;
  if (!accessToken) throw new Error('Failed to get Google access token');

  const reviews: Review[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({ maxResults: '100' });
    if (pageToken) params.set('token', pageToken);

    const url = `${PLAY_API}/applications/${config.playStorePackageName}/reviews?${params}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Play Store API error (${response.status}):`, text);
      break;
    }

    const data: PlayStoreReviewResponse = await response.json();
    if (!data.reviews?.length) break;

    reviews.push(...data.reviews.map(normalizeReview));
    pageToken = data.tokenPagination?.nextPageToken;
    if (!pageToken) break;
  }

  console.log(`Play Store: collected ${reviews.length} reviews`);
  return reviews;
}
