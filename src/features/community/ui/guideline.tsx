import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@shared/ui';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

export const CommunityGuideline = () => {
	const { t } = useTranslation();
	return (
		<View style={styles.container}>
			<Text style={styles.title}>{t('features.community.ui.guideline.title')}</Text>
			<Text style={styles.text}>{t('features.community.ui.guideline.welcome_message')}</Text>
			<Text style={styles.textLargeGap}>
				{t('features.community.ui.guideline.guideline_purpose')}
			</Text>
			<Text style={styles.text}>{t('features.community.ui.guideline.basic_rules_title')}</Text>
			<Text style={styles.text}>{t('features.community.ui.guideline.rule_1')}</Text>
			<Text style={styles.text}>{t('features.community.ui.guideline.rule_2')}</Text>
			<Text style={styles.text}>{t('features.community.ui.guideline.rule_3')}</Text>
			<Text style={styles.text}>{t('features.community.ui.guideline.rule_4')}</Text>
			<Text style={styles.textLargeGap}>
				{t('features.community.ui.guideline.writing_tips_title')}
			</Text>
			<Text style={styles.text}>{t('features.community.ui.guideline.tip_1')}</Text>
			<Text style={styles.text}>{t('features.community.ui.guideline.tip_2')}</Text>
			<Text style={styles.text}>{t('features.community.ui.guideline.tip_3')}</Text>
			<Text style={styles.textLargeGap}>{t('features.community.ui.guideline.tip_4')}</Text>
			<Text style={styles.text}>
				{t('features.community.ui.guideline.report_and_sanction_title')}
			</Text>
			<Text style={styles.textSmallGap}>
				{t('features.community.ui.guideline.sanction_message_1')}
			</Text>
			<Text style={styles.textSmallGap}>
				{t('features.community.ui.guideline.sanction_message_2')}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingLeft: 16,
		paddingRight: 10,
	},
	title: {
		fontSize: 14,
		color: semanticColors.text.muted,
		opacity: 0.6,
		lineHeight: 17.6,
		paddingBottom: 9,
	},
	text: {
		fontSize: 12,
		color: semanticColors.text.muted,
		opacity: 0.6,
		lineHeight: 17.6,
		paddingBottom: 9,
	},
	textLargeGap: {
		fontSize: 12,
		color: semanticColors.text.muted,
		opacity: 0.6,
		paddingBottom: 26,
	},
	textSmallGap: {
		fontSize: 12,
		color: semanticColors.text.muted,
		opacity: 0.6,
		paddingBottom: 8,
	},
});
