import Interest from '@/src/features/interest';
import {
	TATTOO_SORT_ORDER,
	INTEREST_TATTOO_TOOLTIP_PREFIX,
} from '@/src/features/profile-edit/constants/tattoo';
import { PreferenceField } from '@/src/features/profile-edit/ui/shared/preference-field';
import { buildKeyBasedTooltips } from '@/src/shared/hooks/use-preference-tooltips';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { hooks, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

const DEFAULT_PREF = { typeCode: '', typeName: '', options: [] };

function InterestTattoo() {
	const { updateForm, tattoo } = useInterestForm();
	const { t } = useTranslation();
	const { data: preferencesArray = [DEFAULT_PREF], isLoading } = usePreferenceOptionsQuery();

	const rawPreferences =
		preferencesArray?.find((item) => item.typeCode === Keys.TATTOO) ?? preferencesArray[0];

	const sortedOptions = [...rawPreferences.options].sort(
		(a, b) => (TATTOO_SORT_ORDER[a.key ?? ''] ?? 99) - (TATTOO_SORT_ORDER[b.key ?? ''] ?? 99),
	);

	const preferences = { ...rawPreferences, options: sortedOptions };
	const tooltips = buildKeyBasedTooltips(sortedOptions, INTEREST_TATTOO_TOOLTIP_PREFIX, t);

	return (
		<PreferenceField
			variant="interest"
			title={t('features.profile-edit.ui.interest.tattoo.title')}
			preferences={preferences}
			value={tattoo}
			onChange={(opt) => updateForm('tattoo', opt)}
			isLoading={isLoading}
			loadingTitle={t('features.profile-edit.ui.interest.tattoo.loading')}
			tooltips={tooltips}
		/>
	);
}

export default InterestTattoo;
