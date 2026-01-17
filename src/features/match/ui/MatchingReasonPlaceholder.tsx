import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

export const MatchingReasonPlaceholder = () => {
	const { t } = useTranslation();

	return (
		<View style={styles.wrapper}>
			<Text style={styles.sectionTitle} textColor="primary">
				{t('features.match.ui.matching_reason_placeholder.title')}
			</Text>

			<View style={styles.container}>
				<View style={styles.iconContainer}>
					<Feather name="heart" size={24} color={semanticColors.brand.primary} />
				</View>

				<Text style={styles.description} textColor="secondary">
					{t('features.match.ui.matching_reason_placeholder.description')}
				</Text>

				<View style={styles.exampleContainer}>
					<Text style={styles.exampleReason} textColor="primary">
						"{t('features.match.ui.matching_reason_placeholder.example_reason')}"
					</Text>
				</View>

				<View style={styles.hintContainer}>
					<Feather name="info" size={14} color={semanticColors.text.tertiary} />
					<Text style={styles.hintText} textColor="muted">
						{t('features.match.ui.matching_reason_placeholder.hint')}
					</Text>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	container: {
		backgroundColor: semanticColors.surface.surface,
		borderRadius: 16,
		padding: 24,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: semanticColors.border.default,
		borderStyle: 'dashed',
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: `${semanticColors.brand.primary}15`,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 16,
	},
	description: {
		fontSize: 15,
		lineHeight: 22,
		textAlign: 'center',
		marginBottom: 20,
	},
	exampleContainer: {
		backgroundColor: semanticColors.surface.background,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		marginBottom: 16,
		width: '100%',
	},
	exampleReason: {
		fontSize: 14,
		fontStyle: 'italic',
		textAlign: 'center',
		lineHeight: 20,
	},
	hintContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	hintText: {
		fontSize: 12,
	},
});
