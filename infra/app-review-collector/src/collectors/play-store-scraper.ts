import gplay from 'google-play-scraper';
import type { Config, Review } from '../types.js';

export async function collectPlayStoreScraperReviews(
	config: Config,
): Promise<Review[]> {
		const result = await gplay.reviews({
			appId: config.playStorePackageName,
			sort: 2,
			num: 200,
		});

	const reviews: Review[] = result.data.map((r) => ({
		reviewId: r.id,
		store: 'PLAY_STORE' as const,
		rating: r.score,
		body: r.text || '',
		author: r.userName || 'Anonymous',
		appVersion: r.version || undefined,
		createdAt: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
	}));

	console.log(`Play Store Scraper: collected ${reviews.length} reviews`);
	return reviews;
}
