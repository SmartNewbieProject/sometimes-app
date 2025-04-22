/**
 * 아임포트 타입 정의
 */
declare namespace IMP {
  interface RequestPayParams {
    /** 포트원 채널 키 */
    channelKey: string;
    /** 결제 수단 */
    pay_method: string;
    /** 주문 번호 */
    merchant_uid: string;
    /** 주문명 */
    name: string;
    /** 결제 금액 */
    amount: number;
    /** 구매자 이름 */
    buyer_name?: string;
    /** 구매자 전화번호 */
    buyer_tel?: string;
    /** 구매자 이메일 */
    buyer_email?: string;
    /** 구매자 주소 */
    buyer_addr?: string;
    /** 구매자 우편번호 */
    buyer_postcode?: string;
    /** 모바일 환경에서 리다이렉트 URL */
    m_redirect_url?: string;
    /** 앱 스키마 */
    app_scheme?: string;
    /** 사용자 정의 데이터 */
    custom_data?: any;
    /** 결제 통화 */
    currency?: string;
    /** 면세 금액 */
    tax_free?: number;
    /** 결제 창 언어 설정 */
    language?: string;
    /** 결제 창 스타일 */
    display?: {
      card_quota?: number[];
    };
    /** 결제 창 닫기 가능 여부 */
    escrow?: boolean;
    /** 결제 창 닫기 가능 여부 */
    popup?: boolean;
  }

  interface RequestPayResponse {
    /** 결제 성공 여부 */
    success: boolean;
    /** 결제 실패 코드 */
    error_code?: string;
    /** 결제 실패 메시지 */
    error_msg?: string;
    /** 아임포트 결제 고유 번호 */
    imp_uid?: string;
    /** 가맹점 주문 번호 */
    merchant_uid?: string;
    /** 결제 수단 */
    pay_method?: string;
    /** 결제 금액 */
    paid_amount?: number;
    /** 결제 상태 */
    status?: string;
    /** 결제 시간 */
    paid_at?: number;
    /** 결제 성공 시간 */
    success_at?: number;
    /** 결제 실패 시간 */
    failed_at?: number;
    /** 결제 취소 시간 */
    cancelled_at?: number;
    /** 결제 취소 금액 */
    cancel_amount?: number;
    /** 결제 취소 사유 */
    cancel_reason?: string;
    /** 결제 취소 가능 여부 */
    cancel_available?: boolean;
    /** 결제 카드 정보 */
    card_info?: {
      /** 카드 번호 */
      card_number?: string;
      /** 카드 종류 */
      card_type?: string;
      /** 카드 회사 */
      card_name?: string;
      /** 할부 개월 수 */
      card_quota?: number;
      /** 카드 승인 번호 */
      card_approve_no?: string;
    };
    /** 가상계좌 정보 */
    vbank_info?: {
      /** 가상계좌 번호 */
      vbank_num?: string;
      /** 가상계좌 은행 */
      vbank_name?: string;
      /** 가상계좌 예금주 */
      vbank_holder?: string;
      /** 가상계좌 입금 기한 */
      vbank_date?: number;
    };
  }

  interface IMP {
    init: (accountID: string) => void;
    request_pay: (params: RequestPayParams, callback: (response: RequestPayResponse) => void) => void;
  }
}

interface Window {
  IMP?: IMP.IMP;
}
