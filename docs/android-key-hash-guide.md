# Android 키 해시 등록 가이드

## 개요

카카오 네이티브 로그인을 Android에서 사용하려면 **앱 서명 인증서의 키 해시를 카카오 개발자 콘솔에 등록**해야 합니다.

> ⚠️ **중요**: 키 해시를 등록하지 않으면 Play Store에서 출시된 앱에서 카카오 SDK가 작동하지 않습니다!

---

## 왜 필요한가?

### 보안 검증
키 해시는 앱 서명 인증서의 지문(fingerprint)을 해시한 값으로, 카카오 서버가 **정상적인 앱인지 확인**하는 수단입니다.

### 환경별 인증서
Android 앱은 환경에 따라 다른 인증서로 서명됩니다:
- **Debug**: 개발 중 자동 생성되는 debug.keystore
- **Release**: 직접 생성한 릴리스 keystore
- **Play Store**: Google Play App Signing으로 Google이 재서명

따라서 **각 환경의 키 해시를 모두 등록**해야 합니다.

---

## 🔧 키 해시 확인 방법

### 방법 1: `getKeyHashAndroid()` 사용 (권장)

`@react-native-kakao/core`에서 제공하는 함수로 **현재 실행 중인 앱의 키 해시**를 바로 확인할 수 있습니다.

#### 1단계: 임시 코드 추가

`app/_layout.tsx` 파일에 다음 코드를 추가하세요:

```typescript
import { getKeyHashAndroid } from '@react-native-kakao/core';
import { Platform, Alert } from 'react-native';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      getKeyHashAndroid().then(keyHash => {
        console.log('🔑 Android Key Hash:', keyHash);
        Alert.alert('Android Key Hash', keyHash, [
          {
            text: '복사',
            onPress: () => {
              // Clipboard.setString(keyHash); // expo-clipboard 사용 시
              console.log('Copy this:', keyHash);
            }
          },
          { text: '닫기' }
        ]);
      });
    }
  }, []);

  // ... 나머지 코드
}
```

#### 2단계: 각 환경에서 실행

| 환경 | 실행 방법 | 키 해시 확인 |
|------|----------|-------------|
| **Debug** | `npm run android` | Alert 또는 콘솔에서 확인 |
| **Release** | `npx expo run:android --variant release` | Alert 또는 콘솔에서 확인 |

#### 3단계: 키 해시 복사 및 저장

- Alert에 표시된 키 해시를 복사하거나
- Android Studio Logcat에서 `Android Key Hash` 로그 검색

예시 출력:
```
🔑 Android Key Hash: Xo8WBi6jzSxKDVR4drqm84yr9iU=
```

---

### 방법 2: 수동 생성 (대안)

터미널 명령어로 직접 키 해시를 생성할 수도 있습니다.

#### Debug 키 해시 생성

```bash
keytool -exportcert -alias androiddebugkey \
  -keystore ~/.android/debug.keystore \
  -storepass android -keypass android \
  | openssl sha1 -binary \
  | openssl base64
```

#### Release 키 해시 생성

```bash
keytool -exportcert -alias YOUR_KEY_ALIAS \
  -keystore /path/to/your/release.keystore \
  | openssl sha1 -binary \
  | openssl base64
```

> ⚠️ **주의**: Release keystore의 경로와 alias는 프로젝트마다 다릅니다!

---

## 🌐 Play Store 키 해시 확인

Google Play App Signing을 사용하는 경우, Google이 앱을 재서명하므로 **Google Play Console에서 키 해시를 확인**해야 합니다.

### 1단계: Google Play Console 접속

