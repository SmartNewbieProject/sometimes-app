React Native Expo 환경에서의 포트원 KCP 결제 및 본인인증 연동 완벽 가이드: 설정부터 서버 검증까지I. 하이브리드 연동 전략: 완벽한 네이티브 경험 구현하기A. 웹뷰(WebView) 중심 접근법의 타당성 검증React Native 환경에서 외부 결제 및 인증 서비스를 연동할 때, 웹뷰(WebView)를 사용하는 것이 과연 "자연스러운" 네이티브 경험을 제공할 수 있는지에 대한 의문은 매우 합리적입니다. 결론부터 말하자면, 포트원(PortOne) 연동에 있어 웹뷰를 활용하는 것은 단순한 대안이 아닌, 공식적으로 지원되고 의도된 핵심 연동 방식입니다.이러한 접근법의 타당성은 포트원이 제공하는 공식 @portone/react-native-sdk 패키지의 구조에서 명확히 드러납니다. 해당 SDK는 react-native-webview 라이브러리에 대한 명시적인 의존성을 가지고 있습니다.1 이는 포트원 엔지니어링팀이 웹뷰 환경에서의 통신 복잡성을 이미 추상화하여 개발자가 직접 처리할 필요가 없도록 설계했음을 의미합니다.따라서 개발자의 역할은 웹뷰 통신을 밑바닥부터 구현하는 것이 아니라, 포트원이 제공하는 SDK 컴포넌트를 올바르게 설정하고 사용하는 것입니다. SDK 내에서는 웹뷰와 네이티브 앱 간의 데이터 교환을 위한 window.ReactNativeWebView.postMessage와 같은 통신 브릿지를 자동으로 관리합니다.2 결과적으로 개발자는 저수준의 웹뷰 제어 대신, 선언적인 리액트(React) 컴포넌트(<PortOne />)와 속성(props) 및 콜백(callback) 함수를 통해 상호작용하게 되어 매우 직관적이고 유지보수가 용이한 "자연스러운" 연동을 구현할 수 있습니다.B. 성공적인 연동을 위한 세 가지 핵심 요소포트원 결제 및 본인인증 연동은 다음의 세 가지 핵심 요소를 기반으로 구축됩니다. 이 보고서는 각 요소를 심층적으로 다룰 것입니다.클라이언트 SDK 구현: <PortOne /> 컴포넌트에 결제 및 인증에 필요한 요청 데이터를 정확히 전달하고, 결과 콜백을 처리하는 클라이언트 측 로직.네이티브 환경 설정: KCP와 같은 국내 PG사 연동 시 필수적인 외부 앱(카드사 앱, 은행 앱 등)과의 통신을 위해 app.json 파일을 정교하게 설정하는 과정.서버 측 검증: 클라이언트로부터 받은 결제 성공 신호를 신뢰하지 않고, 가맹점 서버에서 포트원 API를 통해 거래의 유효성을 최종적으로 확인하는 보안 절차.이 세 가지 요소가 유기적으로 결합될 때, 사용자에게는 끊김 없는 네이티브 경험을 제공하면서도 비즈니스 로직은 안전하게 보호되는 견고한 결제 시스템을 구축할 수 있습니다.II. 기반 다지기: Expo 환경 설정본격적인 연동 코드 작성에 앞서, Expo 프로젝트가 포트원 SDK를 원활하게 실행할 수 있도록 개발 환경을 구성해야 합니다. 이 단계는 필요한 라이브러리를 설치하고, 타입스크립트 설정을 조정하며, Expo 플러그인을 활성화하는 과정을 포함합니다.A. 의존성 패키지 설치정확한 버전 호환성을 보장하고 네이티브 모듈 관련 문제를 최소화하기 위해, npm이나 yarn 대신 Expo CLI를 사용하여 관련 패키지를 설치하는 것이 매우 중요합니다.5 터미널에서 다음 명령어를 실행하여 포트원 SDK와 웹뷰 라이브러리를 설치합니다.Bashnpx expo install @portone/react-native-sdk react-native-webview
이 명령어는 현재 프로젝트의 Expo SDK 버전에 맞는 최적의 라이브러리 버전을 자동으로 선택하여 설치해 줍니다.1B. 타입스크립트(TypeScript) 설정타입스크립트를 사용하는 프로젝트에서는 결제 요청 및 응답 객체에 대한 타입 추론과 자동 완성 기능을 활용하여 개발 생산성을 높이고 잠재적 오류를 줄일 수 있습니다. 이를 위해 두 가지 추가 설정이 필요합니다.타입 정의 패키지 설치: 포트원 브라우저 SDK를 개발 의존성(devDependencies)으로 설치하여 타입 정보를 가져옵니다.1Bashnpm install --save-dev @portone/browser-sdk
# 또는
yarn add -D @portone/browser-sdk
tsconfig.json 수정: 프로젝트 루트의 tsconfig.json 파일 내 compilerOptions 객체에 다음 두 항목을 추가하거나 수정합니다. 이 설정은 SDK가 사용하는 모듈 시스템과 타입 해석 방식을 올바르게 인식하도록 돕습니다.1JSON{
"compilerOptions": {
//... 기존 설정들
"module": "NodeNext",
"moduleResolution": "NodeNext"
}
//...
}
C. Expo 플러그인 구성포트원 SDK는 네이티브 프로젝트 파일(AndroidManifest.xml, Info.plist)에 필요한 설정을 자동으로 추가해주는 Expo 플러그인을 제공합니다. app.json 파일의 plugins 배열에 이 플러그인을 추가해야 합니다.JSON{
"expo": {
//... 기존 설정들
"plugins": [
"@portone/react-native-sdk/plugin"
]
}
}
이 플러그인은 기본적인 네이티브 설정을 자동화하지만 1, 이후 IV장에서 설명할 외부 앱 연동을 위한 상세 설정(URL Schemes, Intent Queries 등)은 개발자가 직접 app.json에 추가해야 합니다.III. 핵심 컴포넌트: <PortOne /> 인터페이스 심층 분석클라이언트 측 연동의 중심에는 <PortOne /> 컴포넌트가 있습니다. 이 컴포넌트는 React Native UI와 포트원의 웹 기반 결제/인증 페이지 사이의 다리 역할을 하며, 복잡한 내부 동작을 감추고 간단한 인터페이스를 제공합니다.A. 요청 파라미터 (data 속성)결제나 본인인증을 시작하기 위해 <PortOne /> 컴포넌트의 data 속성에 객체 형태로 요청 정보를 전달해야 합니다. 각 파라미터는 연동의 성패를 좌우하는 중요한 역할을 합니다.표 1: 결제 및 본인인증 요청 파라미터 (data prop)파라미터타입필수 여부설명예시/참고storeIdstring필수포트원 콘솔에서 발급받은 상점 IDstore-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxchannelKeystring필수사용할 PG 채널의 키. KCP 연동 시 KCP 채널 키를 사용합니다.channel-key-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx 6paymentIdstring필수 (결제)가맹점에서 생성하는 고유 주문번호. merchant_uid와 동일한 역할.order_id_${new Date().getTime()} 6identityVerificationIdstring필수 (본인인증)가맹점에서 생성하는 고유 본인인증 ID.verification_id_${new Date().getTime()} 6pgstring선택사용할 PG사 코드. channelKey 사용이 권장되나 하위 호환성을 위해 지원됩니다.kcp.INIBillTst (KCP 테스트) 8pay_methodstring필수 (결제)결제 수단. card, trans, vbank 등.card 8namestring필수 (결제)결제할 상품명.포트원 통합결제 8amountnumber필수 (결제)결제할 총 금액.1000 8buyer_namestring선택구매자 이름.홍길동 8buyer_telstring선택구매자 연락처.010-1234-5678 8buyer_emailstring선택구매자 이메일.test@portone.io 8app_schemestring필수 (모바일)외부 앱(카드사/뱅킹앱)에서 인증 후 복귀할 때 사용할 앱의 URL 스킴.myapp 7redirectUrlstring필수 (모바일)결제/인증 완료 후 리다이렉트될 URL. m_redirect_url과 동일한 역할.https://your-app.com/payment/result 6app_scheme과 redirectUrl은 모바일 환경, 특히 웹뷰를 통한 하이브리드 앱 연동에서 사용자 경험을 완성하는 데 결정적인 역할을 합니다. 사용자가 KCP 결제를 위해 카드사 앱으로 이동했다가 인증을 완료했을 때, 이 app_scheme 값을 통해 원래의 앱으로 정확히 돌아올 수 있습니다.7 만약 이 값이 누락되거나 잘못 설정되면, 사용자는 외부 앱에 머무르게 되어 결제 흐름이 중단되고 이탈로 이어지게 됩니다. 이는 단순한 파라미터가 아니라, 하이브리드 앱의 결제 루프를 완성하는 핵심 메커니즘입니다.B. 응답 처리 (onResult 콜백)결제 또는 본인인증 과정이 완료되면 <PortOne /> 컴포넌트는 onResult 콜백 함수를 호출하며, 결과 객체를 인자로 전달합니다. 이 객체의 구조는 성공 여부에 따라 달라지므로, 견고한 분기 처리가 필수적입니다.표 2: onResult 콜백 응답 객체 구조구분필드타입설명성공 시successbooleantrue 값을 가집니다. (또는 code 필드가 없음)paymentIdstring포트원에서 생성한 고유 거래 ID. imp_uid와 동일.merchant_uidstring가맹점에서 전달한 고유 주문번호....anyPG사에서 전달하는 추가적인 데이터.실패 시successbooleanfalse 값을 가집니다. (또는 code 필드가 존재)codestring포트원 또는 PG사의 에러 코드.messagestring사람이 읽을 수 있는 형태의 에러 메시지.개발자는 onResult 콜백 함수 내에서 먼저 응답 객체의 성공 여부(response.success 또는 response.code의 존재 유무)를 확인해야 합니다. 성공 시에는 서버 검증을 위해 paymentId와 merchant_uid를 서버로 전송하고, 실패 시에는 사용자에게 message를 안내하는 등의 후속 조치를 취해야 합니다.IV. 네이티브-웹 간극 메우기: 앱투앱(App-to-App) 탐색 마스터하기한국의 모바일 결제 환경은 사용자가 서비스 앱을 잠시 벗어나 카드사나 은행 앱에서 인증을 수행하고 다시 돌아오는 '앱투앱' 방식이 일반적입니다. React Native Expo 앱에서 이 흐름을 원활하게 구현하려면, 운영체제(OS) 수준에서 앱 간 통신을 허용하도록 명시적인 설정을 해주어야 합니다.A. 설정이 필요한 이유: 네이티브 앱 통신 이해하기iOS: iOS는 보안상의 이유로 앱이 다른 앱의 존재를 임의로 확인하는 것을 제한합니다. 특정 앱을 호출(URL Scheme을 통해)하려면, Info.plist 파일의 LSApplicationQueriesSchemes 키에 해당 앱의 스킴을 미리 등록해야 합니다. 이 '화이트리스트'에 등록되지 않은 스킴은 canOpenURL 함수로 확인할 수조차 없어, 결제 앱 호출 자체가 실패하게 됩니다.9Android: Android 11 (API 레벨 30) 이상을 타겟하는 앱부터는 '패키지 공개 상태(Package Visibility)' 제한이 적용됩니다.12 이는 개인정보 보호를 강화하기 위한 조치로, 기본적으로 다른 앱의 목록을 볼 수 없습니다. 따라서 상호작용이 필요한 앱의 패키지명이나 인텐트(Intent) 정보를 AndroidManifest.xml 파일의 <queries> 요소에 명시적으로 선언해야만 해당 앱을 호출할 수 있습니다.13B. iOS 설정 (app.json)Expo Managed 워크플로우에서는 app.json 파일을 통해 Info.plist를 설정합니다. ios.infoPlist 키 내부에 LSApplicationQueriesSchemes 배열을 추가하고, 지원하고자 하는 모든 결제수단의 URL 스킴을 등록해야 합니다.포트원의 전신인 아임포트(I'mport)의 문서는 다년간 축적된 노하우를 바탕으로 한국의 주요 PG 및 카드사 스킴 목록을 상세히 제공하고 있어 매우 유용한 참고 자료가 됩니다.10 포트원 V2 SDK 역시 동일한 PG 인프라를 사용하므로 이 목록은 여전히 유효합니다.표 3: KCP 및 주요 결제수단 iOS URL SchemesScheme서비스 / PG / 카드사kakaotalk카카오페이ispmobileISP/페이북hdcardappcardansimclick현대카드 앱카드shinhan-sr-ansimclick신한카드 FANkb-acpKB국민카드 K-Motionmpocket.online.ansimclick삼성카드 앱카드lotteappcard롯데카드 앱카드nhappcardansimclickNH농협카드 앱카드kftc-bankpay계좌이체 (뱅크페이)citimobileapp씨티카드payco페이코아래는 app.json에 적용할 설정 예시입니다.JSON{
"expo": {
//...
"ios": {
//...
"infoPlist": {
"LSApplicationQueriesSchemes": [
"kftc-bankpay", "ispmobile", "itms-apps", "hdcardappcardansimclick",
"smhyundaiansimclick", "shinhan-sr-ansimclick", "smshinhanansimclick",
"kb-acp", "mpocket.online.ansimclick", "ansimclickscard",
"ansimclickipcollect", "vguardstart", "samsungpay", "scardcertiapp",
"lottesmartpay", "lotteappcard", "cloudpay", "nhappcardansimclick",
"nonghyupcardansimclick", "citispay", "citicardappkr", "citimobileapp",
"kakaotalk", "payco", "lpayapp", "wooripay", "nhallonepayansimclick"
]
}
},
//...
}
}
C. Android 설정 (app.json)Android의 <queries> 설정은 expo-build-properties 플러그인을 통해 app.json에서 관리할 수 있습니다. 이 플러그인은 prebuild 과정에서 app.json의 설정을 AndroidManifest.xml 파일로 변환해줍니다.먼저, 플러그인을 설치합니다.npx expo install expo-build-properties그 후 app.json의 plugins 배열에 다음과 같이 설정을 추가합니다. manifestQueries는 외부 앱 호출을 위한 것이고, intentFilters는 외부 앱에서 우리 앱으로 다시 돌아오기 위한 app_scheme을 처리하기 위한 설정입니다.10JSON{
"expo": {
"scheme": "myapp", // app_scheme과 동일한 값으로 설정
//...
"android": {
"package": "com.yourcompany.yourapp",
"intentFilters":
}
]
},
"plugins": [
"@portone/react-native-sdk/plugin",
[
"expo-build-properties",
{
"android": {
"manifestQueries": {
"package": [
"com.kakaobank.channel", "com.kbstar.liivbank", "com.nh.cashcardapp",
"com.hanaskcard.paycla", "com.ssg.serviceapp.android.egift",
"com.wooricard.wibee", "com.lotte.lpay", "com.samsung.android.spay",
"com.hyundaicard.appcard", "com.shinhancard.smartshinhan",
"com.kbcard.cain", "com.kftc.bankpay.android", "com.nhn.android.search",
"com.toss.finance", "com.kakao.talk"
],
"intent":
}
}
}
]
}
}
이처럼 아임포트의 상세한 설정 예시를 포트원 연동에 적용하는 것은, 두 서비스가 동일한 국내 PG 인프라 위에서 동작한다는 사실에 기반한 합리적인 추론입니다. 최신 포트원 문서에서 생략된 상세 설정들은 과거의 문서에서 그 해답을 찾을 수 있으며, 이는 성공적인 연동을 위한 중요한 전략입니다.V. 실전 구현: 엔드투엔드 코드 워크스루이론적인 배경과 설정을 마쳤으니, 이제 실제 코드를 통해 KCP 본인인증과 결제 흐름을 구현해 보겠습니다.A. KCP 본인인증 연동 예제다음은 사용자가 버튼을 누르면 KCP 본인인증을 요청하고, 결과를 처리하는 React Native 컴포넌트 예제입니다.JavaScriptimport React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import PortOne from '@portone/react-native-sdk';
import { useNavigation } from '@react-navigation/native';

