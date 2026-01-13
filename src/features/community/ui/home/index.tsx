import { CardNewsHome } from '@/src/features/card-news';
import { useCategory } from '@/src/features/community/hooks';
import { NOTICE_CODE } from '@/src/features/community/queries/use-home';
/**
 * 커뮤니티 홈 화면
 * 카드뉴스 중심의 "새로운 소식" 화면으로 개편
 */
import React, { useCallback } from 'react';

export default function CommuHome() {
	const { changeCategory } = useCategory();

	const handleNavigateToNotice = useCallback(() => {
		changeCategory(NOTICE_CODE);
	}, [changeCategory]);

	return <CardNewsHome onNavigateToNotice={handleNavigateToNotice} />;
}
