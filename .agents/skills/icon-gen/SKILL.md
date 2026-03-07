---
name: icon-gen
description: AI 아이콘 생성 파이프라인. Gemini API로 3D 이미지 생성 → 배경 제거 → 저장.
  트리거 - "아이콘 생성", "icon-gen", "SVG 아이콘", "아이콘 만들어줘", "아이콘 제작"
---

# Icon Gen - AI 아이콘 생성 스킬

Gemini API로 Sometimes 앱 브랜드에 맞는 3D 렌더 스타일 아이콘 이미지를 생성하고,
rembg로 배경을 제거한 뒤 최종 PNG로 저장합니다.

## 브랜드 스타일 (핵심)

기존 앱 에셋 분석 결과 기반:
- **질감**: 도자기/마시멜로 느낌의 부드러운 3D 렌더 (NOT rough clay)
- **주 색상**: **화이트 + 매우 연한 라벤더** (#F0ECF5 ~ #E8E0F0), 진한 보라 금지
- **채도**: 극도로 낮음, 거의 무채색에 가까운 파스텔
- **하이라이트**: 흰색 글로시 광택, 좌상단 부드러운 조명
- **그림자**: 거의 안 보이는 수준의 연한 라벤더-그레이
- **의미 기반 색상**: fire=오렌지, gift=다채색, star=골드 등 자연스러운 색상 허용
- **참고 에셋**: heart-balloon.png, heart-arrow.png, drink.png, gem-icon.webp

## 사용법

```
/icon-gen <아이콘이름> --desc "<설명>"
/icon-gen <이름1>, <이름2>, <이름3> --desc "<설명>"
```

### 파라미터

| 파라미터 | 기본값 | 설명 |
|---------|--------|------|
| `--desc` | (필수) | 아이콘 설명 (영문 권장) |
| `--output` | `assets/images/icons/` | 저장 경로 |
| `--no-bg-remove` | false | 배경 제거 건너뛰기 |
| `--no-ref` | false | 레퍼런스 이미지 없이 텍스트만으로 생성 |

## 워크플로우

### STEP 1: 입력 파싱

사용자 입력에서 추출:
- **아이콘 이름**: kebab-case 파일명
- **설명**: 아이콘의 시각적 설명 (영문 권장)

배치 모드: 쉼표 구분 다중 아이콘 지원.

### STEP 2: Gemini API로 이미지 생성 + 배경 제거

```bash
export GEMINI_API_KEY="$GEMINI_API_KEY"
python3 tools/icon-gen/generate-image.py \
  --name "ICON_NAME" \
  --desc "ICON_DESC" \
  --output /tmp/icon-ICON_NAME.png
```

`generate-image.py`가 자동으로:
1. 고정 레퍼런스 이미지 2장(heart-arrow, drink)을 base64로 인코딩
2. `image-prompt-template.txt` 변수 치환 + 레퍼런스 스타일 매칭 지시
3. Gemini API multimodal 호출 (레퍼런스 이미지 + 텍스트 프롬프트)
4. 모델: `gemini-2.0-flash-exp-image-generation` (실패 시 자동 폴백)
5. 생성된 이미지에 `rembg`로 배경 제거
6. 최종 PNG 저장

스타일 일관성을 위해 기존 앱 에셋을 레퍼런스로 전달하여, 질감/조명/색감이 자동으로 맞춰짐.
`--no-ref` 플래그로 레퍼런스 없이 생성 가능.

실패 시 최대 2회 재시도 + 폴백 모델 순회.

### STEP 3: Codex 확인 + 사용자 리뷰

1. Codex가 Read 도구로 생성된 이미지를 확인
2. 사용자에게 이미지를 보여줌
3. 만족 → STEP 4, 불만족 → 설명 수정 후 STEP 2 재실행

### STEP 4: 최종 저장 + 보고

1. 최종 이미지를 `assets/images/icons/{icon_name}.png`에 저장
   (Bash `cp` 명령 사용)
2. 결과 보고:

```
## 아이콘 생성 완료

| 항목 | 값 |
|------|---|
| 파일 | `assets/images/icons/{name}.png` |
| 크기 | {size}KB |
| 배경 제거 | Yes/No |
| 모델 | {model} |
```

## 배치 모드

```
/icon-gen bell, star, home --desc "네비게이션 아이콘 세트"
```

각 아이콘마다 STEP 2~4 순차 실행. 결과 테이블로 통합 보고.

## 의존성

- `GEMINI_API_KEY` 환경변수 필수
- `rembg` CLI: `pipx install rembg[cli] && pipx inject rembg onnxruntime`
- Python 3.10+ (stdlib만 사용, 외부 패키지 불필요)

## 파일 구조

```
tools/icon-gen/
├── generate-image.py         # Gemini API 이미지 생성 + rembg 배경 제거
├── image-prompt-template.txt # 이미지 생성 프롬프트 (브랜드 스타일 반영)
├── brand-config.json         # 브랜드 스타일 규칙 + 색상 가이드
├── normalize.py              # SVG 정규화 (선택적, SVG 필요 시)
├── quality-check.py          # SVG 품질 검사 (선택적, SVG 필요 시)
└── prompt-template.txt       # SVG 생성 프롬프트 (선택적, Gemini CLI용)
```
