export interface Review {
  reviewId: string;
  store: 'APP_STORE' | 'PLAY_STORE';
  rating: number;
  title?: string;
  body: string;
  author: string;
  appVersion?: string;
  language?: string;
  createdAt: string;
}

export interface ReviewRecord extends Review {
  pk: string;
  sk: string;
  collectedAt: string;
}

export interface AppStoreReviewAttributes {
  rating: number;
  title?: string;
  body: string;
  reviewerNickname: string;
  createdDate: string;
}

export interface AppStoreReviewResponse {
  data: Array<{
    id: string;
    attributes: AppStoreReviewAttributes;
  }>;
  links?: {
    next?: string;
  };
}

export interface PlayStoreReviewComment {
  text: string;
  lastModified: { seconds: string };
  starRating: number;
  reviewerLanguage?: string;
  appVersionName?: string;
}

export interface PlayStoreReview {
  reviewId: string;
  authorName: string;
  comments: Array<{
    userComment: PlayStoreReviewComment;
  }>;
}

export interface PlayStoreReviewResponse {
  reviews?: PlayStoreReview[];
  tokenPagination?: {
    nextPageToken?: string;
  };
}

export interface Config {
  tableName: string;
  slackChannel: string;
  appStoreAppId: string;
  playStorePackageName: string;
  migrationMode: boolean;
  appStoreKeyId: string;
  appStoreIssuerId: string;
  appStorePrivateKey: string;
  playStoreServiceAccountJson: string;
  slackBotToken: string;
}
