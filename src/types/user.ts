export interface ProfileImage {
	id: string;
	order: number;
	isMain: boolean;
	url: string;
	reviewStatus?: string;
}

export interface UniversityDetail {
	name: string | null;
	authentication: boolean;
	department: string | null;
	grade: string | null;
	studentNumber: string | null;
	code: string | null;
	region: string | null;
}

export interface PreferenceOption {
	id: string;
	displayName: string;
	imageUrl?: string | null;
}

export interface PreferenceTypeGroup {
	typeName: string;
	selectedOptions: PreferenceOption[];
}

export interface IntroductionData {
	introductions: string[];
	metadata: {
		source?: string;
		generatedAt?: string;
		lastUpdated?: string;
	};
}

export interface UserProfile {
	id: string;
	name: string;
	age: number;
	gender: 'MALE' | 'FEMALE';
	mbti: string | null;
	rank: string | null;
	instagramId: string | null;
	profileImages: ProfileImage[];
	universityDetails: UniversityDetail | null;
	preferences: PreferenceTypeGroup[];
	characteristics: PreferenceTypeGroup[];
	additionalPreferences: {
		goodMbti: string;
		badMbti: string;
	} | null;
	introductions: string[];
	introductionData?: IntroductionData;
	introduction: string | null;
	keywords: string[] | null;
	connectionId?: string;
	isLikeSended?: number;
	matchLikeId?: string | null;
	deletedAt: string | null;
	updatedAt: string | null;
	phoneNumber: string;
	email?: string;
	isFirstView?: boolean; // 최초 조회 여부 (true: 처음 조회, false: 재조회, undefined: fallback to true)
}

export interface SimpleProfile {
	universityName: string;
	authenticated: boolean;
	age: number;
	mbti: string;
}

export interface MyDetails {
	id: string;
	name: string;
	age: number;
	email: string;
	gender: Gender;
	phoneNumber: string;
	profileImages: ProfileImage[];
	instagramId: string;
	universityDetails: UniversityDetail;
}

export type Gender = 'MALE' | 'FEMALE';
