export const formatToAmPm = (isoString: string) => {
	if (!isoString) return '';

	const date = new Date(isoString);

	// 'ko-KR' 로케일과 옵션을 사용하여 시간 포맷팅
	return date.toLocaleString('ko-KR', {
		hour: 'numeric', // '시'를 숫자로 표시
		minute: '2-digit', // '분'을 두 자리 숫자로 표시
		hour12: true, // 12시간제(오전/오후) 사용
	});
};
