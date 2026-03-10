import Interest from '@/src/features/interest';
import { PreferenceField } from '@/src/features/profile-edit/ui/shared/preference-field';
import { usePreferenceTooltips } from '@/src/shared/hooks/use-preference-tooltips';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { hooks, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

const DEFAULT_PREF = { typeCode: '', typeName: '', options: [] };

function InterestMilitary() {
	const { updateForm, militaryPreference } = useInterestForm();
	const { t } = useTranslation();
	const { data: preferencesArray = [DEFAULT_PREF], isLoading } = usePreferenceOptionsQuery();
	const preferences =
		preferencesArray?.find((item) => item.typeCode === PreferenceKeys.MILITARY_PREFERENCE) ?? preferencesArray[0];
	const tooltips = usePreferenceTooltips('apps.interest.military', preferences.options.length);

	return (
		<PreferenceField
			variant="interest"
			title={t('features.profile-edit.ui.interest.military.title')}
			preferences={preferences}
			value={militaryPreference}
			onChange={(opt) => updateForm('militaryPreference', opt)}
			isLoading={isLoading}
			loadingTitle={t('features.profile-edit.ui.interest.military.loading')}
			tooltips={tooltips}
		/>
	);
}

export default InterestMilitary;
