import type { UserProfile } from '@/src/types/user';
import type { GlobalPartner } from '../types';

export function mapGlobalPartnerToUserProfile(partner: GlobalPartner): UserProfile {
	return {
		id: partner.id,
		name: partner.name,
		age: partner.age,
		gender: 'MALE',
		mbti: null,
		rank: null,
		instagramId: null,
		profileImages: [
			{
				id: 'main',
				order: 0,
				slotIndex: 0,
				isMain: true,
				url: partner.mainProfileImageUrl,
				thumbnailUrl: partner.mainProfileThumbnail,
			},
		],
		universityDetails: {
			name: partner.university,
			authentication: false,
			department: partner.department,
			grade: null,
			studentNumber: null,
			code: null,
			region: null,
		},
		preferences: partner.preferences,
		characteristics: partner.characteristics,
		additionalPreferences: null,
		introductions: partner.introduction ? [partner.introduction] : [],
		introduction: partner.introduction,
		keywords: partner.keywords,
		connectionId: partner.connectionId,
		isLikeSended: partner.isLikeSended,
		matchScore: partner.matchScore,
		deletedAt: null,
		updatedAt: null,
		phoneNumber: '',
		external: {
			region: partner.country,
			requestedRegion: partner.country === 'jp' ? 'JP' : 'KR',
			matchedRegion: partner.country === 'jp' ? 'KR' : 'JP',
		},
	};
}