export default function CertificationScreen() {
const = useState(false);
const navigation = useNavigation();

const handleCertification = () => {
setShowPortOne(true);
};

const handleResult = (response) => {
setShowPortOne(false); // 인증 창 닫기

    // 응답 객체에 code가 있으면 실패, 없으면 성공으로 간주
    if (response.code) {
      Alert.alert('본인인증 실패', `[${response.code}] ${response.message}`);
    } else {
      // 성공 시 서버로 identityVerificationId를 보내 검증 요청
      // 이 예제에서는 결과 페이지로 이동합니다.
      console.log(response); // { success: true, identityVerificationId: '...' }
      navigation.navigate('CertificationResult', { response });
    }
};

const identityVerificationData = {
storeId: 'store-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // 발급받은 상점 ID
channelKey: 'channel-key-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // KCP 본인인증용 채널 키
identityVerificationId: `verification_${new Date().getTime()}`,
app_scheme: 'myapp', // app.json에 설정한 scheme
// 필요 시 redirectUrl 설정
};

return (
<View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
<Button title="KCP 본인인증" onPress={handleCertification} />
{showPortOne && (
<PortOne
data={identityVerificationData}
onResult={handleResult}
/>
)}
</View>
);
}
B. KCP 결제 연동 예제다음은 KCP를 통해 1,000원을 결제하는 신용카드 결제 예제입니다.JavaScriptimport React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import PortOne from '@portone/react-native-sdk';
import { useNavigation } from '@react-navigation/native';

