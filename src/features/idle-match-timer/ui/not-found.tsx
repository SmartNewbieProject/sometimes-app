import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { ImageResources } from '@/src/shared/libs';
import { Button, ImageResource, Text } from '@/src/shared/ui';
import FrameIcon from '@assets/icons/frame.svg';
import ImproveProfileIcon from '@assets/icons/improve-profile.svg';
import ReloadingIcon from '@assets/icons/reloading.svg';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import useRematch from '../hooks/use-rematch';
import NotFoundCard from './not-found-card';

export const NotFound = () => {
	const router = useRouter();
	const { onRematch, isRematchPending } = useRematch();
	const { t } = useTranslation();
	return (
		<View style={styles.container}>
			<ImageResource
				style={styles.image}
				resource={ImageResources.BROKEN_SANDTIMER}
				width={246}
				height={246}
			/>
			<Text textColor="black" size="20" weight={'bold'}>
				{t('features.idle-match-timer.ui.not-found.faild_title')}
			</Text>

			<View style={styles.contentContainer}>
				<NotFoundCard
					title={t('features.idle-match-timer.ui.not-found.faild_try')}
					description={t('features.idle-match-timer.ui.not-found.look_around')}
					button={
						<Button
							size="chip"
							onPress={onRematch}
							disabled={isRematchPending}
							styles={styles.chipButton}
						>
							{t('features.idle-match-timer.ui.not-found.rematch')}
						</Button>
					}
					icon={<ReloadingIcon />}
				/>
				<NotFoundCard
					iconPadding={13}
					title={t('features.idle-match-timer.ui.not-found.expand_condition')}
					description={t('features.idle-match-timer.ui.not-found.expand_ideal_type')}
					button={
						<Button
							variant={'white'}
							size="chip"
							onPress={() => router.push('/profile-edit/interest')}
							textColor="dark"
							styles={styles.editButton}
						>
							{t('features.idle-match-timer.ui.not-found.edit')}
						</Button>
					}
					icon={<FrameIcon width={24} height={24} />}
				/>
				<NotFoundCard
					iconPadding={8}
					title={t('features.idle-match-timer.ui.not-found.improve_profile')}
					description={t('features.idle-match-timer.ui.not-found.update_profile')}
					button={
						<Button
							onPress={() => router.push('/profile-edit/profile')}
							variant={'white'}
							size="chip"
							textColor="dark"
							styles={styles.editButton}
						>
							{t('features.idle-match-timer.ui.not-found.edit')}
						</Button>
					}
					icon={<ImproveProfileIcon width={32} height={32} />}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20,
	},
	image: {
		marginTop: 27,
	},
	title: {
		fontSize: 20,
		fontFamily: 'Pretendard-SemiBold',
		fontWeight: 600,
		lineHeight: 24,
		color: semanticColors.text.primary,
	},
	contentContainer: {
		marginTop: 24,
		marginBottom: 24,
		width: '100%',
		paddingHorizontal: 26,
		alignItems: 'center',
		gap: 12,
	},
	button: {
		paddingHorizontal: 7,
		paddingVertical: 6,
	},
	frameIcon: {
		width: 38,
		height: 38,
	},
	chipButton: {
		paddingHorizontal: 7,
		height: 34,
	},
	editButton: {
		paddingHorizontal: 12,
		height: 33,
		borderColor: semanticColors.border.default,
	},
});
