import { EventType } from "@/src/features/event/types";
import type { GemMetadata } from "../types";

export const FIRST_SALE_PRODUCTS = {
  SALE_7: {
    id: 'sale-7',
    sortOrder: 0,
    price: 5250,
    discountRate: 37.2,
    totalGems: 7,
    bonusGems: 0,
    gemAmount: 0,
    productName: '최초 세일 7개',
    eventType: EventType.FIRST_SALE_7,
  },
  SALE_16: {
    id: 'sale-16',
    sortOrder: 1,
    price: 12000,
    discountRate: 43.5,
    totalGems: 16,
    bonusGems: 0,
    gemAmount: 0,
    productName: '최초 세일 16개',
    eventType: EventType.FIRST_SALE_16,
  },
  SALE_27: {
    id: 'sale-27',
    sortOrder: 2,
    price: 20250,
    discountRate: 31.9,
    totalGems: 27,
    bonusGems: 0,
    gemAmount: 0,
    productName: '최초 세일 27개',
    eventType: EventType.FIRST_SALE_27,
  },
} as const;

export type FirstSaleProduct = typeof FIRST_SALE_PRODUCTS[keyof typeof FIRST_SALE_PRODUCTS];