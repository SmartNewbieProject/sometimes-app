import { useModal } from '@/src/shared/hooks/use-modal';
import { Text } from '@/src/shared/ui';
import { useQuery } from '@tanstack/react-query';
import { HttpStatusCode } from 'axios';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { matchHistoryApis } from '../apis';

export const useMatchPartnerQuery = (matchId?: string) => {
	const queryResults = useQuery({
		enabled: !!matchId,
		queryKey: ['match-partner', matchId],
		queryFn: () => matchHistoryApis.getPartnerByMatchId(matchId!),
	});
	const { showModal } = useModal();

	const onClickConfirm = () => {
		// TODO: 열람권 처리하기
		router.back();
	};

	useEffect(() => {
		if (!queryResults.error) return;
		const { error, status } = queryResults.error as unknown as { error: string; status: number };
		if (status === HttpStatusCode.BadRequest) {
			showModal({
				title: '조회 기간이 끝났어요',
				children: (
					<View className="flex flex-col">
						<Text textColor="black" size="sm">
							연인의 조회 기간이 끝났어요
						</Text>
						<Text textColor="black" size="sm">
							다시 조회하고 싶다면 연인 재매칭권을 사용해주세요
						</Text>
					</View>
				),
				primaryButton: {
					text: '네 확인했어요',
					onClick: onClickConfirm,
				},
			});
			return;
		}
	}, [queryResults.error]);

	return queryResults;
};
