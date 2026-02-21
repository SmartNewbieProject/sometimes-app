import type { ScheduledEvent } from 'aws-lambda';
import { loadConfig } from './config.js';
import { collectAppStoreReviews } from './collectors/app-store.js';
import { collectPlayStoreReviews } from './collectors/play-store.js';
import { saveNewReviews } from './storage/dynamodb.js';
import { notifySlack } from './notifier/slack.js';

export async function handler(event: ScheduledEvent): Promise<void> {
  console.log('Event:', JSON.stringify(event));

  const config = await loadConfig();
  const maxPages = config.migrationMode ? 50 : 3;

  console.log(`Mode: ${config.migrationMode ? 'MIGRATION' : 'NORMAL'}, maxPages: ${maxPages}`);

  // Collect reviews from both stores in parallel
  const [appStoreReviews, playStoreReviews] = await Promise.allSettled([
    collectAppStoreReviews(config, maxPages),
    collectPlayStoreReviews(config, maxPages),
  ]);

  const allReviews = [
    ...(appStoreReviews.status === 'fulfilled' ? appStoreReviews.value : []),
    ...(playStoreReviews.status === 'fulfilled' ? playStoreReviews.value : []),
  ];

  if (appStoreReviews.status === 'rejected') {
    console.error('App Store collection failed:', appStoreReviews.reason);
  }
  if (playStoreReviews.status === 'rejected') {
    console.error('Play Store collection failed:', playStoreReviews.reason);
  }

  console.log(`Total collected: ${allReviews.length} reviews`);

  if (allReviews.length === 0) {
    console.log('No reviews collected, exiting');
    return;
  }

  // Save to DynamoDB
  const newReviews = await saveNewReviews(config.tableName, allReviews);
  console.log(`New reviews: ${newReviews.length}`);

  // Notify Slack (skip in migration mode)
  if (!config.migrationMode && newReviews.length > 0) {
    await notifySlack(config.slackBotToken, config.slackChannel, newReviews);
  } else if (config.migrationMode) {
    console.log('Migration mode: skipping Slack notification');
  }

  console.log('Done');
}
