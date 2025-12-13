export interface ProfileImage {
	id: string;
	order: number;
	isMain: boolean;
	url: string;
	imageUrl?: string;
	thumbnailUrl?: string;
	isLocked?: boolean;
	reviewStatus?: string;
	rejectionReason?: string | null;
	retryCount?: number;
	isReviewed?: boolean;
	createdAt?: string;
}

export interface RejectedImage {
	id: string;
	imageUrl: string;
	rejectionReason: string;
	imageOrder: number;
	retryCount: number;
	isReviewed: boolean;
	createdAt: string;
}

export interface RejectedImagesResponse {
	rejectedImages: RejectedImage[];
}

export interface AddImageResponse {
	success: boolean;
	message: string;
	imageId: string;
	imageUrl: string;
	reviewStatus: string;
	imageOrder: number;
	totalImages: number;
}

export interface ReplaceImageResponse {
	success: boolean;
	message: string;
	imageId: string;
	newImageUrl: string;
	reviewStatus: string;
	imageOrder: number;
	isMain: boolean;
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
	isFirstView?: boolean;
	skippedPhotoCount?: number;
	totalPhotoCount?: number;
	myPhotoCount?: number;
	isApproved?: boolean;
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
