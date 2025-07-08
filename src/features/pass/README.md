# 본인인증 시스템 (PortOne V2 & NHN KCP PASS)

이 모듈은 PortOne V2와 NHN KCP PASS 본인인증을 지원하는 통합 인증 시스템입니다.

## 주요 기능

### PortOne V2 (권장)
- 웹/모바일 환경에서 통합 본인인증
- 로그인 플로우와 통합된 사용자 경험
- 신규/기존 사용자 자동 구분
- TypeScript 지원과 완전한 타입 안전성

### NHN KCP PASS (레거시 지원)
- 휴대폰, 신용카드, 아이핀 본인인증 지원
- WebView 기반 인증 처리
- 재사용 가능한 컴포넌트 및 훅 제공

## 설치 및 설정

### 1. 필요한 의존성 설치

```bash
npm install react-native-webview
expo install react-native-safe-area-context
```

### 2. app.json 설정

커스텀 URL 스키마를 위해 `app.json`에 다음을 추가하세요:

```json
{
  "expo": {
    "scheme": "sometimesapp"
  }
}
```

### 3. NHN KCP 계약 및 설정

NHN KCP에서 PASS 본인인증 서비스를 계약하고 다음 정보를 받아야 합니다:
- 사이트 코드 (siteCd)
- CP 코드 (cpCd)
- 사이트 URL (siteUrl)

## 사용법

### PortOne V2 사용법 (권장)

#### 1. 환경 변수 설정

`.env` 파일에 PortOne 설정을 추가하세요:

```bash
# PortOne V2 본인인증 설정
EXPO_PUBLIC_STORE_ID=your_store_id
EXPO_PUBLIC_CHANNEL_KEY=your_channel_key
EXPO_PUBLIC_MERCHANT_ID=your_merchant_id
EXPO_PUBLIC_IMP=your_imp_uid
EXPO_PUBLIC_PG_PROVIDER=your_pg_provider
EXPO_PUBLIC_PASS_CHANNEL_KEY=your_pass_channel_key
```

**주의**: 모든 환경변수는 실제 PortOne 대시보드에서 받은 값으로 설정해야 합니다. `EXPO_PUBLIC_STORE_ID`와 `EXPO_PUBLIC_PASS_CHANNEL_KEY`는 필수 항목입니다.

#### 2. usePortOneLogin 훅 사용

```tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { usePortOneLogin } from '@/features/pass';

const LoginScreen = () => {
  // 환경변수는 서비스 내부에서 자동으로 로드됩니다
  const { startPortOneLogin, isLoading, error, clearError } = usePortOneLogin({
    onSuccess: (isNewUser) => {
      console.log(isNewUser ? '신규 사용자 회원가입 플로우' : '기존 사용자 로그인 완료');
    },
    onError: (error) => {
      console.error('PortOne 로그인 실패:', error);
    },
  });

  return (
    <View>
      <TouchableOpacity 
        onPress={() => startPortOneLogin()}
        disabled={isLoading}
      >
        <Text>{isLoading ? 'PASS 인증 중...' : 'PASS로 바로 시작하기'}</Text>
      </TouchableOpacity>
      
      {error && (
        <TouchableOpacity onPress={clearError}>
          <Text style={{ color: 'red' }}>{error}</Text>
          <Text>탭하여 닫기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

#### 3. 서비스 별도 사용 (고급)

비즈니스 로직을 더 세밀하게 제어하려면 서비스 클래스를 직접 사용할 수 있습니다:

```tsx
import { PortOneAuthService, PortOneLoginService } from '@/features/pass';

const handleCustomAuth = async () => {
  // 환경변수는 서비스 내부에서 자동으로 로드됩니다
  const authService = new PortOneAuthService();
  const loginService = new PortOneLoginService();
  
  try {
    // 1. 본인인증 요청
    const authResponse = await authService.requestIdentityVerification();
    
    // 2. 서버로 인증 결과 전송
    const loginResult = await loginService.loginWithIdentityVerification(
      authResponse.identityVerificationId
    );
    
    console.log('로그인 결과:', loginResult);
  } catch (error) {
    console.error('인증 실패:', error);
  }
};
```

### NHN KCP PASS 사용법 (레거시)

#### 1. 기본 설정

```tsx
import { PassConfig } from '@/features/pass';

const passConfig: PassConfig = {
  siteCd: 'YOUR_SITE_CODE',
  siteUrl: 'https://yourdomain.com',
  cpCd: 'YOUR_CP_CODE',
  isTestMode: true, // 개발환경에서는 true
  popupYn: 'N',
};
```

### 2. PassAuthButton 컴포넌트 사용

```tsx
import React from 'react';
import { View } from 'react-native';
import { PassAuthButton, PassAuthResponse } from '@/features/pass';

