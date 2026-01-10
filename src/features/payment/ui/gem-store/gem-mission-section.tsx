import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { ImageResources } from '@/src/shared/libs';
import { GlowingCard, ImageResource, Text } from '@/src/shared/ui';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

export type MissionStatus = 'pending' | 'claimable' | 'completed';

export type GemMission = {
	id: string;
	titleKey: string;
	reward: number;
	status: MissionStatus;
	navigateTo?: string;
};

type GemMissionSectionProps = {
	missions: GemMission[];
	onMissionPress: (mission: GemMission) => void;
};

type MissionItemProps = {
	mission: GemMission;
	onPress: (mission: GemMission) => void;
};

const MissionItem = ({ mission, onPress }: MissionItemProps) => {
	const { t } = useTranslation();
	const isCompleted = mission.status === 'completed';

	const handlePress = () => {
		if (isCompleted) return;
		onPress(mission);
	};

	const renderStatusButton = () => {
		switch (mission.status) {
			case 'completed':
				return (
					<View style={styles.completedButton}>
						<Text style={styles.completedButtonText}>{t('features.payment.ui.gem_mission.status.completed')}</Text>
					</View>
				);
			case 'claimable':
				return (
					<Pressable style={styles.claimableButton} onPress={handlePress}>
						<Text style={styles.claimableButtonText}>{t('features.payment.ui.gem_mission.status.claimable')}</Text>
					</Pressable>
				);
			case 'pending':
			default:
				return (
					<Pressable style={styles.claimableButton} onPress={handlePress}>
						<Text style={styles.claimableButtonText}>{t('features.payment.ui.gem_mission.status.claimable')}</Text>
					</Pressable>
				);
		}
	};

	const Container = isCompleted ? View : Pressable;
	const containerProps = isCompleted ? {} : { onPress: handlePress };

	return (
		<Container style={styles.missionItem} {...containerProps}>
			<View style={styles.missionLeft}>
				<View style={styles.rewardBadge}>
					<ImageResource resource={ImageResources.GEM} width={33} height={33} />
					<Text style={styles.rewardText}>+{mission.reward}</Text>
				</View>
				<Text style={styles.missionTitle}>{t(mission.titleKey)}</Text>
			</View>
			{renderStatusButton()}
		</Container>
	);
};

export const GemMissionSection = ({ missions, onMissionPress }: GemMissionSectionProps) => {
	const { t } = useTranslation();

	return (
		<GlowingCard>
			<View style={styles.header}>
				<Text style={styles.giftEmoji}>🎁</Text>
				<Text weight="semibold" size="20" textColor="black">
					{t('features.payment.ui.gem_mission.header_title')}
				</Text>
			</View>

			<View style={styles.missionList}>
				{missions.map((mission, index) => (
					<View key={mission.id}>
						<MissionItem mission={mission} onPress={onMissionPress} />
						{index < missions.length - 1 && <View style={styles.divider} />}
					</View>
				))}
			</View>
		</GlowingCard>
	);
};

const MISSION_BORDER_COLOR = '#E6DBFF';

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginBottom: 12,
	},
	giftEmoji: {
		fontSize: 20,
	},
	missionList: {
		backgroundColor: semanticColors.surface.background,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: MISSION_BORDER_COLOR,
		padding: 16,
	},
	missionItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 8,
	},
	missionLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14,
		flex: 1,
	},
	rewardBadge: {
		position: 'relative',
		width: 39,
		height: 39,
	},
	rewardText: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		fontSize: 10,
		fontWeight: '600',
		color: '#343434',
	},
	missionTitle: {
		fontSize: 15,
		fontWeight: '500',
		color: semanticColors.text.primary,
		flex: 1,
	},
	completedButton: {
		backgroundColor: colors.primaryPurple,
		paddingHorizontal: 15,
		paddingVertical: 6,
		borderRadius: 20,
	},
	completedButtonText: {
		color: semanticColors.text.inverse,
		fontSize: 13,
		fontWeight: '600',
	},
	claimableButton: {
		borderWidth: 1,
		borderColor: colors.primaryPurple,
		paddingHorizontal: 15,
		paddingVertical: 6,
		borderRadius: 20,
	},
	claimableButtonText: {
		color: colors.primaryPurple,
		fontSize: 13,
		fontWeight: '500',
	},
	divider: {
		height: 1,
		backgroundColor: MISSION_BORDER_COLOR,
		marginVertical: 4,
	},
});
