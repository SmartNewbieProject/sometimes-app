// key 기준 정렬: 문신X → 작은문신 → 상관없음 → 문신O
export const TATTOO_SORT_ORDER: Record<string, number> = {
	NONE: 0,
	NONE_STRICT: 0,
	SMALL: 1,
	NO_PREFERENCE: 2,
	OKAY: 3,
};

export const INTEREST_TATTOO_TOOLTIP_PREFIX: Record<string, string> = {
	NONE: 'apps.interest.tattoo.tooltip_none',
	NONE_STRICT: 'apps.interest.tattoo.tooltip_none',
	SMALL: 'apps.interest.tattoo.tooltip_small',
	NO_PREFERENCE: 'apps.interest.tattoo.tooltip_no_preference',
	OKAY: 'apps.interest.tattoo.tooltip_okay',
};

export const PROFILE_TATTOO_TOOLTIP_PREFIX: Record<string, string> = {
	NONE: 'apps.my-info.tattoo.tooltip_0',
	NONE_STRICT: 'apps.my-info.tattoo.tooltip_0',
	SMALL: 'apps.my-info.tattoo.tooltip_1',
	OKAY: 'apps.my-info.tattoo.tooltip_2',
};
