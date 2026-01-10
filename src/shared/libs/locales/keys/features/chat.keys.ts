/**
 * Chat Feature i18n Keys
 * 채팅 기능 관련 번역 키 상수
 */
export const CHAT_KEYS = {
	// hooks.use_chat_lock.unlock_modal
	hooksUseChatLockUnlockModalTitleLine1:
		'features.chat.hooks.use_chat_lock.unlock_modal.title_line1',
	hooksUseChatLockUnlockModalTitleLine2:
		'features.chat.hooks.use_chat_lock.unlock_modal.title_line2',
	hooksUseChatLockUnlockModalContentGems:
		'features.chat.hooks.use_chat_lock.unlock_modal.content_gems',
	hooksUseChatLockUnlockModalContentFree:
		'features.chat.hooks.use_chat_lock.unlock_modal.content_free',
	hooksUseChatLockUnlockModalContentCta:
		'features.chat.hooks.use_chat_lock.unlock_modal.content_cta',

	// hooks.use_chat_lock.remove_modal
	hooksUseChatLockRemoveModalTitleLine1:
		'features.chat.hooks.use_chat_lock.remove_modal.title_line1',
	hooksUseChatLockRemoveModalTitleLine2:
		'features.chat.hooks.use_chat_lock.remove_modal.title_line2',
	hooksUseChatLockRemoveModalContentWarning:
		'features.chat.hooks.use_chat_lock.remove_modal.content_warning',
	hooksUseChatLockRemoveModalContentConfirm:
		'features.chat.hooks.use_chat_lock.remove_modal.content_confirm',

	// hooks (legacy keys)
	hooksYesTry: 'features.chat.hooks.네_해볼래요',
	hooksNo: 'features.chat.hooks.아니요',
	hooksCancel: 'features.chat.hooks.취소',
	hooksDelete: 'features.chat.hooks.삭제',
} as const;

export type ChatKey = (typeof CHAT_KEYS)[keyof typeof CHAT_KEYS];
