import { nanoid } from 'nanoid/non-secure';
import { logObserver } from './log-store-observer';

const SENSITIVE_KEYS = [
	'password',
	'token',
	'secret',
	'apiKey',
	'authorization',
	'session',
	'credential',
];

type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

export const filterSensitiveData = (data: JsonValue): JsonValue => {
	if (typeof data !== 'object' || data === null) {
		return data;
	}

	if (Array.isArray(data)) {
		return data.map((item) => filterSensitiveData(item));
	}

	const newObj: { [key: string]: JsonValue } = {};

	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			if (SENSITIVE_KEYS.some((sensitiveKey) => key.toLowerCase().includes(sensitiveKey))) {
				newObj[key] = '[FILTERED]';
			} else {
				newObj[key] = filterSensitiveData(data[key]);
			}
		}
	}

	return newObj;
};

const formatDataForLogging = (data: unknown): string => {
	if (typeof data === 'string') {
		return data;
	}
	return JSON.stringify(data, null, 2);
};

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

				let safeResponseBody: unknown;
				if (this.responseType === 'blob' || !this.responseText) {
					safeResponseBody = this.responseType === 'blob' ? '[Binary Blob Data]' : '';
				} else {
					try {
						const parsedResponse = JSON.parse(this.responseText);
						safeResponseBody = filterSensitiveData(parsedResponse);
					} catch (e) {
						safeResponseBody = this.responseText;
					}
				}

				let safeRequestBody: unknown;
				try {
					const parsedRequest = typeof body === 'string' ? JSON.parse(body) : body;
					safeRequestBody = filterSensitiveData(parsedRequest);
				} catch (e) {
					safeRequestBody = body;
				}

				logObserver.addLogs({
					type: 'network',
					id: nanoid(),
					method,
					url: url.slice(25),
					status: this.status,
					duration: `${duration}ms`,
					requestBody: formatDataForLogging(safeRequestBody),
					responseBody: formatDataForLogging(safeResponseBody),
					timestamp: new Date().toISOString(),
				});
			}
		});
		originalRequestSend.apply(this, [body]);
	};
}
