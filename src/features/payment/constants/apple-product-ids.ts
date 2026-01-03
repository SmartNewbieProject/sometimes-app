const PRIMARY_PRODUCT_IDS = [
	'gem_sale_16',
	'gem_16',
	'gem_26',
	'gem_55',
	'gem_85',
	'gem_165',
	'gem_300',
] as const;

const FALLBACK_PRODUCT_IDS = [
	'gem_sale_16',
	'gem_12',
	'gem_27',
	'gem_39',
	'gem_54',
	'gem_67',
] as const;

export type AppleProductId =
	| (typeof PRIMARY_PRODUCT_IDS)[number]
	| (typeof FALLBACK_PRODUCT_IDS)[number];

export const getAppleProductIds = () => ({
	primary: [...PRIMARY_PRODUCT_IDS],
	fallback: [...FALLBACK_PRODUCT_IDS],
	expectedCount: PRIMARY_PRODUCT_IDS.length,
});
