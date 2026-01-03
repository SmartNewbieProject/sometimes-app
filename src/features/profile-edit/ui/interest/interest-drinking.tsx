import Interest from '@/src/features/interest';
import type { Preferences } from '@/src/features/interest/api';
import colors from '@/src/shared/constants/colors';
import { PreferenceSlider } from '@/src/shared/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

const { hooks, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

function InterestDrinking() {
	const { drinking, updateForm } = useInterestForm();
	const { t } = useTranslation();

	const {
		data: preferencesArray = [
			{
				typeCode: '',
				typeName: '',
				options: [],
			},
		],
		isLoading: optionsLoading,
	} = usePreferenceOptionsQuery();

	const preferences: Preferences =
		preferencesArray?.find((item) => item.typeCode === Keys.DRINKING) ?? preferencesArray[0];

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{t('features.profile-edit.ui.interest.drinking.title')}</Text>
			<PreferenceSlider
				preferences={preferences}
				value={drinking}
				onChange={(option) => updateForm('drinking', option)}
				isLoading={optionsLoading}
				loadingTitle={t('features.profile-edit.ui.interest.drinking.loading')}
				showMiddle={false}
				firstLabelLeft={0}
				lastLabelLeft={-70}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		width: '100%',
		alignItems: 'center',
		paddingTop: 32,
	},
	title: {
		color: colors.black,
		fontSize: 18,
		fontFamily: 'Pretendard-SemiBold',
		fontWeight: 600,
		lineHeight: 22,
	},
	container: {
		paddingHorizontal: 28,
		marginBottom: 24,
	},
});

export default InterestDrinking;
