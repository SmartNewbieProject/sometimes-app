import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import type { Review, ReviewRecord } from '../types.js';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function toRecord(review: Review): ReviewRecord {
  return {
    ...review,
    pk: `REVIEW#${review.store}#${review.reviewId}`,
    sk: `CREATED#${review.createdAt}`,
    collectedAt: new Date().toISOString(),
  };
}

async function exists(tableName: string, pk: string): Promise<boolean> {
  const result = await client.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': pk },
      Limit: 1,
      Select: 'COUNT',
    }),
  );
  return (result.Count ?? 0) > 0;
}

export async function saveNewReviews(
  tableName: string,
  reviews: Review[],
): Promise<ReviewRecord[]> {
  if (reviews.length === 0) return [];

  const records = reviews.map(toRecord);

  // Check which reviews are new
  const existChecks = await Promise.all(
    records.map(async (record) => ({
      record,
      isNew: !(await exists(tableName, record.pk)),
    })),
  );

  const newRecords = existChecks
    .filter((c) => c.isNew)
    .map((c) => c.record);

  if (newRecords.length === 0) {
    console.log('No new reviews to save');
    return [];
  }

  // BatchWrite in chunks of 25
  const chunks: ReviewRecord[][] = [];
  for (let i = 0; i < newRecords.length; i += 25) {
    chunks.push(newRecords.slice(i, i + 25));
  }

  for (const chunk of chunks) {
    await client.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: chunk.map((record) => ({
            PutRequest: { Item: record },
          })),
        },
      }),
    );
  }

  console.log(`Saved ${newRecords.length} new reviews to DynamoDB`);
  return newRecords;
}
