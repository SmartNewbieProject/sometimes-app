export const calculateDiscount = (totalPrice: number, discount?: number) => {
	if (!discount) return totalPrice;
	const discountedPrice = Math.floor((totalPrice * (100 - discount)) / 100);
	return roundToHundred(discountedPrice);
};

const roundToHundred = (value: number): number => {
	return Math.ceil(value / 100) * 100;
};

export const toKRW = (value: number): string => value.toLocaleString('ko-KR');
