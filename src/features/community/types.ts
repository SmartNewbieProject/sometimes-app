import type { Gender, UniversityDetail } from '@/src/types/user';

export enum ArticleRequestType {
	GENERAL = 'general',
	REVIEW = 'review',
	LOVE_CONCERNS = 'love-concerns',
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
	commentCount: number;
	readCount: number;
	likeCount: number;
	content: string;
	author: Author;
	updatedAt: string;
	createdAt: string;
	isLiked: boolean;
	comments: Comment[];
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
	replies: Comment[];
}

export interface Category {
	code: string;
	displayName: string;
	emojiUrl: string;
}

export interface CommentForm {
	content: string;
	anonymous: boolean;
}
