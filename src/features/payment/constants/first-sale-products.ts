import { EventType } from '@/src/features/event/types';
import type { GemMetadata } from '../types';

export const FIRST_SALE_PRODUCTS = {
	SALE_10: {
		id: 'sale-10',
		sortOrder: 0,
		price: 10000,
		discountRate: 50,
		totalGems: 10,
		bonusGems: 0,
		gemAmount: 0,
		productName: '최초 세일 10개',
		eventType: EventType.FIRST_SALE_10,
	},
} as const;

export type FirstSaleProduct = (typeof FIRST_SALE_PRODUCTS)[keyof typeof FIRST_SALE_PRODUCTS];