1. [Google Play Console](https://play.google.com/console/) 접속
2. 앱 선택
3. **출시** > **앱 무결성** 메뉴 이동
4. **앱 서명** 탭 선택

### 2단계: SHA-1 인증서 지문 확인

"App signing key certificate" 섹션에서 **SHA-1 인증서 지문**을 찾습니다.

예시:
```
SHA-1: AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12
```

### 3단계: SHA-1을 키 해시로 변환

터미널에서 다음 명령어를 실행하세요:

```bash
echo "AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12" \
  | sed 's/://g' \
  | xxd -r -p \
  | openssl base64
```

> 💡 **Tip**: 콜론(`:`)을 제거한 SHA-1 값을 Base64로 인코딩한 것이 키 해시입니다.

---

## 📝 카카오 개발자 콘솔에 등록

### 1단계: 카카오 개발자 콘솔 접속

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 로그인 후 **내 애플리케이션** 선택
3. 해당 앱 클릭

### 2단계: Android 플랫폼 설정

1. 좌측 메뉴에서 **플랫폼** 선택
2. **Android 플랫폼 등록** 또는 기존 Android 플랫폼 수정

### 3단계: 정보 입력

| 항목 | 값 | 비고 |
|------|-----|------|
| **패키지명** | `com.smartnewb.sometimes` | app.json의 `android.package` |
| **마켓 URL** | (선택) Play Store URL | 출시 후 입력 |
| **키 해시** | 각 환경의 키 해시 | 줄바꿈으로 구분하여 여러 개 입력 가능 |

#### 키 해시 입력 예시

```
Xo8WBi6jzSxKDVR4drqm84yr9iU=
KHDpWYe4wXyeLKMW/5Z9K3TI9mM=
xYzAbC123dEfGhI456jKlMnO789=
```

> 💡 **Tip**: Debug, Release, Play Store 키 해시를 모두 등록해두면 모든 환경에서 작동합니다!

---

## ✅ 검증

### 1. 앱 실행 후 카카오 로그인 테스트

각 환경에서 카카오 로그인이 정상 작동하는지 확인:

- [ ] **Debug 환경**: `npm run android` 실행 후 로그인 테스트
- [ ] **Release 환경**: Release APK 빌드 후 로그인 테스트
- [ ] **Play Store**: Internal Testing 트랙에 업로드 후 로그인 테스트

### 2. 로그 확인

키 해시가 등록되지 않았거나 잘못된 경우 다음과 같은 에러가 발생합니다:

```
[Kakao] INVALID_HASH_KEY
The provided hash key is not a valid hash key registered for this application.
```

### 3. 카카오 개발자 콘솔 확인

등록된 키 해시 목록이 올바른지 확인:
- **플랫폼** > **Android** > **키 해시** 섹션

---

## 🐛 문제 해결

### 문제 1: 키 해시가 계속 틀렸다고 나옵니다

**원인**: 환경별로 다른 인증서를 사용하고 있음

**해결**:
1. 현재 실행 중인 환경의 키 해시를 `getKeyHashAndroid()`로 확인
2. 카카오 개발자 콘솔에 해당 키 해시가 등록되어 있는지 확인
3. 없다면 추가 등록

### 문제 2: Play Store에서만 로그인이 안 됩니다

**원인**: Google Play App Signing의 키 해시가 등록되지 않음

**해결**:
1. Google Play Console에서 SHA-1 인증서 지문 확인
2. SHA-1을 키 해시로 변환
3. 카카오 개발자 콘솔에 추가 등록

### 문제 3: `getKeyHashAndroid()`가 작동하지 않습니다

**원인**: Android 전용 함수를 iOS/Web에서 실행

**해결**:
```typescript
if (Platform.OS === 'android') {
  // Android에서만 실행
  getKeyHashAndroid().then(keyHash => {
    console.log(keyHash);
  });
}
```

---

## 📚 참고 자료

### 공식 문서
- [Kakao Developers - Android 시작하기](https://developers.kakao.com/docs/latest/en/android/getting-started)
- [@react-native-kakao - Android Setup](https://rnkakao.dev/en/docs/install-android)
- [@react-native-kakao - Expo Setup](https://rnkakao.mjstudio.net/en/docs/install-expo)

### 관련 문서 (프로젝트 내)
- `docs/kakao-native-login-implementation.md`: 카카오 네이티브 로그인 구현 가이드
- `app.json`: Expo 설정 (카카오 플러그인 설정 포함)

---

## 📋 체크리스트

배포 전 반드시 확인하세요:

- [ ] Debug 키 해시 등록 완료
- [ ] Release 키 해시 등록 완료
- [ ] Play Store 키 해시 등록 완료 (출시 시)
- [ ] 각 환경에서 카카오 로그인 테스트 완료
- [ ] 카카오 개발자 콘솔에서 등록된 키 해시 목록 확인
- [ ] 임시 테스트 코드 제거 (`getKeyHashAndroid()` Alert 코드)

---

## 🚀 다음 단계

키 해시 등록이 완료되었다면:

1. **테스트**: 각 환경에서 카카오 로그인이 정상 작동하는지 확인
2. **코드 정리**: `getKeyHashAndroid()` 호출 코드 제거
3. **배포**: Internal Testing → Closed Testing → Production 순차 배포
4. **모니터링**: 로그인 성공률 및 에러 추적

---

## 📞 도움이 필요하신가요?

- **카카오 개발자 포럼**: https://devtalk.kakao.com/
- **@react-native-kakao GitHub**: https://github.com/mym0404/react-native-kakao
- **Expo 포럼**: https://forums.expo.dev/
