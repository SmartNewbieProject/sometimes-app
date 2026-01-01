import { EventType } from "@/src/features/event/types";
import type { GemMetadata } from "../types";

export const FIRST_SALE_PRODUCTS = {
  SALE_16: {
    id: 'sale-16',
    sortOrder: 0,
    price: 12000,
    discountRate: 43.5,
    totalGems: 16,
    bonusGems: 0,
    gemAmount: 0,
    productName: '최초 세일 16개',
    eventType: EventType.FIRST_SALE_16,
  },
} as const;

export type FirstSaleProduct = typeof FIRST_SALE_PRODUCTS[keyof typeof FIRST_SALE_PRODUCTS];