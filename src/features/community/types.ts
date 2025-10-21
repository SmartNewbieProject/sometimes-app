import type { Gender, UniversityDetail } from "@/src/types/user";

export enum ArticleRequestType {
  GENERAL = "general",
  REVIEW = "review",
  LOVE_CONCERNS = "love-concerns",
}

export type Author = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  universityDetails: UniversityDetail;
};

export type ArticleImage = {
  id: string;
  imageUrl: string;
  displayOrder: number;
};

export type Article = {
  id: string;
  category: ArticleRequestType;
  title: string;
  commentCount: number;
  readCount: number;
  likeCount: number;
  content: string;
  author: Author;
  updatedAt: string;
  createdAt: string;
  isLiked: boolean;
  comments: Comment[];
  images?: ArticleImage[];
};

export interface Comment {
  id: string;
  articleId: string;
  authorId: string;
  content: string;
  author: Author;
  updatedAt: string;
  createdAt: string;
  deletedAt: string;
  isLiked: boolean;
  likeCount: number;
  parentId: string | null;
  replies: Comment[];
  replyCount: number;
}

export type MyComment = {
  id: string;
  content: string;
  createdAt: string;
  article: Article;
};

export type MyLike = {
  id: string;
  content: string;
  createdAt: string;
  article: Article;
};

export interface Category {
  code: string;
  displayName: string;
  emojiUrl: string;
}

export interface CommentForm {
  content: string;
  anonymous: boolean;
}
