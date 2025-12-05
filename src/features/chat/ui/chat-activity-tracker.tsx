import { useAutoTrackChatActivity } from '../hooks/use-auto-track-chat-activity';

export function ChatActivityTracker() {
	useAutoTrackChatActivity();
	return null;
}
