import type { PreferenceTypeGroup } from '@/src/types/user';
import i18n from "@/src/shared/libs/i18n";

/**
 * 특정 선호도 타입에서 첫 번째 옵션의 표시 이름을 반환합니다.
 * @param key 선호도 타입 이름
 * @param preferGroup 선호도 그룹 배열
 * @returns 첫 번째 옵션의 표시 이름 또는 null
 */
const getSingleOption = (key: string, preferGroup: PreferenceTypeGroup[]): string | null => {
	const prefer = preferGroup.find((prefer) => prefer.typeName === key);
	if (!prefer) return null;
	if (prefer.selectedOptions.length === 0) return null;
	return prefer.selectedOptions[0].displayName;
};

/**
 * 특정 선호도 타입에서 모든 옵션을 가져와 label과 value 형태의 객체 배열로 반환합니다.
 * @param typeName 선호도 타입 이름
 * @param preferences 선호도 그룹 배열
 * @returns label과 value 형태의 객체 배열
 */
const getCharacteristicsOptions = <T extends string = string>(
	typeName: string,
	preferences: PreferenceTypeGroup[],
): Array<{ label: string; value: T }> => {
	const preferenceGroup = preferences.find((p) => p.typeName === typeName);
	if (!preferenceGroup || preferenceGroup.selectedOptions.length === 0) {
		return [];
	}

	return preferenceGroup.selectedOptions.map((option) => ({
		label: option.displayName,
		value: option.id as T,
	}));
};

/**
 * 여러 선호도 타입에서 모든 옵션을 가져와 타입별로 그룹화하여 반환합니다.
 * @param typeNames 선호도 타입 이름 배열
 * @param preferences 선호도 그룹 배열
 * @returns 타입별로 그룹화된 옵션 객체
 */
const getMultipleCharacteristicsOptions = <T extends string = string>(
	typeNames: string[],
	preferences: PreferenceTypeGroup[],
): Record<string, Array<{ label: string; value: T }>> => {
	const result: Record<string, Array<{ label: string; value: T }>> = {};

	// biome-ignore lint/complexity/noForEach: <explanation>
	typeNames.forEach((typeName) => {
		result[typeName] = getCharacteristicsOptions<T>(typeName, preferences);
	});

	return result;
};

export const parser = {
	gender: (gender: string) => {
		return gender === 'FEMALE' ? i18n.t('shareds.hooks.parser.gender.female') : i18n.t('shareds.hooks.parser.gender.male');
	},
	getSingleOption,
	getCharacteristicsOptions,
	getMultipleCharacteristicsOptions,
};
