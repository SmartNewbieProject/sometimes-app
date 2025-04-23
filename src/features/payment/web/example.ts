import { Platform } from 'react-native';
import webPayment from './index';
import { useAuth } from '../../auth';

/**
 * 웹 환경에서 결제 요청 예제
 */
export const requestWebPayment = async (
  orderName: string,
  amount: number,
  merchantUid: string
): Promise<IMP.RequestPayResponse> => {
  const { profileDetails } = useAuth();
  // 웹 환경에서만 실행
  if (Platform.OS !== 'web') {
    throw new Error('웹 환경에서만 사용 가능합니다.');
  }

  // I'mport 초기화 - 환경 변수에서 가맹점 식별코드 가져오기
  const merchantID = process.env.EXPO_PUBLIC_MERCHANT_ID || 'imp00000000';
  webPayment.initializeIMP(merchantID);

  // 결제 요청 파라미터
  const paymentParams: IMP.RequestPayParams = {
    pg: 'html5_inicis', // PG사 코드
    pay_method: 'card', // 결제 수단
    merchant_uid: merchantUid, // 주문번호
    name: orderName, // 주문명
    amount: amount, // 결제금액
    buyer_email: 'buyer@example.com', // 구매자 이메일
    buyer_name: profileDetails?.name!, // 구매자 이름
    buyer_tel: '010-1234-5678', // 구매자 전화번호
    buyer_addr: '서울특별시 강남구 삼성동', // 구매자 주소
    buyer_postcode: '123-456', // 구매자 우편번호
    m_redirect_url: window.location.origin + '/payment/complete', // 모바일 환경에서 결제 후 리다이렉트 될 URL
  };

  try {
    // 결제 요청
    const response = await webPayment.requestPay(paymentParams);
    return response;
  } catch (error) {
    console.error('결제 요청 중 오류 발생:', error);
    throw error;
  }
};
