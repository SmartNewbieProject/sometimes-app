import Interest from '@/src/features/interest';
import type { Preferences } from '@/src/features/interest/api';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { PreferenceSelector } from '@/src/shared/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

const { hooks, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

function InterestAge() {
	const { age, updateForm } = useInterestForm();
	const { t } = useTranslation();
	const {
		data: preferencesArray = [
			{
				typeCode: '',
				typeName: '',
				options: [],
			},
		],
		isLoading,
	} = usePreferenceOptionsQuery();

	const preferences: Preferences =
		preferencesArray?.find((item) => item.typeCode === PreferenceKeys.AGE) ?? preferencesArray[0];

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{t('features.profile-edit.ui.interest.age.title')}</Text>
			<View style={styles.bar} />
			<View style={styles.chipSelector}>
				<PreferenceSelector
					preferences={preferences}
					value={age}
					multiple={false}
					onChange={(value) => updateForm('age', value)}
					isLoading={isLoading}
					loadingTitle={t('features.profile-edit.ui.interest.age.loading')}
					style={styles.chipSelectorFull}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 30,
		marginTop: 10,
		paddingHorizontal: 28,
	},
	title: {
		color: colors.black,
		fontSize: 18,
		fontWeight: 600,
		fontFamily: 'Pretendard-SemiBold',
		lineHeight: 22,
	},
	chipSelector: {
		marginTop: 16,

		flexDirection: 'row',
		justifyContent: 'flex-start',
	},
	bar: {
		marginTop: 6,
		marginBottom: 10,
		height: 0.5,
		backgroundColor: semanticColors.surface.other,
	},
	chipSelectorFull: {
		width: '100%',
	},
});

export default InterestAge;
