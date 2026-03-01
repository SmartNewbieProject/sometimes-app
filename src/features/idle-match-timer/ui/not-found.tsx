import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { ImageResources } from '@/src/shared/libs';
import { Button, ImageResource, Text } from '@/src/shared/ui';
import FrameIcon from '@assets/icons/frame.svg';
import ImproveProfileIcon from '@assets/icons/improve-profile.svg';
import ReloadingIcon from '@assets/icons/reloading.svg';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { MatchFailureCode } from '../types';
import useRematch from '../hooks/use-rematch';
import NotFoundCard from './not-found-card';

type NotFoundProps = {
	failureCode?: MatchFailureCode;
	failureReason?: string;
};

const TOAST_ICONS: Record<MatchFailureCode, string> = {
	NO_MATCH_POOL: '\uD83D\uDD0D',
	FILTERED_OUT: '\u2699\uFE0F',
	ALREADY_MATCHED: '\uD83D\uDC91',
};

function FailureReasonToast({ failureCode, failureReason }: Required<Pick<NotFoundProps, 'failureCode' | 'failureReason'>>) {
	const router = useRouter();
	const { t } = useTranslation();
	const isFiltered = failureCode === 'FILTERED_OUT';

	return (
		<View style={[toastStyles.container, isFiltered && toastStyles.containerFiltered]}>
			<View style={toastStyles.icon}>
				<Text size="14">{TOAST_ICONS[failureCode]}</Text>
			</View>
			<Text size="13" style={toastStyles.text} numberOfLines={2}>
				{failureReason}
			</Text>
			{isFiltered && (
				<TouchableOpacity
					style={toastStyles.action}
					onPress={() => router.push('/profile-edit/interest')}
					activeOpacity={0.7}
				>
					<Text size="12" weight="bold" style={toastStyles.actionText}>
						{t('features.idle-match-timer.ui.not-found.filter_settings')}
					</Text>
				</TouchableOpacity>
			)}
		</View>
	);
}

export const NotFound = ({ failureCode, failureReason }: NotFoundProps) => {
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
				{failureCode && failureReason && (
					<FailureReasonToast failureCode={failureCode} failureReason={failureReason} />
				)}
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

const toastStyles = StyleSheet.create({
	container: {
		width: '100%',
		backgroundColor: semanticColors.brand.deep,
		borderRadius: 12,
		paddingVertical: 12,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	containerFiltered: {
		backgroundColor: '#5C3D8F',
	},
	icon: {
		width: 32,
		height: 32,
		borderRadius: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.15)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		flex: 1,
		color: 'rgba(255, 255, 255, 0.92)',
		lineHeight: 18,
	},
	action: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: 'rgba(226, 213, 255, 0.3)',
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
	},
	actionText: {
		color: semanticColors.brand.primaryLight,
	},
});

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20,
	},
	image: {
		marginTop: 27,
	},
	contentContainer: {
		marginTop: 24,
		marginBottom: 24,
		width: '100%',
		paddingHorizontal: 26,
		alignItems: 'center',
		gap: 12,
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