const MyComponent = () => {
  const handleSuccess = (response: PassAuthResponse) => {
    console.log('인증 성공:', response);
    // 서버로 인증 결과 전송
  };

  const handleError = (error: Error) => {
    console.error('인증 실패:', error);
  };

  return (
    <View>
      <PassAuthButton
        config={passConfig}
        authType="M" // M: 휴대폰, C: 신용카드, I: 아이핀
        title="휴대폰 본인인증"
        onSuccess={handleSuccess}
        onError={handleError}
        onCancel={() => console.log('인증 취소')}
      />
    </View>
  );
};
```

### 3. usePassAuth 훅 사용

```tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { usePassAuth } from '@/features/pass';

const MyComponent = () => {
  const { isLoading, error, startAuth, clearError } = usePassAuth(passConfig);

  const handlePress = async () => {
    await startAuth({
      authType: 'M',
      onSuccess: (response) => {
        console.log('인증 성공:', response);
      },
      onError: (error) => {
        console.error('인증 실패:', error);
      },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={isLoading}>
      <Text>{isLoading ? '인증 중...' : '휴대폰 본인인증'}</Text>
    </TouchableOpacity>
  );
};
```

## 컴포넌트 API

### PassAuthButton

| Props | Type | Required | Description |
|-------|------|----------|-------------|
| config | PassConfig | ✓ | PASS 인증 설정 |
| authType | 'M' \| 'C' \| 'I' | ✓ | 인증 방식 (M: 휴대폰, C: 신용카드, I: 아이핀) |
| title | string | | 버튼 텍스트 |
| style | ViewStyle | | 버튼 스타일 |
| textStyle | TextStyle | | 텍스트 스타일 |
| disabled | boolean | | 버튼 비활성화 |
| onSuccess | (response: PassAuthResponse) => void | ✓ | 인증 성공 콜백 |
| onError | (error: Error) => void | | 인증 실패 콜백 |
| onCancel | () => void | | 인증 취소 콜백 |

### PassWebView

| Props | Type | Required | Description |
|-------|------|----------|-------------|
| visible | boolean | ✓ | WebView 표시 여부 |
| config | PassConfig | ✓ | PASS 인증 설정 |
| options | PassAuthOptions | ✓ | 인증 옵션 |
| onClose | () => void | ✓ | WebView 닫기 콜백 |

## 타입 정의

### PassConfig

```tsx
interface PassConfig {
  siteCd: string;      // KCP 사이트 코드
  siteUrl: string;     // 사이트 URL
  cpCd: string;        // KCP CP 코드
  isTestMode?: boolean; // 테스트 모드 여부
  popupYn?: 'Y' | 'N'; // 팝업 여부
}
```

### PassAuthResponse

```tsx
interface PassAuthResponse {
  ordr_idxx: string;    // 주문번호
  res_cd: string;       // 응답코드
  res_msg: string;      // 응답메시지
  cert_no: string;      // 인증번호
  cert_date: string;    // 인증일시
  cert_txseq: string;   // 인증거래번호
  phone_no?: string;    // 휴대폰번호
  birth_day?: string;   // 생년월일
  sex_code?: string;    // 성별코드 (1: 남성, 2: 여성)
  ci?: string;          // CI 값
  di?: string;          // DI 값
  name?: string;        // 이름
  local_code?: string;  // 내외국인코드
  nation_code?: string; // 국가코드
  up_hash?: string;     // 업체해시값
}
```

## 서버 연동

인증 결과를 서버로 전송하여 검증하는 예시:

```tsx
const sendAuthToServer = async (authResponse: PassAuthResponse) => {
  try {
    const response = await fetch('/api/auth/verify-pass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authResponse),
    });

    if (!response.ok) {
      throw new Error('서버 인증 실패');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('서버 전송 오류:', error);
    throw error;
  }
};
```

## 주의사항

1. **보안**: 인증 결과는 반드시 서버에서 검증해야 합니다.
2. **테스트**: 개발환경에서는 `isTestMode: true`로 설정하세요.
3. **URL 스키마**: `app.json`에 커스텀 URL 스키마를 설정해야 합니다.
4. **KCP 계약**: NHN KCP와 PASS 본인인증 서비스 계약이 필요합니다.
5. **네트워크**: HTTPS 환경에서만 동작합니다.

## 문제 해결

### WebView가 로드되지 않는 경우
- 네트워크 연결 확인
- KCP 서비스 상태 확인
- 설정값 (siteCd, cpCd 등) 확인

### 인증 완료 후 결과가 전달되지 않는 경우
- URL 스키마 설정 확인
- 리턴 URL 설정 확인
- 서버의 CORS 설정 확인

### iOS에서 WebView가 열리지 않는 경우
- Info.plist에 LSApplicationQueriesSchemes 추가
- NSAppTransportSecurity 설정 확인

## 예제

완전한 사용 예제는 `examples/pass-auth-example.tsx` 파일을 참고하세요.
