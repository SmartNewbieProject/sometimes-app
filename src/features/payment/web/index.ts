/**
 * 웹 환경에서 I'mport.js를 사용하기 위한 유틸리티 함수
 */

/**
 * I'mport 결제 요청 함수
 * @param params 결제 요청 파라미터
 * @returns Promise<IMP.RequestPayResponse>
 */
export const requestPay = (params: IMP.RequestPayParams): Promise<IMP.RequestPayResponse> => {
	return new Promise((resolve, reject) => {
		if (!window.IMP) {
			reject(new Error('IMP 객체가 초기화되지 않았습니다.'));
			return;
		}

		window.IMP.request_pay(params, (response: IMP.RequestPayResponse) => {
			resolve(response);
		});
	});
};

/**
 * I'mport 초기화 함수
 * @param accountID 가맹점 식별코드
 */
let authorized = false;
export const initializeIMP = (accountID: string): void => {
	console.log('initializeIMP()');
	if (authorized) {
		console.debug('이미 IMP 객체가 초기화되었습니다.');
		return;
	}
	if (window.IMP) {
		window.IMP.init(accountID);
		console.debug(`${accountID} 로 객체가 초기화되었습니다.`);
		authorized = true;
	} else {
		console.error('IMP 객체를 찾을 수 없습니다. 스크립트가 로드되었는지 확인하세요.');
	}
};

/**
 * 웹 환경에서 I'mport.js 스크립트 로드 여부 확인
 * @returns boolean
 */
export const isIMPLoaded = (): boolean => {
	return typeof window !== 'undefined' && !!window.IMP;
};

/**
 * I'mport 초기화 상태 리셋
 * 결제 모듈을 완전히 초기화하기 위해 호출
 */
export const resetIMP = (): void => {
	console.debug('IMP 초기화 상태 리셋');
	authorized = false;
};

export default {
	requestPay,
	initializeIMP,
	isIMPLoaded,
	resetIMP,
};
