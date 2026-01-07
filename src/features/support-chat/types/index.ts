export type SessionStatus = 'bot_handling' | 'waiting_admin' | 'admin_handling' | 'resolved';

export type SenderType = 'user' | 'bot' | 'admin';

export type Language = 'ko' | 'ja';

export type SupportDomain = 'payment' | 'matching' | 'chat' | 'account' | 'other';

export type ConversationPhase = 'asking' | 'answering';

export interface MessageMetadata {
	confidence?: number;
	sources?: Array<{
		question: string;
		answer: string;
		similarity: number;
	}>;
	translatedFrom?: string;
	domain?: SupportDomain;
	collectedInfo?: Record<string, string>;
	phase?: ConversationPhase;
}

export interface SupportChatMessage {
	id: string;
	sessionId?: string;
	senderType: SenderType;
	senderId?: string;
	content: string;
	metadata?: MessageMetadata;
	createdAt: string;
}

export interface SupportChatSession {
	sessionId: string;
	status: SessionStatus;
	language: Language;
	createdAt: string;
	resolvedAt?: string;
	lastMessage?: string;
	messages?: SupportChatMessage[];
}

export interface CreateSessionRequest {
	language?: Language;
}

export interface CreateSessionResponse {
	sessionId: string;
	status: SessionStatus;
	language: Language;
	createdAt: string;
	messages: SupportChatMessage[];
}

export interface GetMySessionsResponse {
	sessions: SupportChatSession[];
}

export interface GetSessionMessagesResponse {
	sessionId: string;
	status: SessionStatus;
	messages: SupportChatMessage[];
}

export interface JoinSessionPayload {
	sessionId: string;
}

export interface JoinSessionResponse {
	success: boolean;
	sessionId?: string;
	error?: string;
}

export interface SendMessagePayload {
	sessionId: string;
	content: string;
}

export interface SendMessageResponse {
	success: boolean;
	error?: string;
}

export interface TypingPayload {
	sessionId: string;
	isTyping: boolean;
}

export interface NewMessageEvent {
	sessionId: string;
	id: string;
	senderType: SenderType;
	content: string;
	metadata?: MessageMetadata;
	createdAt: string;
}

export interface SessionStatusChangedEvent {
	sessionId: string;
	oldStatus: SessionStatus;
	newStatus: SessionStatus;
	assignedAdminId?: string;
}

export interface TypingEvent {
	sessionId: string;
	userId: string;
	isTyping: boolean;
}
