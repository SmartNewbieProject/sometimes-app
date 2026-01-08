import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { IconWrapper } from '@/src/shared/ui/icons';
import ArrowRight from '@assets/icons/right-white-arrow.svg';
import { Text } from '@/src/shared/ui/text';
import { useRouter } from 'expo-router';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

export const SideButton = () => {
	const router = useRouter();
	const { t } = useTranslation();

	return (
		<TouchableOpacity
			style={styles.container}
			onPress={() => router.push('/matching-history')}
			activeOpacity={0.8}
		>
			{/* SVG로 부드러운 곡선 배경 만들기 */}
			<Svg
				width="80"
				height="120"
				viewBox="0 0 80 120"
				style={StyleSheet.absoluteFill}
			>
				<Path
					d="M 80,0
					   L 30,0
					   Q 0,0 0,30
					   L 0,90
					   Q 0,120 30,120
					   L 80,120
					   Z"
					fill={semanticColors.brand.primary}
				/>
			</Svg>

			{/* 버튼 내용 */}
			<View style={styles.content}>
				<Text style={styles.buttonText} textColor="white" size="12" weight="bold">
					{t('features.idle-match-timer.ui.waiting.preview_button_line1')}{'\n'}
					{t('features.idle-match-timer.ui.waiting.preview_button_line2')}
				</Text>
				<IconWrapper width={24} height={24}>
					<ArrowRight />
				</IconWrapper>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		right: 0,
		top: '15%',
		width: 80,
		height: 120,
		zIndex: 10,
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingLeft: 4,
		paddingRight: 10,
	},
	buttonText: {
		textAlign: 'center',
		marginBottom: 8,
		lineHeight: 18,
	},
});
