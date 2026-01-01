import type { Article } from '../types';

export const mockArticles: Article[] = [
	{
		id: '1',
		title: 'First Post',
		content: 'Hello! This is the first post.',
		createdAt: new Date(
			Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
		).toISOString(),
		author: {
			id: '1',
			name: 'Hong Gildong',
			age: 25,
			gender: 'MALE' as const,
			universityDetails: {
				name: 'Seoul National University',
				authentication: true,
				department: 'Computer Science',
				grade: 'Junior',
				studentNumber: '2021001',
				code: 'SNU',
				region: 'Seoul',
			},
		},
		category: 'general' as any,
		commentCount: 0,
		readCount: 0,
		likeCount: 0,
		updatedAt: new Date().toISOString(),
		isLiked: false,
		comments: [],
	},
	{
		id: '2',
		title: 'Second Post',
		content: 'Nice to meet you! This is the second post.',
		createdAt: new Date(
			Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
		).toISOString(),
		author: {
			id: '2',
			name: 'Kim Chulsoo',
			age: 23,
			gender: 'FEMALE' as const,
			universityDetails: {
				name: 'Yonsei University',
				authentication: true,
				department: 'Economics',
				grade: 'Sophomore',
				studentNumber: '2022001',
				code: 'YSU',
				region: 'Seoul',
			},
		},
		category: 'general' as any,
		commentCount: 0,
		readCount: 0,
		likeCount: 0,
		updatedAt: new Date().toISOString(),
		isLiked: false,
		comments: [],
	},
	{
		id: '3',
		title: 'Third Post',
		content: 'Looking forward to it! This is the third post.',
		createdAt: new Date(
			Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
		).toISOString(),
		author: {
			id: '3',
			name: 'Lee Younghee',
			age: 27,
			gender: 'MALE' as const,
			universityDetails: {
				name: 'Korea University',
				authentication: true,
				department: 'Korean Literature',
				grade: 'Senior',
				studentNumber: '2020001',
				code: 'KU',
				region: 'Seoul',
			},
		},
		category: 'general' as any,
		commentCount: 0,
		readCount: 0,
		likeCount: 0,
		updatedAt: new Date().toISOString(),
		isLiked: false,
		comments: [],
	},
];

export const mockPopularArticles: Article[] = [
	{
		id: '4',
		title: 'Rabbits are cute',
		content: 'Rabbits are adorable. They hop around energetically. Rabbits love carrots.',
		createdAt: new Date(
			Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
		).toISOString(),
		author: {
			id: '4',
			name: 'Rabbit Lover',
			age: 22,
			gender: 'MALE' as const,
			universityDetails: {
				name: 'Seoul National University',
				authentication: true,
				department: null,
				grade: null,
				studentNumber: null,
				code: 'SNU',
				region: 'Seoul',
			},
		},
		category: 'general' as any,
		commentCount: 0,
		readCount: 5,
		likeCount: 10,
		updatedAt: new Date().toISOString(),
		isLiked: false,
		comments: [],
	},
	{
		id: '5',
		title: 'Something amazing happened today',
		content:
			'No seriously, it was incredible. I saw a shooting star on my way to school today. For real!!',
		createdAt: new Date(
			Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
		).toISOString(),
		author: {
			id: '5',
			name: 'Star Enthusiast',
			age: 24,
			gender: 'FEMALE' as const,
			universityDetails: {
				name: 'Seoul National University',
				authentication: true,
				department: null,
				grade: null,
				studentNumber: null,
				code: 'SNU',
				region: 'Seoul',
			},
		},
		category: 'general' as any,
		commentCount: 0,
		readCount: 8,
		likeCount: 15,
		updatedAt: new Date().toISOString(),
		isLiked: false,
		comments: [],
	},
];

export const mockComments = [
	{
		id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
		articleId: '1',
		content: 'First comment on the first post.',
		createdAt: new Date(
			Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
		).toISOString(),
		author: {
			id: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
			name: 'Kim Chulsoo',
			age: 20,
			university: {
				name: 'Seoul National University',
				image: require('@/assets/images/univ.png'),
			},
		},
	},
	{
		id: '9f8b7e2b-4c3b-4f2b-8f3b-2f3b4f2b3f4b',
		articleId: '1',
		content: 'Second comment on the first post.',
		createdAt: new Date(
			Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
		).toISOString(),
		author: {
			id: 'b2f9e2b7-4c3b-4f2b-8f3b-2f3b4f2b3f4b',
			name: 'Lee Younghee',
			age: 20,
			university: {
				name: 'Seoul National University',
				image: require('@/assets/images/univ.png'),
			},
		},
	},
	{
		id: '3f4b2f9e-2b7e-4c3b-4f2b-8f3b2f3b4f2b',
		articleId: '2',
		content: 'First comment on the second post.',
		createdAt: new Date(
			Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
		).toISOString(),
		author: {
			id: 'a2b3f4b2-9e2b-7e4c-3b4f-2b8f3b2f3b4f',
			name: 'Hong Gildong',
			age: 20,
			university: {
				name: 'Seoul National University',
				image: require('@/assets/images/univ.png'),
			},
		},
	},
	{
		id: '4f2b3f4b-2f9e-2b7e-4c3b-4f2b8f3b2f3b',
		articleId: '4',
		content: 'Rabbits are so cute ㅠㅠ',
		createdAt: new Date(
			Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
		).toISOString(),
		author: {
			id: 'b2f3b4f2-9e2b-7e4c-3b4f-2b8f3b2f3b4f',
			name: 'Rabbit Fan',
			age: 20,
			university: {
				name: 'Seoul National University',
				image: require('@/assets/images/univ.png'),
			},
		},
	},
	{
		id: '5f2b3f4b-2f9e-2b7e-4c3b-4f2b8f3b2f3b',
		articleId: '5',
		content: 'Really?? I wanted to see it too!!',
		createdAt: new Date(
			Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
		).toISOString(),
		author: {
			id: 'c2f3b4f2-9e2b-7e4c-3b4f-2b8f3b2f3b4f',
			name: 'Star Watcher',
			age: 20,
			university: {
				name: 'Seoul National University',
				image: require('@/assets/images/univ.png'),
			},
		},
	},
	{
		id: '6f2b3f4b-2f9e-2b7e-4c3b-4f2b8f3b2f3b',
		articleId: '1',
		content: 'Reply to the first comment.',
		createdAt: new Date(
			Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
		).toISOString(),
		author: {
			id: 'd2f3b4f2-9e2b-7e4c-3b4f-2b8f3b2f3b4f',
			name: 'Lee Younghee',
			age: 20,
			university: {
				name: 'Seoul National University',
				image: require('@/assets/images/univ.png'),
			},
		},
		repliesid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
	},
];
