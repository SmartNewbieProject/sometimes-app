export interface ProfileImage {
	id: string;
	order: number;
	slotIndex: number;
	isMain: boolean;
	url: string;
	imageUrl?: string;
	thumbnailUrl?: string;
	isLocked?: boolean;
	reviewStatus?: string;
	rejectionReason?: string | null;
	retryCount?: number;
	isReviewed?: boolean;
	replacingImageId?: string | null;
	createdAt?: string;
}

export interface ManagementImagesResponse {
	images: [ProfileImage | null, ProfileImage | null, ProfileImage | null];
}

export interface ManagementSlot {
	slotIndex: number;
	image: ProfileImage | null;
}

export interface ManagementSlotsResponse {
	slots: [ManagementSlot, ManagementSlot, ManagementSlot];
}

export interface RejectedImage {
	id: string;
	imageUrl: string;
	rejectionReason: string;
	imageOrder: number;
	slotIndex: number;
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
	image: ProfileImage;
}

export interface ReplaceImageResponse {
	success: boolean;
	message: string;
	oldImage: {
		id: string;
		slotIndex: number;
		reviewStatus: string;
	};
	newImage: ProfileImage;
}

export interface UniversityDetail {
	name: string | null;
	authentication: boolean;
	department: string | null;
	grade: string | null;
	studentNumber: string | null;
	code: string | null;
	region: string | null;
	isVerified?: boolean;
}

export interface PreferenceOption {
	id: string;
	displayName: string;
	imageUrl?: string | null;
	key?: string; // NEW! 영어 ID (예: "SAME_AGE", "YOUNGER")
}

export interface PreferenceTypeGroup {
	typeName: string;
	typeKey?: string; // NEW! 영어 ID (예: "AGE_PREFERENCE")
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

export interface ExternalMatchInfo {
	region: string;
	requestedRegion: string;
	matchedRegion: string;
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
	status?: 'approved' | 'rejected' | 'pending';
	matchScore?: number;
	isFirstMatch?: boolean;
	tier?: string;
	canLetter?: boolean;
	external?: ExternalMatchInfo | null;
	idealTypeResult?: {
		name: string;
		tags: string[];
	} | null;
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
	createdAt?: string;
	nickname?: string;
	totalMatches?: number;
	hasPurchased?: boolean;
	totalSpent?: number;
}

export type Gender = 'MALE' | 'FEMALE';
