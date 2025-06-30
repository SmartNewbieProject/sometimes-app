import { type PreferenceSaveBody, savePreferencesApi } from '../apis';
import { useInterestForm } from '../hooks';
import { PreferenceKeys } from '../queries';

export enum InterestSteps {
	AGE = 1,
	DRIKNING = 2,
	INTEREST = 3,
	DATING_STYLE = 4,
	MILITARY = 5,
	SMOKING = 6,
	TATTOO = 7,
}

export const phaseCount = Object.keys(InterestSteps).length / 2;

export type Properties = {
	age: string;
	drinking: string;
	interestIds: string[];
	datingStyleIds: string[];
	militaryPreference?: string;
	militaryStatus?: string;
	smoking: string;
	tattoo: string;
};

export const savePreferences = async (props: Properties) => {
	const body: PreferenceSaveBody = {
		data: [
			{
				typeName: PreferenceKeys.AGE,
				optionIds: [props.age],
			},
			{
				typeName: PreferenceKeys.DRINKING,
				optionIds: [props.drinking],
			},
			{
				typeName: PreferenceKeys.INTEREST,
				optionIds: props.interestIds,
			},
			{
				typeName: PreferenceKeys.SMOKING,
				optionIds: [props.smoking],
			},
			{
				typeName: PreferenceKeys.TATTOO,
				optionIds: [props.tattoo],
			},
			{
				typeName: PreferenceKeys.DATING_STYLE,
				optionIds: props.datingStyleIds,
			},
		],
	};

	if (props.militaryPreference) {
		body.data.push({
			typeName: PreferenceKeys.MILITARY_PREFERENCE,
			optionIds: [props.militaryPreference],
		});
	}

	if (props.militaryStatus) {
		body.data.push({
			typeName: PreferenceKeys.MILITARY_STATUS,
			optionIds: [props.militaryStatus],
		});
	}

	await savePreferencesApi(body);
	useInterestForm.getState().clear();
};
