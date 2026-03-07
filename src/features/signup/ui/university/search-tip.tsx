import { semanticColors } from '@/src/shared/constants/semantic-colors';
import HelpIcon from '@assets/icons/help.svg';
import { StyleSheet, Text, View } from 'react-native';

interface SearchTipProps {
	title: string;
	description: string;
}

export function SearchTip({ title, description }: SearchTipProps) {
	return (
		<View style={styles.container}>
			<HelpIcon width={14} height={14} color={semanticColors.brand.primary} />
			<Text style={styles.text}>
				<Text style={styles.title}>{title} </Text>
				<Text style={styles.description}>{description}</Text>
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingVertical: 8,
		paddingHorizontal: 10,
		marginBottom: 8,
		backgroundColor: semanticColors.surface.secondary,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: semanticColors.brand.primary,
	},
	text: {
		flex: 1,
	},
	title: {
		fontSize: 12,
		fontWeight: '600',
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-SemiBold',
	},
	description: {
		fontSize: 12,
		color: semanticColors.text.secondary,
		fontFamily: 'Pretendard-Regular',
	},
});
