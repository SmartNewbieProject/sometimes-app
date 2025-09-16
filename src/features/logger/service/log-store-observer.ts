import { Subject, debounceTime } from 'rxjs';

const createObserver = () => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let observers: any[] = [];
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let logs: any[] = [];

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const logSubject = new Subject<any[]>();

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

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		addLogs: (log: any) => {
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
