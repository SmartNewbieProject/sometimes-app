# 대학 로고 최적화 및 Android 빌드 수정

**작성일**: 2024-12-24
**작업자**: Development Team
**상태**: ✅ 완료

---

## 1. 문제 정의

### 증상
Android 빌드 시 Gradle 에러 발생:

```
Execution failed for task ':app:mergeReleaseResources'.
> Error: Duplicate resources
  [drawable-mdpi-v4/assets_images_univ_busan_pnu] .../assets_images_univ_busan_pnu.png
  [drawable-mdpi-v4/assets_images_univ_busan_pnu] .../assets_images_univ_busan_pnu.webp
```

### 원인
`assets/images/univ/` 폴더 내에 동일한 이미지가 `.png`와 `.webp` 두 형식으로 중복 존재.

Metro bundler가 Android drawable로 변환 시 확장자를 제거하여 리소스 이름 충돌 발생.

---

## 2. 해결 방안

### 전략
1. 로컬 assets에서 PNG 중복 파일 삭제 (WebP 유지)
2. 코드에서 `.png` → `.webp` 참조 변경
3. S3 원격 저장소에 WebP 파일 업로드

### 선택 이유
- **WebP 선택**: PNG 대비 약 60% 용량 절감
- **S3 병행 유지**: 앱 업데이트 없이 로고 추가/변경 가능

---

## 3. 변경 사항

### 3.1 로컬 Assets 정리

| 경로 | 변경 내용 |
|-----|----------|
| `assets/images/univ/**/*.png` | 55개 파일 삭제 |
| `assets/images/univ/**/*.webp` | 55개 파일 유지 |

**명령어**:
```bash
find assets/images/univ -name "*.png" -delete
```

### 3.2 코드 수정

#### `src/features/onboarding/ui/slide-like-guide.tsx`

```diff
- const pnuLogo = require('@assets/images/univ/busan/pnu.png');
- const deuLogo = require('@assets/images/univ/busan/deu.png');
+ const pnuLogo = require('@assets/images/univ/busan/pnu.webp');
+ const deuLogo = require('@assets/images/univ/busan/deu.webp');
```

#### `src/shared/libs/univ.ts`

```diff
- [UniversityName.배재대학교]: 'bju.png',
- [UniversityName.충남대학교]: 'cnu.png',
+ [UniversityName.배재대학교]: 'bju.webp',
+ [UniversityName.충남대학교]: 'cnu.webp',
  // ... 모든 대학 로고 확장자 변경 (249개)

- const DEFAULT_UNIV_LOGO = '.../univ/default.png';
+ const DEFAULT_UNIV_LOGO = '.../univ/default.webp';

- export const getSmartUnivLogoUrl = (univCode: string) => `${baseUrl}${univCode.toLowerCase()}.png`;
+ export const getSmartUnivLogoUrl = (univCode: string) => `${baseUrl}${univCode.toLowerCase()}.webp`;
```

### 3.3 S3 업로드

**버킷**: `sometimes-resources`
**경로**: `/univ/`

| 작업 | 내용 |
|-----|------|
| PNG 다운로드 | 308개 파일 (7.6 MB) |
| WebP 변환 | `cwebp -q 85` 사용 |
| WebP 업로드 | 277개 파일 (3.1 MB) |

**변환 명령어**:
```bash
# 다운로드
aws s3 sync s3://sometimes-resources/univ/ ./png/ --exclude "*" --include "*.png"

# 변환
for f in png/*.png; do
  cwebp -q 85 "$f" -o "webp/${f%.png}.webp"
done

# 업로드
aws s3 sync ./webp/ s3://sometimes-resources/univ/ --content-type "image/webp"
```

---

## 4. 결과

### 용량 절감

| 위치 | Before | After | 절감률 |
|-----|--------|-------|--------|
| 로컬 assets | 1.1 MB (PNG+WebP) | 532 KB (WebP) | -52% |
| S3 저장소 | 7.6 MB (PNG) | 3.1 MB (WebP) | -59% |

### 빌드 상태

| 플랫폼 | 상태 |
|--------|------|
| Android | ✅ 빌드 성공 (Duplicate resources 해결) |
| iOS | ✅ 영향 없음 |
| Web | ✅ 영향 없음 |

---

## 5. 주의사항

### S3 파일 관리
- PNG 파일은 삭제하지 않고 유지 (하위 호환성)
- 신규 로고 추가 시 **WebP 형식**으로 업로드

### 코드 참조
- 로컬 assets: `require('@assets/images/univ/{region}/{code}.webp')`
- S3 URL: `getUnivLogo(UniversityName.대학명)` 또는 `getSmartUnivLogoUrl('CODE')`

### Expo WebP 지원
- `expo-image` 컴포넌트 사용 권장
- React Native `<Image>` 기본 지원 (정적 이미지)
- Android animated WebP는 Fresco 의존성 필요 (현재 정적 이미지만 사용)

---

## 6. 관련 파일

| 파일 | 역할 |
|-----|------|
| `src/shared/libs/univ.ts` | 대학 로고 URL 매핑 및 유틸 함수 |
| `src/features/signup/ui/university-logos.tsx` | 회원가입 로고 애니메이션 |
| `src/features/onboarding/ui/slide-like-guide.tsx` | 온보딩 슬라이드 |
| `assets/images/univ/` | 로컬 대학 로고 assets |

---

## 7. 참고 자료

- [Expo Image Documentation](https://docs.expo.dev/versions/latest/sdk/image/)
- [React Native Image Formats](https://reactnative.dev/docs/image)
- [cwebp Documentation](https://developers.google.com/speed/webp/docs/cwebp)
