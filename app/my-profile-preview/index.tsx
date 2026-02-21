import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { MatchingReasonPlaceholder, PartnerBasicInfo, PartnerMBTI, PartnerIdealType } from '@/src/features/match/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { ProfileMainImage } from '@/src/widgets/profile-view-card';
import PhotoSlider from '@/src/widgets/slide/photo-slider';
import Loading from '@features/loading';
import { HeaderWithNotification } from '@shared/ui';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function MyProfilePreviewScreen() {
	const { t, i18n } = useTranslation();
	const country = i18n.language?.startsWith('ja') ? 'jp' : 'kr';
	const { profileDetails } = useAuth();
	const [isZoomVisible, setZoomVisible] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);

	const handleBack = () => {
		router.back();
	};

	if (!profileDetails) {
		return <Loading.Page title={t('apps.partner.view.loading')} />;
	}

	// 유효한 이미지만 필터링 (imageUrl 또는 url이 있는 것만)
	const validProfileImages = profileDetails.profileImages.filter((img) => img.imageUrl || img.url);

	const mainImageUrl =
		validProfileImages.find((img) => img.isMain)?.imageUrl ||
		validProfileImages.find((img) => img.isMain)?.url ||
		validProfileImages[0]?.imageUrl ||
		validProfileImages[0]?.url;

	const onZoomClose = () => {
		setZoomVisible(false);
	};

	return (
		<View style={styles.mainContainer}>
			<PhotoSlider
				images={validProfileImages.map((item) => item.imageUrl || item.url) ?? []}
				onClose={onZoomClose}
				initialIndex={selectedIndex}
				visible={isZoomVisible}
			/>

			<HeaderWithNotification backButtonAction={handleBack} />

			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				{validProfileImages.length > 0 && mainImageUrl && (
					<ProfileMainImage
						imageUrl={mainImageUrl}
						age={profileDetails.age}
						universityDetails={profileDetails.universityDetails}
						showLastLogin={false}
						country={country}
						onPress={() => {
							setSelectedIndex(0);
							setZoomVisible(true);
						}}
					/>
				)}

				<PartnerBasicInfo partner={profileDetails} />

				{validProfileImages.length > 1 && (
					<View style={styles.additionalImageContainer}>
						<Pressable
							onPress={() => {
								setSelectedIndex(1);
								setZoomVisible(true);
							}}
							style={styles.additionalImagePressable}
						>
							<Image
								source={{ uri: validProfileImages[1].imageUrl || validProfileImages[1].url }}
								style={styles.additionalImage}
								contentFit="cover"
							/>
						</Pressable>
					</View>
				)}

				<PartnerMBTI partner={profileDetails} />

				<PartnerIdealType partner={profileDetails} />

				<MatchingReasonPlaceholder />

				{validProfileImages.length > 2 && (
					<View style={styles.additionalImageContainer}>
						<Pressable
							onPress={() => {
								setSelectedIndex(2);
								setZoomVisible(true);
							}}
							style={styles.additionalImagePressable}
						>
							<Image
								source={{ uri: validProfileImages[2].imageUrl || validProfileImages[2].url }}
								style={styles.additionalImage}
								contentFit="cover"
							/>
						</Pressable>
					</View>
				)}

				{validProfileImages.length > 3 && (
					<View style={styles.remainingImagesContainer}>
						{validProfileImages.slice(3).map((item, index) => (
							<View key={item.id} style={styles.additionalImageContainer}>
								<Pressable
									onPress={() => {
										setSelectedIndex(index + 3);
										setZoomVisible(true);
									}}
									style={styles.additionalImagePressable}
								>
									<Image
										source={{ uri: item.imageUrl || item.url }}
										style={styles.additionalImage}
										contentFit="cover"
									/>
								</Pressable>
							</View>
						))}
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		backgroundColor: semanticColors.surface.background,
	},
	scrollView: {
		flex: 1,
	},
	additionalImageContainer: {
		width: '100%',
		aspectRatio: 1,
		marginBottom: 32,
		overflow: 'hidden',
	},
	additionalImagePressable: {
		width: '100%',
		height: '100%',
		borderRadius: 32,
		overflow: 'hidden',
	},
	additionalImage: {
		width: '100%',
		height: '100%',
	},
	remainingImagesContainer: {
		paddingBottom: 10,
	},
});
