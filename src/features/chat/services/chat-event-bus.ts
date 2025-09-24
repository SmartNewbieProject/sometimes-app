import type { Observable, Subject as SubjectType } from 'rxjs';
import { Subject } from 'rxjs';
import type { ChatDomainEvent } from '../types/event';

class ChatEventBus {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	private eventStreams = new Map<string, SubjectType<any>>();

	emit<T extends ChatDomainEvent>(event: T) {
		const stream = this.getOrCreateStream(event.type);
		stream.next(event);
	}

	on<T extends ChatDomainEvent['type']>(
		eventType: T,
	): Observable<Extract<ChatDomainEvent, { type: T }>> {
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

export const chatEventBus = new ChatEventBus();
