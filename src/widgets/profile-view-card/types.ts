export interface ProfileMainImageProps {
	imageUrl: string;
	age: number;
	universityDetails: {
		name: string | null;
		code: string | null;
		authentication?: boolean;
		isVerified?: boolean;
	} | null;
	updatedAt?: string | null;
	onPress?: () => void;
	showLastLogin?: boolean;
	country?: 'kr' | 'jp';
}
