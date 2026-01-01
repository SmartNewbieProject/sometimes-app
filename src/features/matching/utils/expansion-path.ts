import i18n from "@/src/shared/libs/i18n";

/**
 * 지역별 확장 경로 (i18n 지원)
 * 번역 키: features.matching.expansion_paths.{region}
 */
export const getExpansionPath = (region: string): string => {
	const key = `features.matching.expansion_paths.${region}`;
	const translated = i18n.t(key);

	// 번역 키가 그대로 반환되면 기본값 사용
	if (translated === key) {
		return i18n.t('features.matching.expansion_paths.default');
	}

	return translated;
};
