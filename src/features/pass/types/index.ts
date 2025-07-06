// PortOne V2 본인인증 요청 파라미터
export interface PortOneIdentityVerificationRequest {
  storeId: string;
  identityVerificationId: string;
  channelKey: string;
  redirectUrl?: string;
  windowType?: {
    pc: "POPUP" | "IFRAME" | "REDIRECTION";
    mobile: "POPUP" | "IFRAME" | "REDIRECTION";
  };
  customer?: {
    customerId?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
  };
  customData?: string;
  bypass?: Record<string, any>;
}

// PortOne V2 본인인증 응답
export interface PortOneIdentityVerificationResponse {
  code?: string;
  message?: string;
  identityVerificationId?: string;
}

// 서버에서 조회한 본인인증 완료 정보
export interface PortOneVerifiedCustomer {
  id?: string;
  name: string;
  operator?: 'SKT' | 'KT' | 'LGU+';
  phoneNumber?: string;
  birthDate?: string; // yyyy-MM-dd 형식
  gender?: 'MALE' | 'FEMALE';
  isForeigner?: boolean;
  ci?: string;
  di?: string;
}

export interface PortOneIdentityVerificationResult {
  status: 'VERIFIED' | 'FAILED' | 'READY';
  id: string;
  verifiedCustomer?: PortOneVerifiedCustomer;
  requestedAt: string;
  updatedAt: string;
  statusChangedAt: string;
  verifiedAt?: string;
  pgTxId?: string;
  pgRawResponse?: string;
}


// 본인인증 옵션
export interface PortOneAuthOptions {
  customer?: {
    customerId?: string;
    fullName?: string;
    phoneNumber?: string;
    email?: string;
  };
  customData?: string;
  onSuccess?: (result: PortOneIdentityVerificationResult) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

// WebView 메시지 타입
export interface PortOneWebViewMessage {
  type: 'success' | 'error' | 'cancel';
  data?: PortOneIdentityVerificationResponse | string;
}

// === KCP PASS Legacy Types (for backward compatibility) ===

// PASS 본인인증 요청 파라미터
export interface PassAuthRequest {
  siteCd: string;
  siteUrl: string;
  cpCd: string;
  ordr_idxx: string;
  req_tx: string;
  cert_otp_use?: string;
  up_hash?: string;
  cert_enc_use?: string;
}

// PASS 인증 응답
export interface PassAuthResponse {
  ordr_idxx: string;
  res_cd: string;
  res_msg: string;
  cert_no: string;
  cert_date: string;
  cert_txseq: string;
  phone_no?: string;
  birth_day?: string;
  sex_code?: string; // 1: 남성, 2: 여성
  ci?: string;
  di?: string;
  name?: string;
  local_code?: string;
  nation_code?: string;
  up_hash?: string;
}

// PASS 설정
export interface PassConfig {
  siteCd: string;
  siteUrl: string;
  cpCd: string;
  isTestMode?: boolean;
  popupYn?: 'Y' | 'N';
}

// PASS 인증 옵션
export interface PassAuthOptions {
  authType: 'M' | 'C' | 'I'; // M: 휴대폰, C: 신용카드, I: 아이핀
  menuTitle?: string;
  onSuccess?: (response: PassAuthResponse) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

// WebView 메시지 타입
export interface PassWebViewMessage {
  type: 'success' | 'error' | 'cancel';
  data?: PassAuthResponse | string;
}
