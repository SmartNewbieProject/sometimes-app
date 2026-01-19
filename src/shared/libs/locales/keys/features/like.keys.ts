/**
 * 좋아요 기능 관련 i18n 키 상수
 *
 * @description
 * 좋아요 전송, 좋아요 배너, 좋아요 목록 등에서 사용되는 번역 키
 */

export const LIKE_KEYS = {
	ui: {
		noneLikeBanner: {
			titleFemale: 'features.like.ui.none_like_banner.title_female',
			titleFemale1: 'features.like.ui.none_like_banner.title_female_1',
			titleMale: 'features.like.ui.none_like_banner.title_male',
			titleMaleProfile: 'features.like.ui.none_like_banner.title_male_profile',
			titleMale1: 'features.like.ui.none_like_banner.title_male_1',
			nothingLike: 'features.like.ui.none_like_banner.nothing_like',
			descriptionFemalePart1: 'features.like.ui.none_like_banner.description_female_part1',
			descriptionFemalePart2: 'features.like.ui.none_like_banner.description_female_part2',
			descriptionMalePart1: 'features.like.ui.none_like_banner.description_male_part1',
			descriptionMalePart2: 'features.like.ui.none_like_banner.description_male_part2',
			ctaLocked: 'features.like.ui.none_like_banner.cta_locked',
		},
		likeButton: {
			modal: {
				titleLine1: 'features.like.ui.like_button.modal.title_line1',
				titleLine2Male: 'features.like.ui.like_button.modal.title_line2_male',
				titleLine2Default: 'features.like.ui.like_button.modal.title_line2_default',
				bodyLine1: 'features.like.ui.like_button.modal.body_line1',
				bodyLine2: 'features.like.ui.like_button.modal.body_line2',
				primaryButton: 'features.like.ui.like_button.modal.primary_button',
			},
			buttonLabel: 'features.like.ui.like_button.button_label',
		},
		likeCollapse: {
			iLikedTitle: 'features.like.ui.like_collapse.i_liked_title',
			likedMeTitle: 'features.like.ui.like_collapse.liked_me_title',
		},
	},
	hooks: {
		useLike: {
			likeSent: 'features.like.hooks.use-like.like_sent',
			ifInterested: 'features.like.hooks.use-like.if_interested',
			canContact: 'features.like.hooks.use-like.can_contact',
			confirm: 'features.like.hooks.use-like.confirm',
			chargeMessage: 'features.like.hooks.use-like.charge_message',
			duplicateLike: 'features.like.hooks.use-like.duplicate_like',
			noGems: 'features.like.hooks.use-like.no_gems',
			ticketInsufficient: 'features.like.hooks.use-like.ticket_insufficient',
			communicationRestricted: 'features.like.hooks.use-like.communication_restricted',
			alreadyLiked: 'features.like.hooks.use-like.already_liked',
		},
	},
} as const;
