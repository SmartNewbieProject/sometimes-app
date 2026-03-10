import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useToast } from '@/src/shared/hooks/use-toast';
import { AnimatedArrow, Text } from '@/src/shared/ui';
import type { ProfileImage } from '@/src/types/user';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export type PhotoCardStatus = 'none' | 'partial' | 'reviewing' | 'rejected';

function AddIcon() {
	return (
		<Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
			<Path
				d="M10.5 4.5V16.5M4.5 10.5H16.5"
				stroke="#A892D7"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}

function WarningIcon() {
	return (
		<Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
			<Path
				d="M10 7V10M10 13H10.01M18 10C18 14.418 14.418 18 10 18C5.582 18 2 14.418 2 10C2 5.582 5.582 2 10 2C14.418 2 18 5.582 18 10Z"
				stroke="#E53E3E"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}

interface ImageSlotProps {
	label: string;
	isPrimary?: boolean;
}

function ImageSlot({ label, isPrimary = false }: ImageSlotProps) {
	return (
		<View style={styles.slotContainer}>
			<View style={styles.slot}>
				<AddIcon />
			</View>
			<Text
				size="xs"
				weight="medium"
				style={isPrimary ? styles.slotLabelPrimary : styles.slotLabel}
			>
				{label}
			</Text>
		</View>
	);
}

interface PhotoSlotProps {
	image: ProfileImage;
}

function ReviewingPhotoSlot({ image }: PhotoSlotProps) {
	const isRejected = image.reviewStatus === 'rejected';
	return (
		<View style={styles.photoSlotContainer}>
			<View style={[styles.photoSlot, isRejected && styles.photoSlotRejected]}>
				<Image source={{ uri: image.url }} style={styles.photoSlotImage} contentFit="cover" />
				{isRejected && (
					<View style={styles.rejectedOverlay}>
						<WarningIcon />
					</View>
				)}
			</View>
		</View>
	);
}

interface ProfilePhotoCardProps {
	status?: PhotoCardStatus;
	images?: ProfileImage[];
}

export default function ProfilePhotoCard({ status = 'none', images = [] }: ProfilePhotoCardProps) {
	const { t } = useTranslation();
	const { emitToast } = useToast();

	const handlePress = () => {
		if (status === 'reviewing') {
			emitToast(t('features.home.ui.profile_photo_card.reviewing_toast'));
			return;
		}
		router.navigate('/profile/photo-management?referrer=home');
	};

	if (status === 'reviewing' || status === 'rejected') {
		const isRejected = status === 'rejected';
		return (
			<TouchableOpacity
				style={isRejected ? [styles.container, styles.containerRejected] : styles.container}
				onPress={handlePress}
				activeOpacity={0.8}
			>
				<View style={styles.slotsWrapper}>
					{images.map((img) => (
						<ReviewingPhotoSlot key={img.id} image={img} />
					))}
				</View>

				<View style={styles.arrowButtonWrapper}>
					<AnimatedArrow
						direction="right"
						onPress={handlePress}
						size={51}
						backgroundColor={isRejected ? '#E53E3E' : semanticColors.brand.primary}
					/>
				</View>

				<Text size="lg" weight="semibold" textColor="black" style={styles.title}>
					{t(
						isRejected
							? 'features.home.ui.profile_photo_card.rejected_title'
							: 'features.home.ui.profile_photo_card.reviewing_title',
					)}
				</Text>

				<View style={styles.descriptionWrapper}>
					<Text size="xs" textColor="gray" style={styles.description}>
						{t(
							isRejected
								? 'features.home.ui.profile_photo_card.rejected_description'
								: 'features.home.ui.profile_photo_card.reviewing_description',
						)}
					</Text>
					{!isRejected && (
						<Text size="xs" style={[styles.description, styles.highlight]}>
							{t('features.home.ui.profile_photo_card.reviewing_approved')}
						</Text>
					)}
				</View>
			</TouchableOpacity>
		);
	}

	// status === "none" | "partial"
	return (
		<TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
			<View style={styles.slotsWrapper}>
				<ImageSlot label={t('features.home.ui.profile_photo_card.required')} isPrimary />
				<View style={styles.mascotWrapper}>
					<Image
						source={require('@assets/images/give-me-picture-miho.webp')}
						style={styles.mascot}
						contentFit="contain"
					/>
				</View>
				<ImageSlot label={t('features.home.ui.profile_photo_card.recommended')} />
				<ImageSlot label={t('features.home.ui.profile_photo_card.recommended')} />
			</View>

			<View style={styles.arrowButtonWrapper}>
				<AnimatedArrow
					direction="right"
					onPress={handlePress}
					size={51}
					backgroundColor={semanticColors.brand.primary}
				/>
			</View>

			<Text size="lg" weight="semibold" textColor="black" style={styles.title}>
				{t('features.home.ui.profile_photo_card.title')}
			</Text>

			<View style={styles.descriptionWrapper}>
				<Text size="xs" textColor="gray" style={styles.description}>
					{t('features.home.ui.profile_photo_card.description_1')}
					<Text size="xs" style={styles.highlight}>
						{t('features.home.ui.profile_photo_card.description_highlight')}
					</Text>
					{t('features.home.ui.profile_photo_card.description_2')}
				</Text>
				<Text size="xs" textColor="gray" style={styles.description}>
					{t('features.home.ui.profile_photo_card.description_3')}
				</Text>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#F8F4FF',
		borderRadius: 20,
		paddingVertical: 20,
		paddingHorizontal: 16,
		position: 'relative',
	},
	containerRejected: {
		backgroundColor: '#FFF5F5',
	},
	slotsWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		paddingHorizontal: 12,
		marginBottom: 50,
	},
	slotContainer: {
		alignItems: 'center',
		gap: 4,
	},
	slot: {
		width: 84,
		height: 84,
		borderRadius: 15,
		borderWidth: 2,
		borderStyle: 'dashed',
		borderColor: '#A892D7',
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
	},
	slotLabel: {
		color: '#8E8E8E',
	},
	slotLabelPrimary: {
		color: semanticColors.brand.primary,
	},
	mascotWrapper: {
		position: 'absolute',
		left: '50%',
		top: 0,
		transform: [{ translateX: -70 }],
		zIndex: 1,
	},
	mascot: {
		width: 140,
		height: 140,
	},
	photoSlotContainer: {
		alignItems: 'center',
	},
	photoSlot: {
		width: 84,
		height: 84,
		borderRadius: 15,
		overflow: 'hidden',
		borderWidth: 2,
		borderColor: 'transparent',
	},
	photoSlotRejected: {
		borderColor: '#E53E3E',
	},
	photoSlotImage: {
		width: '100%',
		height: '100%',
	},
	rejectedOverlay: {
		position: 'absolute',
		inset: 0,
		backgroundColor: 'rgba(229,62,62,0.25)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	arrowButtonWrapper: {
		position: 'absolute',
		right: 29,
		bottom: 62,
	},
	title: {
		textAlign: 'center',
		marginBottom: 8,
	},
	descriptionWrapper: {
		alignItems: 'center',
	},
	description: {
		textAlign: 'center',
		lineHeight: 16,
	},
	highlight: {
		color: semanticColors.brand.primary,
	},
});