export default function PaymentScreen() {
const = useState(false);
const navigation = useNavigation();

const handlePayment = () => {
setShowPortOne(true);
};

const handleResult = (response) => {
setShowPortOne(false); // 결제 창 닫기

    if (response.code) {
      Alert.alert('결제 실패', `[${response.code}] ${response.message}`);
    } else {
      // 성공 시 서버로 paymentId(imp_uid)와 merchant_uid를 보내 검증 요청
      // 이 예제에서는 결과 페이지로 이동합니다.
      console.log(response); // { success: true, paymentId: '...', merchant_uid: '...' }
      navigation.navigate('PaymentResult', { response });
    }
};

const paymentData = {
storeId: 'store-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // 발급받은 상점 ID
channelKey: 'channel-key-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // KCP 결제용 채널 키
pg: 'kcp.INIBillTst', // 테스트용 PG 정보
pay_method: 'card',
name: '테스트 상품',
merchant_uid: `order_${new Date().getTime()}`,
amount: 1000,
buyer_name: '홍길동',
buyer_tel: '010-1234-5678',
app_scheme: 'myapp', // app.json에 설정한 scheme
};

return (
<View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
<Button title="1,000원 결제하기" onPress={handlePayment} />
{showPortOne && (
<PortOne
data={paymentData}
onResult={handleResult}
/>
)}
</View>
);
}
VI. 거래 보안 강화: 필수적인 서버 측 검증결제 시스템의 보안을 확보하기 위해 가장 중요한 원칙은 '클라이언트를 절대 신뢰하지 않는 것(Zero Trust for the Client)' 입니다. 클라이언트 앱에서 받은 onResult 성공 콜백은 단순히 '사용자가 결제 절차를 마쳤다'는 신호일 뿐, 실제 결제가 성공적으로 승인되었음을 보장하지 않습니다. 악의적인 사용자는 앱의 로직을 변조하여 결제 없이도 성공 응답을 위조할 수 있습니다.따라서 실제 주문을 완료 처리하거나 서비스를 제공하기 전, 반드시 가맹점의 백엔드 서버에서 해당 거래의 유효성을 검증하는 절차를 거쳐야 합니다.A. 서버 측 검증 워크플로우클라이언트: onResult 콜백에서 성공 응답을 받으면, 응답 객체에 포함된 paymentId(또는 imp_uid)와 merchant_uid를 가맹점 서버로 전송합니다.서버: 클라이언트로부터 paymentId를 수신합니다.서버: 가맹점의 API 시크릿 키를 사용하여 포트원 REST API에 해당 paymentId의 거래 내역을 조회하는 요청을 보냅니다.6서버: 포트원 API로부터 받은 응답 데이터를 검증합니다.가맹점 데이터베이스에 저장된 merchant_uid에 해당하는 주문 정보의 결제 금액과 포트원 API 응답의 결제 금액이 일치하는지 확인합니다.포트원 API 응답의 거래 **상태(status)**가 PAID(결제 완료) 또는 VERIFIED(인증 완료)인지 확인합니다.서버: 위의 모든 검증이 성공적으로 완료되었을 때만, 데이터베이스의 주문 상태를 '결제 완료'로 변경하고 사용자에게 상품이나 서비스를 제공합니다.B. 서버 측 검증 코드 예시 (Node.js/Express)다음은 서버에서 결제를 검증하는 로직의 의사 코드(pseudo-code)입니다.JavaScriptimport express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

