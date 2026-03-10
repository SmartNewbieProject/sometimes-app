import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle as SvgCircle, Line, Path, Rect } from 'react-native-svg';

const CheckIcon = () => (
	<Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
		<SvgCircle cx={10} cy={10} r={9} fill="#12B76A" />
		<Path
			d="M6 10.5L8.5 13L14 7"
			stroke="#fff"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

const CrossIcon = () => (
	<Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
		<SvgCircle cx={10} cy={10} r={9} fill="#F04438" />
		<Path d="M7 7L13 13M13 7L7 13" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
	</Svg>
);

const IdCardIcon = () => (
	<Svg width={40} height={28} viewBox="0 0 40 28" fill="none">
		<Rect
			x={1}
			y={1}
			width={38}
			height={26}
			rx={4}
			stroke={semanticColors.brand.primary}
			strokeWidth={1.5}
		/>
		<SvgCircle cx={14} cy={11} r={4} stroke={semanticColors.brand.primary} strokeWidth={1.2} />
		<Line
			x1={24}
			y1={8}
			x2={34}
			y2={8}
			stroke={semanticColors.brand.primary}
			strokeWidth={1.2}
			strokeLinecap="round"
		/>
		<Line
			x1={24}
			y1={12}
			x2={31}
			y2={12}
			stroke={semanticColors.brand.primary}
			strokeWidth={1.2}
			strokeLinecap="round"
		/>
		<Line
			x1={8}
			y1={22}
			x2={32}
			y2={22}
			stroke={semanticColors.brand.primary}
			strokeWidth={1.2}
			strokeLinecap="round"
		/>
	</Svg>
);

const BlurCardIcon = () => (
	<Svg width={40} height={28} viewBox="0 0 40 28" fill="none">
		<Rect
			x={1}
			y={1}
			width={38}
			height={26}
			rx={4}
			stroke="#D0D5DD"
			strokeWidth={1.5}
			strokeDasharray="4 3"
		/>
		<SvgCircle cx={14} cy={11} r={4} stroke="#D0D5DD" strokeWidth={1.2} strokeDasharray="3 2" />
		<Line x1={24} y1={8} x2={34} y2={8} stroke="#D0D5DD" strokeWidth={1.2} strokeDasharray="3 2" />
		<Line
			x1={24}
			y1={12}
			x2={31}
			y2={12}
			stroke="#D0D5DD"
			strokeWidth={1.2}
			strokeDasharray="3 2"
		/>
	</Svg>
);

const PrivacyCardIcon = () => (
	<Svg width={40} height={28} viewBox="0 0 40 28" fill="none">
		<Rect x={1} y={1} width={38} height={26} rx={4} stroke="#D0D5DD" strokeWidth={1.5} />
		<Rect
			x={10}
			y={16}
			width={20}
			height={6}
			rx={2}
			fill="#F04438"
			opacity={0.2}
			stroke="#F04438"
			strokeWidth={1}
		/>
		<Line
			x1={14}
			y1={19}
			x2={26}
			y2={19}
			stroke="#F04438"
			strokeWidth={1.5}
			strokeLinecap="round"
		/>
	</Svg>
);

export const PhotoGuide = () => {
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<Text size="xs" weight="semibold" textColor="black">
				{t('apps.university-verification.photo_guide.title')}
			</Text>
			<View style={styles.guideRow}>
				<View style={styles.guideItem}>
					<View style={[styles.iconBox, styles.okBox]}>
						<IdCardIcon />
					</View>
					<View style={styles.labelRow}>
						<CheckIcon />
						<Text size="xs" weight="normal" style={styles.guideText} numberOfLines={2}>
							{t('apps.university-verification.photo_guide.ok')}
						</Text>
					</View>
				</View>
				<View style={styles.guideItem}>
					<View style={[styles.iconBox, styles.ngBox]}>
						<BlurCardIcon />
					</View>
					<View style={styles.labelRow}>
						<CrossIcon />
						<Text size="xs" weight="normal" style={styles.guideText} numberOfLines={2}>
							{t('apps.university-verification.photo_guide.ng_blur')}
						</Text>
					</View>
				</View>
				<View style={styles.guideItem}>
					<View style={[styles.iconBox, styles.ngBox]}>
						<PrivacyCardIcon />
					</View>
					<View style={styles.labelRow}>
						<CrossIcon />
						<Text size="xs" weight="normal" style={styles.guideText} numberOfLines={2}>
							{t('apps.university-verification.photo_guide.ng_private')}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: semanticColors.surface.secondary,
		borderRadius: 12,
		paddingVertical: 10,
		paddingHorizontal: 12,
		gap: 8,
	},
	guideRow: {
		flexDirection: 'row',
		gap: 8,
	},
	guideItem: {
		flex: 1,
		gap: 4,
	},
	iconBox: {
		width: '100%',
		aspectRatio: 1.6,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	okBox: {
		backgroundColor: '#F0FDF4',
		borderWidth: 1,
		borderColor: '#BBF7D0',
	},
	ngBox: {
		backgroundColor: '#FEF2F2',
		borderWidth: 1,
		borderColor: '#FECACA',
	},
	labelRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 3,
	},
	guideText: {
		flex: 1,
		color: semanticColors.text.tertiary,
		fontSize: 10,
		lineHeight: 14,
	},
});
