import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const LockShieldIcon = () => (
	<Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
		<Path
			d="M12 2L4 6V12C4 17.52 7.41 22.69 12 24C16.59 22.69 20 17.52 20 12V6L12 2Z"
			fill={semanticColors.surface.secondary}
			stroke={semanticColors.brand.primary}
			strokeWidth={1.5}
		/>
		<Rect
			x={9}
			y={10}
			width={6}
			height={5}
			rx={1}
			stroke={semanticColors.brand.primary}
			strokeWidth={1.2}
		/>
		<Path
			d="M10 10V8.5C10 7.397 10.897 6.5 12 6.5C13.103 6.5 14 7.397 14 8.5V10"
			stroke={semanticColors.brand.primary}
			strokeWidth={1.2}
			strokeLinecap="round"
		/>
	</Svg>
);

export const SecurityAssurance = () => {
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<LockShieldIcon />
			<View style={styles.textWrap}>
				<Text size="xs" weight="semibold" textColor="black">
					{t('apps.university-verification.security.title')}
				</Text>
				<Text size="xs" weight="normal" style={styles.desc}>
					{t('apps.university-verification.security.desc')}
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: semanticColors.surface.secondary,
		borderRadius: 12,
		padding: 14,
		gap: 12,
	},
	textWrap: {
		flex: 1,
		gap: 2,
	},
	desc: {
		color: semanticColors.text.muted,
		lineHeight: 16,
	},
});
