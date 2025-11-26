/**
 * I'mport.js 타입 정의
 * https://cdn.iamport.kr/v1/iamport.js
 */

declare namespace IMP {
  interface RequestPayParams {
    /** PG사 구분코드 (형식: PG사코드.{상점ID}) */
    pg?: string;
    /** 결제수단 구분코드 */
    pay_method?: PayMethod;
    /** 에스크로 결제창 활성화 여부 */
    escrow?: boolean;
    /** 에스크로 결제 정보 (escrow가 true일 때만 유효) */
    escrowProducts?: EscrowProduct[];
    /** 가맹점 주문번호 (40Byte 이내) */
    merchant_uid: string;
    /** 결제대상 제품명 (16byte 이내) */
    name: string;
    /** 결제금액 */
    amount: number;
    /** 사용자 정의 데이터 */
    channelKey?: string;
    custom_data?: any;
    /** 면세금액 */
    tax_free?: number;
    /** 부가세 */
    vat_amount?: number;
    /** 결제통화 구분코드 */
    currency?: Currency;
    /** 결제창 언어 설정 */
    language?: Language;
    /** 주문자명 */
    buyer_name?: string;
    /** 주문자 연락처 */
    buyer_tel?: string;
    /** 주문자 이메일 */
    buyer_email?: string;
    /** 주문자 주소 */
    buyer_addr?: string;
    /** 주문자 우편번호 */
    buyer_postcode?: string;
    /** 웹훅(Webhook) 수신 주소 */
    notice_url?: string;
    /** 가맹점 정의 빌링키 */
    customer_uid?: string;
    /** 디지털 구분자 */
    digital?: boolean;
    /** 가상계좌 입금기한 (YYYYMMDDhhmm 형식) */
    vbank_due?: string;
    /** 결제완료 후 이동될 URL */
    m_redirect_url?: string;
    /** 모바일 앱 결제 중 가맹점 앱 복귀를 위한 URL scheme */
    app_scheme?: string;
    /** 사업자등록번호 */
    biz_num?: string;
    /** 결제창 표시 옵션 */
    display?: {
      card_quota?: number[];
    };
    /** 카드 결제 옵션 */
    card?: {
      direct?: {
        code: string;
        quota: number;
      };
      detail?: {
        card_code: string;
        enabled: boolean;
      }[];
    };
  }

  interface EscrowProduct {
    /** 상품 고유 ID */
    id: string;
    /** 상품명 */
    name: string;
    /** 상품 코드 */
    code: string;
    /** 상품 단위 가격 */
    unitPrice: number;
    /** 수량 */
    quantity: number;
  }

  interface RequestPayResponse {
    /** 결제 성공 여부 */
    success: boolean;
    /** 결제 실패 코드 */
    error_code?: string;
    /** 결제 실패 메시지 */
    error_msg?: string;
    /** 포트원 고유 결제번호 */
    imp_uid?: string;
    /** 주문번호 */
    merchant_uid: string;
    /** 결제수단 구분코드 */
    pay_method?: PayMethod;
    /** 결제금액 */
    paid_amount?: number;
    /** 결제상태 */
    status?: PaymentStatus;
    /** 주문자명 */
    name?: string;
    /** PG사 구분코드 */
    pg_provider?: string;
    /** 간편결제 구분코드 */
    emb_pg_provider?: string;
    /** PG사 거래번호 */
    pg_tid?: string;
    /** 주문자명 */
    buyer_name?: string;
    /** 주문자 이메일 */
    buyer_email?: string;
    /** 주문자 연락처 */
    buyer_tel?: string;
    /** 주문자 주소 */
    buyer_addr?: string;
    /** 주문자 우편번호 */
    buyer_postcode?: string;
    /** 가맹점 임의 지정 데이터 */
    custom_data?: string;
    /** 결제승인시각 (UNIX timestamp) */
    paid_at?: number;
    /** 거래 매출전표 URL */
    receipt_url?: string;
    /** 신용카드 승인번호 */
    apply_num?: string;
    /** 가상계좌 입금 계좌번호 */
    vbank_num?: string;
    /** 가상계좌 입금은행 명 */
    vbank_name?: string;
    /** 가상계좌 예금주 */
    vbank_holder?: string;
    /** 가상계좌 입금기한 (UNIX timestamp) */
    vbank_date?: number;
    /** 카드사 명 */
    card_name?: string;
    /** 카드번호 */
    card_number?: string;
    /** 할부개월 수 */
    card_quota?: number;
    /** 통화 */
    currency?: string;
    /** PG 타입 */
    pg_type?: string;
  }

  type PayMethod =
    | 'card'
    | 'trans'
    | 'vbank'
    | 'phone'
    | 'paypal'
    | 'applepay'
    | 'naverpay'
    | 'samsung'
    | 'kpay'
    | 'kakaopay'
    | 'payco'
    | 'lpay'
    | 'ssgpay'
    | 'tosspay'
    | 'cultureland'
    | 'smartculture'
    | 'happymoney'
    | 'booknlife'
    | 'point'
    | 'wechat'
    | 'alipay'
    | 'unionpay'
    | 'tenpay';

  type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY';

  type Language = 'ko' | 'en';

  type PaymentStatus = 'ready' | 'paid' | 'failed';

  interface RequestPayResponseCallback {
    (response: RequestPayResponse): void;
  }

  interface CertificationParams {
    merchant_uid: string;
    company?: string;
    carrier?: string;
    name?: string;
    phone?: string;
  }

  interface CertificationResponse {
    success: boolean;
    imp_uid?: string;
    error_msg?: string;
  }

  interface IamportInstance {
    /** I'mport 초기화 */
    init(accountID: string): void;
    /** 결제 요청 */
    request_pay(params: RequestPayParams, callback?: RequestPayResponseCallback): void;
    /** 본인인증 요청 */
    certification(params: CertificationParams, callback?: (response: CertificationResponse) => void): void;
  }
}

interface Window {
  IMP?: IMP.IamportInstance;
}

declare const IMP: IMP.IamportInstance;
