export interface ProfileImage {
	id: string;
	order: number;
	isMain: boolean;
	url: string;
}

export interface UniversityDetail {
	name: string;
	authentication: boolean;
	department: string;
	grade: string;
	studentNumber: string;
}

export interface PreferenceOption {
	id: string;
	displayName: string;
	imageUrl?: string;
}

export interface PreferenceTypeGroup {
	typeName: string;
	selectedOptions: PreferenceOption[];
}

export interface UserProfile {
	id: string;
	name: string;
	age: number;
	mbti: string;
	characteristics: PreferenceTypeGroup[];
	additionalPreferences: {
		[key: string]: string;
	};
	connectionId?: string;
	isLikeSended?: number;
	gender: string;
	profileImages: ProfileImage[];
	instagramId: string;
	universityDetails: UniversityDetail;
	preferences: PreferenceTypeGroup[];
	deletedAt: string | null;
	matchLikeId?: string | null;
	updatedAt?: string | null;
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
