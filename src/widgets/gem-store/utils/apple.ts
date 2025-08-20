import type { Product, ProductPurchase } from 'expo-iap';

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
	// 세일 상품들은 DB 이름과 직접 매핑되지 않으므로, 이 함수에서는 반환되지 않습니다.
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

/**
 * 백엔드 API로부터 받은 상품 이름(name)을 기반으로
 * 대응하는 ProductID enum 값을 찾아 반환하는 함수.
 *
 * @param dbProductName - 백엔드 DB의 상품 이름 (예: '라이트팩')
 * @returns 대응하는 ProductID enum 값. 만약 매핑되는 ID가 없으면 null을 반환합니다.
 */
export function getProductIdByName(dbProductName: string): ProductID | null {
	// packNameToProductIdMap에 dbProductName이 키로 존재하는지 확인
	if (dbProductName in packNameToProductIdMap) {
		// 존재한다면, 해당 키로 ProductID 값을 반환 (타입 단언 사용)
		return packNameToProductIdMap[dbProductName as DbPackName];
	}

	// 매핑되는 ID를 찾지 못한 경우 null 반환
	return null;
}

export const containsSale = (text: string): boolean => {
	return text.includes('세일');
};

export const getPriceAndDiscount = (
	text: string,
): { price: number; discountRate: number } | null => {
	const mapping: Record<string, { price: number; discountRate: number }> = {
		'6개': { price: 6000, discountRate: 84 },
		'15개': { price: 11000, discountRate: 21 },
		'20개': { price: 4800, discountRate: 68 },
		'30개': { price: 22000, discountRate: 37 },
		'40개': { price: 12900, discountRate: 57 },
		'60개': { price: 44000, discountRate: 51 },
		'130개': { price: 95000, discountRate: 60 },
		'200개': { price: 147000, discountRate: 61 },
		'400개': { price: 295000, discountRate: 64 },
		'500개': { price: 368000, discountRate: 66 },
		'800개': { price: 590000, discountRate: 67 },
	};

	// 문자열 안에 key가 포함되어 있으면 반환
	for (const key in mapping) {
		if (text.includes(key)) {
			return mapping[key];
		}
	}

	return null; // 일치하는 항목 없으면 null
};

export function splitAndSortProducts(products: Product[]): {
	sale: Product[];
	normal: Product[];
} {
	const extractNumber = (str: string) => {
		const match = str.match(/\d+/);
		return match ? Number.parseInt(match[0], 10) : Number.POSITIVE_INFINITY;
	};

	const sale = products
		.filter((p) => p.title.includes('세일'))
		.sort((a, b) => extractNumber(a.id) - extractNumber(b.id));

	const normal = products
		.filter((p) => !p.title.includes('세일'))
		.sort((a, b) => extractNumber(a.id) - extractNumber(b.id));

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
