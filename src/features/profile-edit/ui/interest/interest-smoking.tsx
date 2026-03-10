import Interest from '@/src/features/interest';
import { PreferenceField } from '@/src/features/profile-edit/ui/shared/preference-field';
import { usePreferenceTooltips } from '@/src/shared/hooks/use-preference-tooltips';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { hooks, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

const DEFAULT_PREF = { typeCode: '', typeName: '', options: [] };

function InterestSmoking() {
	const { smoking, updateForm } = useInterestForm();
	const { t } = useTranslation();
	const { data: preferencesArray = [DEFAULT_PREF], isLoading } = usePreferenceOptionsQuery();
	const preferences = preferencesArray?.find((item) => item.typeCode === Keys.SMOKING) ?? preferencesArray[0];
	const tooltips = usePreferenceTooltips('apps.interest.smoke', preferences.options.length);

	return (
		<PreferenceField
			variant="interest"
			title={t('features.profile-edit.ui.interest.smoking.title')}
			preferences={preferences}
			value={smoking}
			onChange={(opt) => updateForm('smoking', opt)}
			isLoading={isLoading}
			loadingTitle={t('features.profile-edit.ui.interest.smoking.loading')}
			tooltips={tooltips}
		/>
	);
}

export default InterestSmoking;
