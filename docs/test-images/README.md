# Test Images for JP Identity Verification

## ⚠️ 개발/테스트 전용

이 디렉터리는 **개발 및 테스트 목적으로만** 사용됩니다.

---

## 📁 파일 목록

```
docs/test-images/
├── health-insurance-sample.png      # 건강보험증 샘플
├── health-insurance-blurry.png      # 흐린 이미지 (실패 테스트용)
├── health-insurance-glare.png       # 반사광 (실패 테스트용)
├── drivers-license-sample.png       # 운전면허증 샘플
├── drivers-license-partial.png      # 일부 가려진 이미지
└── README.md                        # 이 파일
```

---

## 🎨 이미지 제작 방법

### 1. Figma 템플릿 사용
- [Figma Community: ID Card Mockup](https://www.figma.com/community)
- 검색어: "Japanese ID card template"

### 2. Canva 사용
- https://www.canva.com/
- 템플릿: "Identity Card"
- 사이즈: 85.6mm × 54mm

### 3. 직접 제작
상위 디렉터리의 `jp-identity-sample-creation-guide.md` 참고

---

## 🔒 개인정보 보호 규칙

### ✅ 허용
- 완전히 가짜인 더미 데이터
- "サンプル" 워터마크가 있는 이미지
- "TEST ONLY" 표시가 있는 이미지

### ❌ 금지
- 실제 개인정보 사용
- 실제 신분증 스캔/촬영
- 타인의 개인정보 무단 사용

---

## 📝 테스트 데이터

### 건강보험증
```
保険者番号: 01234567
記号: AB
番号: 123456
氏名: 山田 太郎
生年月日: 平成 5年 4月 1日
```

### 운転면許証
```
免許証番号: 12-345678-90
氏名: 山田 太郎
生年月日: 平成 5.04.01
有効期限: 令和 11.01.15
```

---

## 🧪 사용 예시

### 1. E2E 테스트
```typescript
// tests/e2e/jp-identity.spec.ts
import { test, expect } from '@playwright/test';

test('본인 인증 - 건강보험증 업로드', async ({ page }) => {
  await page.goto('/jp-identity');

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('docs/test-images/health-insurance-sample.png');

  await expect(page.locator('.validation-success')).toBeVisible();
});
```

### 2. Unit 테스트
```typescript
// src/features/jp-identity/__tests__/validate.test.ts
import fs from 'fs';
import path from 'path';

const sampleImage = fs.readFileSync(
  path.join(__dirname, '../../../docs/test-images/health-insurance-sample.png')
);
const base64 = sampleImage.toString('base64');

test('이미지 검증 - 성공', async () => {
  const result = await validateIdentityImage({
    documentType: 'HEALTH_INSURANCE',
    imageBase64: base64,
  });

  expect(result.valid).toBe(true);
});
```

---

## 🌐 온라인 리소스

### 이미지 생성 도구
- [Canva](https://www.canva.com/) - 무료 ID 카드 템플릿
- [Figma](https://www.figma.com/) - 전문 디자인 툴
- [Photopea](https://www.photopea.com/) - 온라인 Photoshop

### Base64 변환
- [Base64 Image Encoder](https://www.base64-image.de/)
- [Online Base64 Tools](https://base64.guru/converter/encode/image)

### QR 코드 생성
- [QR Code Generator](https://www.qr-code-generator.com/)
- Dummy QR for testing

---

## 🚀 빠른 시작

### 1. 샘플 이미지 다운로드
```bash
# Unsplash에서 신분증 목업 다운로드
curl -o health-insurance-sample.png \
  "https://images.unsplash.com/photo-sample-id-card"
```

### 2. Figma에서 제작
1. Figma 커뮤니티에서 "ID card" 템플릿 검색
2. 일본어 텍스트로 수정
3. PNG로 export (2x)
4. 이 디렉터리에 저장

### 3. Git에서 제외
```bash
# .gitignore 확인
echo "docs/test-images/*.png" >> .gitignore
```

---

## 📊 이미지 품질 가이드

### 성공 케이스 (valid: true)
- 해상도: 1200 × 800 이상
- 포맷: PNG 또는 JPEG
- 파일 크기: 500KB ~ 2MB
- 선명도: Sharp, no blur
- 조명: Evenly lit

### 실패 케이스 (valid: false)
- 해상도: 600 × 400 이하
- 흐림: Gaussian blur 적용
- 반사광: 과도한 하이라이트
- 일부 가려짐: 텍스트 영역 차단

---

## ⚖️ 법적 고지

이 디렉터리의 모든 이미지는:
- 개발/테스트 목적으로만 사용됩니다
- 실제 개인정보를 포함하지 않습니다
- 공식 서류로 사용할 수 없습니다
- "SAMPLE" 또는 "TEST ONLY" 워터마크를 포함해야 합니다
