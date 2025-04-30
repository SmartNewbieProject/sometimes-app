import { Gender, UniversityDetail } from "@/src/types/user";

export enum ArticleRequestType {
  GENERAL = 'general',
  REVIEW = 'review',
  LOVE_CONCERNS = 'love-concerns'
}

export type Author = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  universityDetails: UniversityDetail;
};

export type Article = {
  id: string;
  category: ArticleRequestType;
  title: string;
  readCount: number;
  likeCount: number;
  content: string;
  author: Author;
  updatedAt: Date;
  isLiked: boolean;
  comments: Comment[];
};

export interface Comment {
  id: string;
  content: string;
  author: Author;
  updatedAt: Date;
};

export interface Category {
  code: string;
  displayName: string;
  emojiUrl: string;
}
