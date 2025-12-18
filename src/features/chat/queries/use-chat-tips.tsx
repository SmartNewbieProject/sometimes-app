import { useMutation } from '@tanstack/react-query';
import { getChatTips } from '../apis';

export function useChatTips() {
	return useMutation({
		mutationFn: (chatRoomId: string) => getChatTips(chatRoomId),
	});
}

export default useChatTips;
