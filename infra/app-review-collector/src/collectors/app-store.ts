import jwt from 'jsonwebtoken';
import type { Config, Review, AppStoreReviewResponse } from '../types.js';

const APP_STORE_API = 'https://api.appstoreconnect.apple.com/v1';

function generateJWT(config: Config): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: config.appStoreIssuerId,
    iat: now,
    exp: now + 20 * 60,
    aud: 'appstoreconnect-v1',
  };

  return jwt.sign(payload, config.appStorePrivateKey, {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: config.appStoreKeyId,
      typ: 'JWT',
    },
  });
}

function normalizeReview(raw: AppStoreReviewResponse['data'][0]): Review {
  return {
    reviewId: raw.id,
    store: 'APP_STORE',
    rating: raw.attributes.rating,
    title: raw.attributes.title,
    body: raw.attributes.body,
    author: raw.attributes.reviewerNickname,
    createdAt: raw.attributes.createdDate,
  };
}

export async function collectAppStoreReviews(
  config: Config,
  maxPages = 3,
): Promise<Review[]> {
  const token = generateJWT(config);
  const reviews: Review[] = [];
  let url: string | null =
    `${APP_STORE_API}/apps/${config.appStoreAppId}/customerReviews?sort=-createdDate&limit=20`;

  for (let page = 0; page < maxPages && url; page++) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`App Store API error (${response.status}):`, text);
      break;
    }

    const data: AppStoreReviewResponse = await response.json();
    reviews.push(...data.data.map(normalizeReview));
    url = data.links?.next ?? null;
  }

  console.log(`App Store: collected ${reviews.length} reviews`);
  return reviews;
}
