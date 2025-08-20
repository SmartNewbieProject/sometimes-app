import type { ILiked, LikedMe } from '../../like/type/like';

export const likedMeMock = (gender: 'FEMALE' | 'MALE'): LikedMe[] => {
	return [
		{
			status: 'active',
			likedAt: '2025-08-19T10:00:00Z',
			instagram: 'insta_001',
			matchExpiredAt: '2025-09-01T00:00:00Z',
			isExpired: false,
			mainProfileUrl:
				gender === 'FEMALE'
					? 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/mock_man_0.png'
					: 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/mock_woman_0.png',
			nickname: '다온재',
			matchId: 'match_001',
			universityName: '한빛대학교',
			age: 24,
			viewedAt: '2025-08-18T15:00:00Z',
			deletedAt: null,
			connectionId: 'conn_001',
			isMutualLike: true,
		},
	];
};

export const mockLikedMe = (gender: 'FEMALE' | 'MALE'): LikedMe => ({
	status: 'PENDING',
	likedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
	instagram: null,
	mainProfileUrl:
		gender === 'MALE'
			? 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/mock_woman_0.png'
			: 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/mock_man_0.png',
	nickname: gender === 'MALE' ? '김소희' : '김건우',
	matchId: 'match_001',
	universityName: '서울대학교',
	age: 24,
	viewedAt: null,
	matchExpiredAt: getFutureDate(24 + 2),
	isExpired: false,
	connectionId: 'conn_001',
	isMutualLike: false,
	deletedAt: null,
});

export const mockILiked = (gender: 'FEMALE' | 'MALE'): ILiked => ({
	status: 'REJECTED',
	likedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 45분 전
	instagram: null,
	mainProfileUrl:
		gender === 'MALE'
			? 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/mock_woman_0.png'
			: 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/mock_man_0.png',
	nickname: gender === 'MALE' ? '이지혜' : '박민석',
	matchId: 'match_102',
	universityName: '한양대학교',
	age: 27,
	viewedAt: null,
	matchExpiredAt: getFutureDate(1),
	isExpired: false,
	connectionId: 'conn_102',
	isMutualLike: false,
	deletedAt: null,
});

function getFutureDate(hoursToAdd: number) {
	const future = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000); // hours → ms
	const yyyy = future.getFullYear();
	const mm = String(future.getMonth() + 1).padStart(2, '0');
	const dd = String(future.getDate()).padStart(2, '0');
	const hh = String(future.getHours()).padStart(2, '0');
	const min = String(future.getMinutes()).padStart(2, '0');
	const ss = String(future.getSeconds()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

export const LIKE_TUTORIAL_KEY = 'like-guide';
