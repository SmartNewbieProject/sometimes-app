import { useEffect, useRef } from 'react';
import { useChatActivitySummary, useMarkActivityTracked } from '../queries/use-chat-activity';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { AMPLITUDE_KPI_EVENTS } from '@/src/shared/constants/amplitude-kpi-events';
import type { Activity24hStatus } from '../types/chat-activity';

function determineActivityStatus(isActive: boolean, isMutualConversation: boolean): Activity24hStatus {
	if (!isActive) return 'inactive';
	if (isMutualConversation) return 'mutual';
	return 'one_sided';
}

export function useAutoTrackChatActivity() {
	const { isAuthorized } = useAuth();
	const isTrackingRef = useRef(false);

	const { data: summary, isSuccess } = useChatActivitySummary(true, isAuthorized);
	const { mutateAsync: markTracked } = useMarkActivityTracked();

	useEffect(() => {
		if (!isSuccess || !summary?.rooms || summary.rooms.length === 0) {
			return;
		}

		if (isTrackingRef.current) {
			return;
		}

		const trackPendingRooms = async () => {
			isTrackingRef.current = true;

			for (const room of summary.rooms) {
				if (!room.shouldTrack) continue;

				const status = determineActivityStatus(room.isActive, room.isMutualConversation);

				try {
					mixpanelAdapter.track(AMPLITUDE_KPI_EVENTS.CHAT_24H_ACTIVE, {
						chat_room_id: room.chatRoomId,
						match_id: room.matchId,
						chat_partner_id: room.partnerId,
						is_active: room.isActive,
						is_mutual_conversation: room.isMutualConversation,
						activity_status: status,
						tracking_source: 'app',
						timestamp: new Date().toISOString(),
					});

					await markTracked({
						chatRoomId: room.chatRoomId,
						trackedAt: new Date().toISOString(),
						activityStatus: status,
					});

					console.log(`[Chat24hActivity] Tracked: ${room.chatRoomId} (${status})`);
				} catch (error) {
					console.error(`[Chat24hActivity] Failed to track: ${room.chatRoomId}`, error);
				}
			}

			isTrackingRef.current = false;
		};

		trackPendingRooms();
	}, [isSuccess, summary, markTracked]);
}
