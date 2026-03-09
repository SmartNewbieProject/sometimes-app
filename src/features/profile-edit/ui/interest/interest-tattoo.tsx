import Interest from '@/src/features/interest';
import type { PreferenceOption, Preferences } from '@/src/features/interest/api';
import colors from '@/src/shared/constants/colors';
import { usePreferenceTooltips } from '@/src/shared/hooks/use-preference-tooltips';
import { PreferenceSlider } from '@/src/shared/ui';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

const { hooks, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

function InterestTattoo() {
	const { updateForm, tattoo } = useInterestForm();
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
		preferencesArray?.find((item) => item.typeCode === Keys.TATTOO) ?? preferencesArray[0];

	const tooltips = usePreferenceTooltips('apps.interest.tattoo', preferences.options.length);

	const mapOption = useMemo(() => {
		return (option: PreferenceOption) => ({
			label:
				option.displayName === t('features.profile-edit.ui.interest.tattoo.no_tattoo')
					? t('features.profile-edit.ui.interest.tattoo.small_tattoo')
					: option.displayName,
			value: option.id,
		});
	}, [t]);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{t('features.profile-edit.ui.interest.tattoo.title')}</Text>
			<PreferenceSlider
				preferences={preferences}
				value={tattoo}
				onChange={(option) => updateForm('tattoo', option)}
				isLoading={optionsLoading}
				loadingTitle={t('features.profile-edit.ui.interest.tattoo.loading')}
				showMiddle={true}
				middleLabelLeft={-10}
				mapOption={mapOption}
				showTooltip={true}
				tooltips={tooltips}
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

export default InterestTattoo;
