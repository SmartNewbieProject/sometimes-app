const PRIMARY_PRODUCT_IDS = [
	'gem_sale_16',
	'gem_1',
	'gem_5',
	'gem_25',
	'gem_50',
	'gem_100',
] as const;

const FALLBACK_PRODUCT_IDS = [
	'gem_sale_16',
	'gem_1',
	'gem_5',
	'gem_25',
	'gem_50',
	'gem_100',
] as const;

export type AppleProductId =
	| (typeof PRIMARY_PRODUCT_IDS)[number]
	| (typeof FALLBACK_PRODUCT_IDS)[number];

export const getAppleProductIds = () => ({
	primary: [...PRIMARY_PRODUCT_IDS],
	fallback: [...FALLBACK_PRODUCT_IDS],
	expectedCount: PRIMARY_PRODUCT_IDS.length,
});
