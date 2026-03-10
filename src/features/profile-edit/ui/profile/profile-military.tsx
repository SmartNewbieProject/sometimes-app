import MyInfo from '@/src/features/my-info';
import { PreferenceField } from '@/src/features/profile-edit/ui/shared/preference-field';
import { usePreferenceTooltips } from '@/src/shared/hooks/use-preference-tooltips';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { hooks, queries } = MyInfo;
const { useMyInfoForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

const DEFAULT_PREF = { typeCode: '', typeName: '', options: [] };

function ProfileMilitary() {
	const { updateForm, militaryStatus } = useMyInfoForm();
	const { t } = useTranslation();
	const { data: preferencesArray = [DEFAULT_PREF], isLoading } = usePreferenceOptionsQuery();
	const preferences =
		preferencesArray?.find(
			(item) =>
				item.typeCode === PreferenceKeys.MILITARY_STATUS ||
				item.typeCode === 'MILITARY_STATUS_MALE' ||
				item.typeCode === 'MILITARY_STATUS_FEMALE',
		) ?? preferencesArray[0];
	const tooltips = usePreferenceTooltips('apps.interest.military', preferences.options.length);

	return (
		<PreferenceField
			variant="profile"
			title={t('features.profile-edit.ui.profile.military.title')}
			preferences={preferences}
			value={militaryStatus}
			onChange={(opt) => updateForm('militaryStatus', opt)}
			isLoading={isLoading}
			loadingTitle={t('features.profile-edit.ui.profile.military.loading')}
			tooltips={tooltips}
		/>
	);
}

export default ProfileMilitary;
