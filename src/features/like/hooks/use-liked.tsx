import { useCallback, useMemo } from 'react';
import useILikedQuery from '../queries/use-i-liked-query';
import useLikedMeQuery from '../queries/use-liked-me-query';

function useLiked() {
	const { data: iLiked, isLoading: isILoading } = useILikedQuery();
	const { data: likedMe, isLoading: isMeLoading } = useLikedMeQuery();

	const iLikedMap = useMemo(() => {
		if (!iLiked || !Array.isArray(iLiked)) return new Map();
		return new Map(iLiked.map((m) => [m.connectionId, m]));
	}, [iLiked]);

	const isLikedPartner = useCallback(
		(connectionId: string) => {
			if (isILoading) return false;
			return iLikedMap.has(connectionId);
		},
		[isILoading, iLikedMap],
	);

	const showCollapse = useCallback(() => {
		if (isILoading || isMeLoading) return false;
		if (likedMe && likedMe.length > 0) return { data: likedMe, type: 'likedMe' };
		return false;
	}, [isILoading, isMeLoading, likedMe]);

	const isStatus = useCallback(
		(connectionId: string) => {
			if (isILoading) return false;
			return iLikedMap.get(connectionId)?.status;
		},
		[isILoading, iLikedMap],
	);

	const isLiked = useCallback(
		(connectionId: string) => {
			if (isILoading) return false;
			return iLikedMap.get(connectionId);
		},
		[isILoading, iLikedMap],
	);

	const isExpired = useCallback(
		(connectionId: string) => {
			if (isILoading) return false;
			return !!iLikedMap.get(connectionId)?.isExpired;
		},
		[isILoading, iLikedMap],
	);

	return {
		isLikedPartner,
		showCollapse,
		isStatus,
		isLiked,
		isExpired,
	};
}

export default useLiked;
