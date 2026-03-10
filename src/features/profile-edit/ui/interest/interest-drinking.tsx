import Interest from '@/src/features/interest';
import { PreferenceField } from '@/src/features/profile-edit/ui/shared/preference-field';
import { usePreferenceTooltips } from '@/src/shared/hooks/use-preference-tooltips';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { hooks, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

const DEFAULT_PREF = { typeCode: '', typeName: '', options: [] };

function InterestDrinking() {
	const { drinking, updateForm } = useInterestForm();
	const { t } = useTranslation();
	const { data: preferencesArray = [DEFAULT_PREF], isLoading } = usePreferenceOptionsQuery();
	const preferences = preferencesArray?.find((item) => item.typeCode === Keys.DRINKING) ?? preferencesArray[0];
	const tooltips = usePreferenceTooltips('apps.interest.drink', preferences.options.length);

	return (
		<PreferenceField
			variant="interest"
			title={t('features.profile-edit.ui.interest.drinking.title')}
			preferences={preferences}
			value={drinking}
			onChange={(opt) => updateForm('drinking', opt)}
			isLoading={isLoading}
			loadingTitle={t('features.profile-edit.ui.interest.drinking.loading')}
			tooltips={tooltips}
		/>
	);
}

export default InterestDrinking;
