import Interest from '@/src/features/interest';
import type { PreferenceOption, Preferences } from '@/src/features/interest/api';
import colors from '@/src/shared/constants/colors';
import { PreferenceSlider } from '@/src/shared/ui';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

// key 기준 슬라이더 순서: 문신X → 작은문신 → 상관없음/문신없음 → 문신O
const SORT_ORDER: Record<string, number> = {
	NONE: 0,
	NONE_STRICT: 0,
	SMALL: 1,
	NO_PREFERENCE: 2,
	OKAY: 3,
};

// key → tooltip 번역키 prefix (key 기반 매핑)
const TOOLTIP_PREFIX: Record<string, string> = {
	NONE: 'apps.interest.tattoo.tooltip_none',
	NONE_STRICT: 'apps.interest.tattoo.tooltip_none',
	SMALL: 'apps.interest.tattoo.tooltip_small',
	NO_PREFERENCE: 'apps.interest.tattoo.tooltip_no_preference',
	OKAY: 'apps.interest.tattoo.tooltip_okay',
};

const { hooks, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

function InterestTattoo() {
	const { updateForm, tattoo } = useInterestForm();
	const { t } = useTranslation();

	const {
		data: preferencesArray = [{ typeCode: '', typeName: '', options: [] }],
		isLoading: optionsLoading,
	} = usePreferenceOptionsQuery();

	const rawPreferences: Preferences =
		preferencesArray?.find((item) => item.typeCode === Keys.TATTOO) ?? preferencesArray[0];

	// key 기준 정렬
	const sortedOptions = [...rawPreferences.options].sort(
		(a, b) => (SORT_ORDER[a.key ?? ''] ?? 99) - (SORT_ORDER[b.key ?? ''] ?? 99)
	);

	const preferences = { ...rawPreferences, options: sortedOptions };

	// key 기반 tooltip: title은 displayName, description은 번역키
	const tooltips = sortedOptions.map((opt) => {
		const prefix = TOOLTIP_PREFIX[opt.key ?? ''];
		if (!prefix) return { title: opt.displayName, description: [] };
		const descriptions: string[] = [];
		for (let i = 1; i <= 5; i++) {
			const desc = t(`${prefix}_desc_${i}`, { defaultValue: '' });
			if (!desc) break;
			descriptions.push(desc);
		}
		return { title: opt.displayName, description: descriptions };
	});

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
				showAllLabels={true}
				middleLabelLeft={-10}
				mapOption={mapOption}
				showTooltip={true}
				tooltips={tooltips}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
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
