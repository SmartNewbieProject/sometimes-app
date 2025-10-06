import type { Chat } from '../types/chat';

interface PaginatedChatData {
	pages: { messages: Chat[] }[];
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	pageParams: any[];
}

export const addMessageToChatList = (
	oldData: PaginatedChatData | undefined,
	newMessage: Chat,
): PaginatedChatData => {
	if (!oldData) {
		return {
			pages: [{ messages: [newMessage] }],
			pageParams: [undefined],
		};
	}
	const date = new Date(newMessage.createdAt);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');

	const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

	const newData = {
		pages: oldData.pages.map((page, index) =>
			index === 0
				? { ...page, messages: [{ ...newMessage, createdAt: formattedDate }, ...page.messages] }
				: page,
		),
		pageParams: [...oldData.pageParams],
	};
	return newData;
};
