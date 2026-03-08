import colors from '@/src/shared/constants/colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
	},
	headerTextCol: {
		flex: 1,
		gap: 3,
	},
	mbtiType: {
		fontSize: 26,
		fontWeight: '800',
		color: '#303030',
		letterSpacing: -1.5,
	},
	title: {
		fontSize: 14,
		fontWeight: '600',
		color: '#303030',
		marginTop: 3,
	},
	description: {
		fontSize: 12,
		color: '#888',
		lineHeight: 12 * 1.65,
		marginTop: 6,
	},
	iconContainer: {
		width: 52,
		height: 52,
		borderRadius: 16,
		overflow: 'hidden',
	},
	icon: {
		width: '100%',
		height: '100%',
	},
	divider: {
		height: 1,
		backgroundColor: '#f0f0f0',
		marginVertical: 10,
	},
	compatibilityContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	compatibilityLabel: {
		fontSize: 11,
		fontWeight: '700',
		color: colors.brand.primary,
		textAlign: 'left',
	},
	compatibilityTagsContainer: {
		flexDirection: 'row',
		gap: 5,
	},
	compatibilityTag: {
		backgroundColor: colors.brand.primary,
		borderRadius: 999,
		paddingHorizontal: 11,
		paddingVertical: 3,
	},
	compatibilityTagText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#FFFFFF',
	},
});
