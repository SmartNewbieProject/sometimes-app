import { Subject, debounceTime, map } from 'rxjs';
import type { Log } from '../types/log';

const MAX_LOGS_COUNT = 100;

const createObserver = () => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let observers: any[] = [];
	let logs: Log[] = [];

	const logSubject = new Subject<Log[]>();

	logSubject.pipe(debounceTime(100)).subscribe((debouncedLogs) => {
		// biome-ignore lint/complexity/noForEach: <explanation>
		observers.forEach((observer) => observer(debouncedLogs));
	});

	const notify = () => {
		logSubject.next([...logs]);
	};

	return {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		subscribe: (callback: any) => {
			observers.push(callback);

			return () => {
				observers = observers.filter((observer) => observer !== callback);
			};
		},

		addLogs: (log: Log) => {
			if (logs.length >= MAX_LOGS_COUNT) {
				logs.shift();
			}
			logs.push(log);
			notify();
		},

		clear: () => {
			logs = [];
			notify();
		},
	};
};

export const logObserver = createObserver();
