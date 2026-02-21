import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@shared/ui';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useMatchingMode } from '../hooks/use-matching-mode';

export const ModeToggle = () => {
	const { t } = useTranslation();
	const { isDomesticMode, isGlobalMode, toggleMode } = useMatchingMode();

	return (
		<View style={styles.container}>
			<Pressable
				style={[styles.segment, isDomesticMode && styles.activeSegment]}
				onPress={() => isDomesticMode || toggleMode()}
			>
				<Text style={isDomesticMode ? [styles.segmentText, styles.activeText] : styles.segmentText}>
					{t('features.global-matching.mode_domestic')}
				</Text>
			</Pressable>
			<Pressable
				style={[styles.segment, isGlobalMode && styles.activeSegment]}
				onPress={() => isGlobalMode || toggleMode()}
			>
				<Text style={isGlobalMode ? [styles.segmentText, styles.activeText] : styles.segmentText}>
					{t('features.global-matching.mode_global')}
				</Text>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		backgroundColor: semanticColors.surface.tertiary,
		borderRadius: 12,
		padding: 3,
		marginBottom: 12,
	},
	segment: {
		flex: 1,
		paddingVertical: 8,
		alignItems: 'center',
		borderRadius: 10,
	},
	activeSegment: {
		backgroundColor: semanticColors.surface.background,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	segmentText: {
		fontSize: 14,
		fontWeight: '500',
		fontFamily: 'Pretendard-Medium',
		color: semanticColors.text.muted,
	},
	activeText: {
		color: semanticColors.text.primary,
		fontWeight: '600',
		fontFamily: 'Pretendard-SemiBold',
	},
});
