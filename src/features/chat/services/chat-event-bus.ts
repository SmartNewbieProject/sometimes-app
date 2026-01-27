import { devLogWithTag } from '@/src/shared/utils';
import type { Observable, Subject as SubjectType } from 'rxjs';
import { Subject } from 'rxjs';
import type { ChatDomainEvent } from '../types/event';

declare const globalThis: {
	__chatEventBus?: ChatEventBus;
};

class ChatEventBus {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	private eventStreams = new Map<string, SubjectType<any>>();

	emit<T extends ChatDomainEvent>(event: T) {
		const stream = this.getOrCreateStream(event.type);
		devLogWithTag('EventBus', `Emitting event: ${event.type}`);
		stream.next(event);
	}

	on<T extends ChatDomainEvent['type']>(
		eventType: T,
	): Observable<Extract<ChatDomainEvent, { type: T }>> {
		devLogWithTag('EventBus', `Subscribing to: ${eventType}`);
		return this.getOrCreateStream(eventType).asObservable();
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	private getOrCreateStream(eventType: string): SubjectType<any> {
		const existingStream = this.eventStreams.get(eventType);

		if (existingStream) {
			return existingStream;
		}

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const newStream = new Subject<any>();
		this.eventStreams.set(eventType, newStream);

		return newStream;
	}
}

export const chatEventBus =
	globalThis.__chatEventBus ?? (globalThis.__chatEventBus = new ChatEventBus());
