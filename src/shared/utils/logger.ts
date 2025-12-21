/**
 * Development-only logging utilities
 * 프로덕션 빌드에서는 자동으로 제거되는 로깅 함수들
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

/**
 * 개발 환경에서만 console.log 출력
 */
export const devLog = (...args: unknown[]): void => {
	if (__DEV__) {
		console.log(...args);
	}
};

/**
 * 개발 환경에서만 console.warn 출력
 */
export const devWarn = (...args: unknown[]): void => {
	if (__DEV__) {
		console.warn(...args);
	}
};

/**
 * 개발 환경에서만 console.info 출력
 */
export const devInfo = (...args: unknown[]): void => {
	if (__DEV__) {
		console.info(...args);
	}
};

/**
 * 개발 환경에서만 console.debug 출력
 */
export const devDebug = (...args: unknown[]): void => {
	if (__DEV__) {
		console.debug(...args);
	}
};

/**
 * 에러는 프로덕션에서도 출력 (모니터링 필요)
 */
export const logError = (...args: unknown[]): void => {
	console.error(...args);
};

/**
 * 태그가 있는 로그 (예: [API], [Query], [매칭] 등)
 */
export const devLogWithTag = (tag: string, ...args: unknown[]): void => {
	if (__DEV__) {
		console.log(`[${tag}]`, ...args);
	}
};

/**
 * 성능 측정용 로그 (시작/종료 시간 측정)
 */
export const createPerformanceLogger = (label: string) => {
	const startTime = __DEV__ ? Date.now() : 0;

	return {
		end: () => {
			if (__DEV__) {
				const duration = Date.now() - startTime;
				console.log(`[Performance] ${label}: ${duration}ms`);
			}
		},
	};
};

/**
 * 조건부 로그 (특정 조건에서만 출력)
 */
export const devLogIf = (condition: boolean, ...args: unknown[]): void => {
	if (__DEV__ && condition) {
		console.log(...args);
	}
};

/**
 * 객체를 깔끔하게 출력 (JSON.stringify 사용)
 */
export const devLogObject = (label: string, obj: unknown): void => {
	if (__DEV__) {
		console.log(`${label}:`, JSON.stringify(obj, null, 2));
	}
};
