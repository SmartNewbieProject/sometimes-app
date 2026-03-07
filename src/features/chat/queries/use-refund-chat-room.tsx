import { useToast } from '@/src/shared/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { refundChatRoom } from '../apis';
import { removeChatRoomFromCache, updateGemCache } from '../utils/chat-cache';

function useRefundChatRoom() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { emitToast } = useToast();

	return useMutation({
		mutationFn: refundChatRoom,
		onSuccess: (data, variables) => {
			emitToast(`구슬 ${data.refundedGems}개가 환불되었어요`);
			updateGemCache(queryClient, (oldGem) => ({
				...oldGem,
				totalGem: data.totalGems,
			}));
			removeChatRoomFromCache(queryClient, variables.chatRoomId);
			router.navigate('/chat');
		},
		// biome-ignore lint/suspicious/noExplicitAny: error type from axios
		onError: (error: any) => {
			const status = error?.status ?? error?.statusCode;
			if (status === 409) {
				emitToast('이미 환불된 채팅방이에요');
			} else if (status === 400) {
				emitToast('환불 조건을 충족하지 않아요');
			} else {
				emitToast('환불 처리 중 오류가 발생했어요');
			}
		},
	});
}

export default useRefundChatRoom;
