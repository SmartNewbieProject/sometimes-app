import MyInfo from '@/src/features/my-info';
import { PreferenceField } from '@/src/features/profile-edit/ui/shared/preference-field';
import { usePreferenceTooltips } from '@/src/shared/hooks/use-preference-tooltips';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { hooks, queries } = MyInfo;
const { useMyInfoForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

const DEFAULT_PREF = { typeCode: '', typeName: '', options: [] };

function ProfileDrinking() {
	const { drinking, updateForm } = useMyInfoForm();
	const { t } = useTranslation();
	const { data: preferencesArray = [DEFAULT_PREF], isLoading } = usePreferenceOptionsQuery();
	const preferences = preferencesArray?.find((item) => item.typeCode === Keys.DRINKING) ?? preferencesArray[0];
	const tooltips = usePreferenceTooltips('apps.my-info.drinking', preferences.options.length);

	return (
		<PreferenceField
			variant="profile"
			title={t('features.profile-edit.ui.profile.drinking.title')}
			preferences={preferences}
			value={drinking}
			onChange={(opt) => updateForm('drinking', opt)}
			isLoading={isLoading}
			loadingTitle={t('features.profile-edit.ui.profile.drinking.loading')}
			tooltips={tooltips}
		/>
	);
}

export default ProfileDrinking;