// 클라이언트로부터 검증 요청을 받는 엔드포인트
app.post('/verify-payment', async (req, res) => {
try {
const { paymentId, merchant_uid } = req.body;
const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET; // 환경 변수에서 시크릿 키 로드

    // 1. 포트원 API에 거래 내역 조회
    const response = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
      headers: {
        'Authorization': `PortOne ${PORTONE_API_SECRET}`
      }
    });

    if (!response.ok) {
      throw new Error(`포트원 API 조회 실패: ${await response.text()}`);
    }

    const portoneData = await response.json();

    // 2. 가맹점 DB에서 원본 주문 정보 조회
    // 실제 구현에서는 DB 쿼리를 사용해야 합니다.
    const orderFromDb = { amount: 1000 }; // 예시: DB에서 조회한 주문 금액

    // 3. 금액 비교 및 상태 확인
    if (portoneData.amount.total === orderFromDb.amount && portoneData.status === 'PAID') {
      // 검증 성공: 주문 완료 처리 로직 수행
      console.log('결제 검증 성공');
      res.status(200).json({ status: 'success', message: '결제가 성공적으로 검증되었습니다.' });
    } else {
      // 검증 실패: 금액 불일치 또는 결제 미완료
      console.error('결제 검증 실패: 금액 또는 상태 불일치');
      // TODO: 필요한 경우 결제 취소 API 호출 등의 후속 처리
      res.status(400).json({ status: 'fail', message: '결제 검증에 실패했습니다.' });
    }
} catch (error) {
console.error(error);
res.status(500).json({ status: 'error', message: error.message });
}
});

