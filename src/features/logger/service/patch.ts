import { nanoid } from 'nanoid/non-secure';
import { logObserver } from './log-store-observer';

export const originalConsoles = { ...console };

const levels = ['error', 'log', 'warn', 'trace', 'debug'] as const;
declare global {
	interface XMLHttpRequest {
		_requestInfo?: {
			method: string;
			url: string;
			startTime: number;
		};
	}
}
// biome-ignore lint/complexity/noForEach: <explanation>
levels.forEach((label) => {
	console[label] = (...args) => {
		logObserver.addLogs({
			data: args,
			id: nanoid(),
			level: label,
			type: 'console',
			timestamp: new Date().toISOString(),
		});
		originalConsoles[label](...args);
	};
});

if (typeof XMLHttpRequest !== 'undefined') {
	const originalRequestOpen = XMLHttpRequest.prototype.open;
	const originalRequestSend = XMLHttpRequest.prototype.send;

	XMLHttpRequest.prototype.open = function (method, url: string) {
		this._requestInfo = { method, url, startTime: Date.now() };
		originalRequestOpen.apply(this, [method, url]);
	};

	XMLHttpRequest.prototype.send = function (body) {
		this.addEventListener('loadend', () => {
			if (this?._requestInfo) {
				const { method, url, startTime } = this._requestInfo;
				const duration = Date.now() - startTime;
				// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
				let responseBody;
				if (this.responseType === 'blob') {
					// responseType이 blob이면 responseText에 접근하지 않음
					responseBody = '[Binary Blob Data]';
				} else {
					// 그 외의 경우에는 responseText를 사용
					responseBody = this.responseText;
				}
				logObserver.addLogs({
					type: 'network',
					id: nanoid(),
					method,
					url,
					status: this.status,
					duration: `${duration}ms`,
					requestBody: body,
					responseBody: responseBody,
					timestamp: new Date().toISOString(),
				});
			}
		});
		originalRequestSend.apply(this, [body]);
	};
}
