import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Button } from '@shared/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Platform, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
	onClickPrevious?: () => void;
	onClickNext: () => void;
	content?: {
		prev?: string;
		next?: string;
	};
	disabledNext: boolean;
	style?: StyleProp<ViewStyle>;
	hidePrevious?: boolean;
};

export const TwoButtons = ({
	onClickNext,
	onClickPrevious,
	content,
	style,
	disabledNext,
	hidePrevious = false,
}: Props) => {
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();
	return (
		<View style={styles.wrapper}>
			<LinearGradient
				colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', '#FFFFFF']}
				style={StyleSheet.absoluteFill}
				pointerEvents="none"
			/>
			<View style={[styles.container, { paddingBottom: Platform.OS === 'android' ? 16 : insets.bottom + 16 }, style]}>
				{!hidePrevious && (
					<Button
						variant="secondary"
						styles={[styles.button, { flex: 1 }]}
						onPress={() => onClickPrevious?.()}
					>
						<Text style={styles.prevButtonText}>{content?.prev || t('back')}</Text>
					</Button>
				)}
				<Button onPress={onClickNext} styles={[styles.button, { flex: 1 }]} disabled={disabledNext}>
					<Text style={styles.nextButtonText}>{content?.next || t('next')}</Text>
				</Button>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		width: '100%',
		alignSelf: 'stretch',
	},
	container: {
		flexDirection: 'row',
		width: '100%',
		paddingHorizontal: 16,
		gap: 12,
	},
	button: {
		borderRadius: 20,
	},
	prevButtonText: {
		color: semanticColors.text.primary,
		fontSize: 18,
		fontFamily: 'Pretendard-SemiBold',
	},
	nextButtonText: {
		fontSize: 18,
		color: semanticColors.text.inverse,
		fontFamily: 'Pretendard-SemiBold',
	},
});
