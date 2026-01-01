# JP Identity Sample Images - 제작 가이드

## 목적
개발/테스트용 건강보험증 및 운전면허증 샘플 이미지 제작

---

## 1. 건강보험증 (健康保険証) 샘플

### 필수 요소
```
┌─────────────────────────────────────┐
│ 健康保険証                           │
│                                     │
│ 保険者番号: ████████ (8자리)         │
│ 記号: ██                            │
│ 番号: ██████                        │
│                                     │
│ 氏名: ████ ████                     │
│ 生年月日: 昭和/平成/令和 ██年██月██日  │
│ 住所: 東京都████████████             │
│                                     │
│ QRコード: [████]                    │
└─────────────────────────────────────┘
```

### Figma 템플릿 사양
- **크기**: 54mm × 85.6mm (신용카드 사이즈)
- **해상도**: 300 DPI
- **배경색**: #F0F4F8 (연한 파란색)
- **텍스트**: 일본어 폰트 (Noto Sans JP)

### 테스트 데이터
```javascript
{
  "保険者番号": "01234567",
  "記号": "AB",
  "番号": "123456",
  "氏名": "山田 太郎",
  "生年月日": "平成 5年 4月 1日",
  "住所": "東京都渋谷区████████"
}
```

---

## 2. 운전면허증 (運転免許証) 샘플

### 필수 요소
```
┌─────────────────────────────────────┐
│ [顔写真]  運転免許証                  │
│           12 - 345678 - 90          │
│                                     │
│ 氏名: 山田 太郎 (ヤマダ タロウ)       │
│ 生年月日: 平成 5.04.01              │
│ 住所: 東京都渋谷区████████████        │
│                                     │
│ 交付: 令和 6.01.15                  │
│ 有効期限: 令和 11.01.15              │
│                                     │
│ 種類: 普通, 二輪                     │
└─────────────────────────────────────┘
```

### Figma 템플릿 사양
- **크기**: 85.6mm × 54mm (가로형)
- **해상도**: 300 DPI
- **배경색**: #E8F5E9 (연한 녹색)
- **홀로그램**: 무지개 그라디언트 효과

### 테스트 데이터
```javascript
{
  "免許証番号": "12-345678-90",
  "氏名": "山田 太郎",
  "カナ": "ヤマダ タロウ",
  "生年月日": "平成 5.04.01",
  "住所": "東京都渋谷区████████",
  "交付": "令和 6.01.15",
  "有効期限": "令和 11.01.15",
  "種類": ["普通", "二輪"]
}
```

---

## 3. Figma에서 제작하기

### Step 1: Frame 생성
```
Frame 크기:
- 건강보험증: 856px × 540px (at 200% scale)
- 운전면허증: 856px × 540px (가로)
```

### Step 2: 필수 컴포넌트
1. **배경 레이어**: Auto Layout
2. **텍스트 레이어**: 일본어 폰트
3. **QR 코드**: Placeholder 사각형
4. **홀로그램 효과**: Linear gradient

### Step 3: Export 설정
```
Format: PNG
Scale: 2x
Quality: 100%
```

---

## 4. 개발용 더미 이미지 저장 위치

```
/Users/user/projects/sometimes-app/
├── docs/
│   └── test-images/
│       ├── health-insurance-sample.png     # 건강보험증 샘플
│       ├── drivers-license-sample.png      # 운전면허증 샘플
│       └── README.md                       # 사용 설명
```

---

## 5. 주의사항 ⚠️

### 개인정보 보호
- ❌ 실제 개인정보 사용 금지
- ✅ 더미 데이터만 사용
- ✅ "サンプル" (샘플) 워터마크 추가

### 법적 문제 방지
- 실제 서류로 오인되지 않도록 "TEST ONLY" 표시
- 공개 저장소에 커밋 시 주의

### Git 관리
```bash
# .gitignore에 추가 (실제 이미지는 커밋 X)
docs/test-images/*.png
!docs/test-images/README.md
```

---

## 6. 온라인 리소스

### 무료 샘플 이미지
1. **Unsplash + 편집**
   - 신분증 목업 검색: "ID card template"

2. **Canva**
   - 템플릿 검색: "Japanese ID card"
   - https://www.canva.com/

3. **Figma Community**
   - 검색: "ID card mockup Japan"
   - https://www.figma.com/community

---

## 7. API 테스트용 Base64 생성

### 이미지 → Base64 변환
```bash
# macOS/Linux
base64 -i health-insurance-sample.png -o health-insurance.txt

# 또는 온라인 도구
https://www.base64-image.de/
```

### 테스트 코드에서 사용
```typescript
// src/features/jp-identity/__tests__/fixtures.ts
export const SAMPLE_HEALTH_INSURANCE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAoAAAAHgCAYAAAA...';

export const SAMPLE_DRIVERS_LICENSE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAoAAAAHgCAYAAAA...';
```

---

## 8. 실전 테스트 시나리오

### 성공 케이스
- ✅ 선명한 이미지
- ✅ 모든 텍스트 읽기 가능
- ✅ 적절한 조명

### 실패 케이스 (테스트용)
- 🔴 흐린 이미지 (Gaussian blur)
- 🔴 반사광 (Lens flare overlay)
- 🔴 일부 가려진 이미지 (검은 사각형)

---

## 참고 링크

- [日本政府 個人情報保護委員会](https://www.ppc.go.jp/)
- [マイナンバーカード総合サイト](https://www.kojinbango-card.go.jp/)
- [Figma Japan Community](https://www.figma.com/community/japan)