app.listen(3000, () => console.log('Server is running on port 3000'));
VII. 결론: 최종 점검 및 문제 해결A. 개발자 최종 체크리스트프로덕션 환경에 배포하기 전, 아래 항목들을 최종적으로 점검하여 안정적인 서비스를 보장해야 합니다.[ ] 모든 의존성 패키지(@portone/react-native-sdk, react-native-webview)가 npx expo install 명령어로 설치되었는가?[ ] app.json의 plugins 배열에 @portone/react-native-sdk/plugin이 포함되어 있는가?[ ] app.json에 iOS를 위한 LSApplicationQueriesSchemes와 Android를 위한 manifestQueries(via expo-build-properties)가 충분하고 정확하게 설정되었는가?[ ] 모든 결제 및 본인인증 요청 시 data 객체에 app_scheme 파라미터가 올바르게 전달되고 있는가?[ ] onResult 콜백 함수가 성공과 실패 케이스를 모두 정상적으로 처리하는가?[ ] 모든 거래에 대해 서버 측 결제 검증 로직이 예외 없이 수행되는가?[ ] 포트원 콘솔의 테스트 모드가 프로덕션 빌드에서는 OFF로 설정되었는가? 18B. 흔히 발생하는 문제와 해결 방안문제: 결제 앱이 열리지 않거나, 열렸다가 바로 닫힙니다.원인: app.json의 네이티브 설정이 누락되었을 가능성이 높습니다.해결: IV장에서 설명한 iOS의 LSApplicationQueriesSchemes와 Android의 manifestQueries 설정을 다시 한번 확인하고, 지원하려는 PG 및 카드사 스킴이 모두 포함되었는지 점검합니다.문제: 외부 결제 앱에서 인증 후 원래 앱으로 돌아오지 않습니다.원인: 요청 data 객체에 app_scheme 파라미터가 없거나, app.json에 해당 스킴을 처리하기 위한 네이티브 설정(intent-filter 등)이 잘못되었습니다.해결: <PortOne />에 전달하는 data 객체에 app_scheme이 포함되어 있는지 확인하고, app.json의 expo.scheme 및 android.intentFilters 설정이 app_scheme 값과 일치하는지 확인합니다.문제: Invariant Violation: Native component for "RNCWebView" does not exist 에러가 발생합니다.원인: react-native-webview가 제대로 링크되지 않았거나, 패키지 설치 후 네이티브 프로젝트가 재빌드되지 않았습니다.해결: npx expo prebuild --clean 명령어를 실행하여 ios 및 android 폴더를 깨끗하게 재생성한 후 다시 빌드합니다.문제: 포트원 콘솔에서는 성공인데 앱에서는 실패로 처리됩니다.원인: onResult 콜백 로직의 문제 또는 서버 검증 단계의 오류일 수 있습니다.해결: onResult에서 받은 응답 객체 전체를 로그로 출력하여 구조를 확인합니다. 서버 측 검증 API 호출 시 paymentId가 올바르게 전달되는지, API 응답을 정확히 파싱하고 있는지 확인합니다. 포트원 개발자 콘솔의 로그를 통해 더 상세한 에러 원인을 파악할 수 있습니다.19