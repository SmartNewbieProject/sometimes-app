import type { Product, Purchase as ProductPurchase } from 'expo-iap';
import type { TFunction } from 'i18next';
import type { GemDetails } from '@/src/features/payment/api';

/**
 * App Store Connect에 등록된 상품들의 고유 ID Enum.
 * 이 값들은 Apple과 통신하는 데 사용됩니다.
 */
export enum ProductID {
	GEM_8 = 'gem_8',
	GEM_15 = 'gem_15',
	GEM_30 = 'gem_30',
	GEM_60 = 'gem_60',
	GEM_130 = 'gem_130',
	GEM_200 = 'gem_200',
	GEM_400 = 'gem_400',
	GEM_500 = 'gem_500',
	GEM_800 = 'gem_800',
	GEM_SALE_6 = 'gem_sale_6',
	GEM_SALE_20 = 'gem_sale_20',
	GEM_SALE_40 = 'gem_sale_40',
	PEARL = 'pearl',
}

/**
 * 백엔드 DB에 저장된 상품(팩) 이름 타입.
 */
export type DbPackName =
	| '라이트팩'
	| '스타터팩'
	| '베이직팩'
	| '스탠다드팩'
	| '플러스팩'
	| '프리미엄팩'
	| '메가팩'
	| '울트라팩'
	| '맥시멈팩';

/**
 * DB의 팩 이름을 ProductID Enum으로 변환하기 위한 매핑 객체.
 * 이 객체가 변환의 핵심 로직을 담당합니다.
 */
const packNameToProductIdMap: Record<DbPackName, ProductID> = {
	라이트팩: ProductID.GEM_8,
	스타터팩: ProductID.GEM_15,
	베이직팩: ProductID.GEM_30,
	스탠다드팩: ProductID.GEM_60,
	플러스팩: ProductID.GEM_130,
	프리미엄팩: ProductID.GEM_200,
	메가팩: ProductID.GEM_400,
	울트라팩: ProductID.GEM_500,
	맥시멈팩: ProductID.GEM_800,
};

export const containsSale = (text: string, t: TFunction): boolean => {
	return text.includes(t('widgets.gem-store.common.세일'));
};

const getAppleToServerMapping = (): Record<string, string> => ({
	// 현재 사용 중인 상품
	gem_16: '스타터 팩',
	gem_26: '라이트 팩',
	gem_55: '베이직 팩',
	gem_85: '스탠다드 팩',
	gem_165: '프리미엄 팩',
	gem_300: '메가 팩',

	// 세일 상품
	gem_sale_16: '스타터 팩',

	// 레거시 호환성 (이전 상품들)
	gem_12: '라이트 팩',
	gem_27: '스타터 팩',
	gem_39: '베이직 팩',
	gem_54: '스탠다드 팩',
	gem_67: '플러스 팩',
	gem_15: '스타터 팩',
	gem_30: '베이직 팩',
	gem_60: '스탠다드 팩',
	gem_130: '플러스 팩',
	gem_sale_7: '라이트 팩',
	gem_sale_27: '베이직 팩',
});

// Apple Product ID를 서버 GemDetails와 매핑하기 위한 함수
export const mapAppleProductToServerGem = (
	appleProductId: string,
	serverGemProducts: GemDetails[],
): GemDetails | null => {
	const appleToServerMapping = getAppleToServerMapping();
	const serverProductName = appleToServerMapping[appleProductId];
	if (!serverProductName) return null;

	return serverGemProducts.find((gem) => gem.productName === serverProductName) || null;
};

// 서버 데이터를 기반으로 가격과 할인율 반환
export const getPriceAndDiscountFromServer = (
	appleProductId: string,
	serverGemProducts: GemDetails[],
): { price: number; discountRate: number } | null => {
	const serverGem = mapAppleProductToServerGem(appleProductId, serverGemProducts);
	if (!serverGem) return null;

	return {
		price: serverGem.price,
		discountRate: serverGem.discountRate,
	};
};

// 하드코딩된 함수는 레거시 호환성을 위해 유지하지만, 서버 데이터 우선 사용
export const getPriceAndDiscount = (
	text: string,
	serverGemProducts?: GemDetails[],
): { price: number; discountRate: number } | null => {
	// 서버 데이터가 있으면 서버 데이터 우선 사용
	if (serverGemProducts) {
		return getPriceAndDiscountFromServer(text, serverGemProducts);
	}

	// 레거시 하드코딩 데이터 (fallback)
	const mapping: Record<string, { price: number; discountRate: number }> = {
		gem_15: { price: 11000, discountRate: 21 },
		gem_30: { price: 22000, discountRate: 37 },
		gem_60: { price: 44000, discountRate: 51 },
		gem_130: { price: 95000, discountRate: 60 },
		gem_200: { price: 147000, discountRate: 61 },
		gem_400: { price: 295000, discountRate: 64 },
		gem_500: { price: 368000, discountRate: 66 },
		gem_800: { price: 590000, discountRate: 67 },

		gem_sale_7: { price: 5250, discountRate: 37.2 },
		gem_sale_16: { price: 12000, discountRate: 84.2 },
		gem_sale_27: { price: 20250, discountRate: 31.9 },
		gem_sale_6: { price: 6000, discountRate: 50.9 },
		gem_sale_20: { price: 14700, discountRate: 53.2 },
		gem_sale_40: { price: 29400, discountRate: 56.2 },
	};

	for (const key in mapping) {
		if (text === key) {
			return mapping[key];
		}
	}

	return null;
};

export function splitAndSortProducts(
	products: Product[],
	t: TFunction,
): {
	sale: Product[];
	normal: Product[];
} {
	const extractNumberFromId = (str: string) => {
		const match = str.match(/\d+/);
		return match ? Number.parseInt(match[0], 10) : Number.POSITIVE_INFINITY;
	};

	const saleKeyword = t('widgets.gem-store.common.세일');

	const sale = products
		.filter((p) => p.title.includes(saleKeyword))
		.sort((a, b) => extractNumberFromId(a.id) - extractNumberFromId(b.id));

	const normal = products
		.filter((p) => !p.title.includes(saleKeyword))
		.sort((a, b) => extractNumberFromId(a.id) - extractNumberFromId(b.id));

	return { sale, normal };
}

export function extractNumber(str: string): number | null {
	const match = str.match(/\d+/);
	return match ? Number.parseInt(match[0], 10) : null;
}

export type ExtendedProductPurchase = ProductPurchase & {
	originalTransactionIdentifierIOS?: string;
	currencyCodeIOS?: string;
	transactionReceipt?: string;
	isUpgradedIOS?: boolean;
	transactionReasonIOS?: string;
	priceIOS?: number;
	ownershipTypeIOS?: string;
	jwsRepresentationIOS?: string;
	purchaseToken?: string;
	countryCodeIOS?: string;
	subscriptionGroupIdIOS?: string | null;
	revocationDateIOS?: string | null;
	appAccountToken?: string | null;
	expirationDateIOS?: string | null;
	appBundleIdIOS?: string;
	webOrderLineItemIdIOS?: string | null;
	revocationReasonIOS?: string | null;
	productTypeIOS?: string;
	storefrontCountryCodeIOS?: string;
	environmentIOS?: string;
	currencySymbolIOS?: string;
	reasonIOS?: string;
	quantityIOS?: number;
	currencyIOS?: string;
};
