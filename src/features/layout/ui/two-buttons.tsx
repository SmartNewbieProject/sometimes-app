import { platform } from '@/src/shared/libs';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Button } from '@shared/ui';
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
		<View style={[styles.container, style, { paddingBottom: insets.bottom + 16 }]}>
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
	);
};

const styles = StyleSheet.create({
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
