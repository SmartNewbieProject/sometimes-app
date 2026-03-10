import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const ClockIcon = ({
	size = 20,
	color = semanticColors.state.warning,
	strokeWidth = 1.8,
}: { size?: number; color?: string; strokeWidth?: number }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Path
			d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
			stroke={color}
			strokeWidth={strokeWidth}
		/>
		<Path
			d="M12 6V12L16 14"
			stroke={color}
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

const ChevronRightIcon = ({
	size = 16,
	color = semanticColors.text.muted,
}: { size?: number; color?: string }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Path
			d="M9 18l6-6-6-6"
			stroke={color}
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

export const PendingReviewCard = () => {
	const { t } = useTranslation();

	return (
		<Pressable
			style={styles.container}
			onPress={() => router.push('/university-verification/idcard')}
		>
			<View style={styles.iconWrap}>
				<ClockIcon />
			</View>
			<View style={styles.textWrap}>
				<Text size="sm" weight="semibold" textColor="black" numberOfLines={1}>
					{t('apps.university-verification.pending.title')}
				</Text>
				<Text size="xs" weight="normal" style={styles.subtitle} numberOfLines={1}>
					{t('apps.university-verification.pending.subtitle')}
				</Text>
			</View>
			<ChevronRightIcon />
		</Pressable>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFBEB',
		borderRadius: 14,
		padding: 14,
		borderWidth: 1,
		borderColor: '#FDE68A',
		gap: 10,
	},
	iconWrap: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: '#FEF3C7',
		alignItems: 'center',
		justifyContent: 'center',
	},
	textWrap: {
		flex: 1,
		gap: 1,
	},
	subtitle: {
		color: semanticColors.text.muted,
	},
});
