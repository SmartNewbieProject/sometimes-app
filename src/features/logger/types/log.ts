export type LogLevel = 'error' | 'log' | 'warn' | 'trace' | 'debug';
export interface ConsoleLog {
	id: string;
	type: 'console';
	level: LogLevel;

	timestamp: string;
	data: unknown[];
}

export interface NetworkLog {
	id: string;
	timestamp: string;
	method: string;
	url: string;
	type: 'network';
	status: number;
	duration: string;
	requestBody: Document | XMLHttpRequestBodyInit | null | undefined;
	responseBody: string;
}

export type Log = ConsoleLog | NetworkLog;
