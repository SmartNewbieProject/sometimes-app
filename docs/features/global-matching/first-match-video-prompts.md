# 글로벌 첫 매칭 - 배경 영상 기획 & VLM 프롬프트

## 컨셉 개요

**목적**: GlobalFirstMatch 카드 배경에 한일 커플의 만남~추억 장면 영상을 깔고, 반투명 다크 그라데이션 오버레이로 텍스트 가독성 확보.

**톤앤무드**: 따뜻하고 설레는 분위기. 골든아워 자연광 → 봄 파스텔 → 야간 등불 보케. 시네마틱하지만 자연스러운 일상 속 로맨스.

**영상 포맷**: 세로 9:16 (모바일 카드), 10초, 3개 장면 전환 (크로스 디졸브)

---

## 인물 설정 (레퍼런스 기반, 전 장면 동일인물)

### 남자 (한국인, 20대 초중반)
- **얼굴**: 날카로운 턱선(V라인), 높은 코, 얇은 입술에 자연스러운 핑크빛, 큰 짙은 갈색 눈, 맑고 하얀 피부
- **헤어**: 다크브라운~블랙 미디엄 길이, 이마를 살짝 덮는 앞머리, 자연스럽게 내린 스타일
- **체형**: 175cm 전후, 슬림하고 마른 체형, 좁은 어깨
- **인상**: 차분하면서도 부드러운 눈빛, 웃으면 소년 같은 순수한 미소
- **의상**: 장면별 변화 (아이보리 니트+비니 → 라이트블루 셔츠 → 네이비 리넨셔츠)

### 여자 (한국인, 20대 초반)
- **얼굴**: 부드러운 둥근 얼굴형, 크고 동그란 짙은 갈색 눈, 자연스러운 쌍꺼풀, 작은 코, 도톰한 입술, 맑고 하얀 피부
- **헤어**: 다크브라운~블랙 미디엄 길이 (어깨 살짝 넘김), 가벼운 앞머리/시스루뱅, 살짝 헝클어진 자연스러운 질감
- **체형**: 160cm 전후, 마르고 작은 체형
- **인상**: 꾸미지 않은 자연스러운 화장 (생얼에 가까움), 수줍지만 순수한 미소, 청순하고 귀여운 분위기
- **의상**: 장면별 변화 (크림 니트+롱스커트 → 플로럴 원피스+데님자켓 → 라벤더 유카타+꽃 헤어핀)

---

## 장면 구성 (10초 = 3씬 크로스디졸브)

| 구간 | 씬 | 시간 | 핵심 액션 |
|------|-----|------|----------|
| 0~3.5s | 카페 반가운 재회 | 3.5초 | 마주보고 앉아 환하게 웃으며 반가워함 |
| 3~7s | 벚꽃길 산책 | 3.5초 (0.5s 디졸브) | 나란히 걸으며 꽃잎 잡기 |
| 6.5~10s | 축제의 밤 | 3.5초 (0.5s 디졸브) | 솜사탕, 등불 아래 웃음 |

**전환**: 각 씬 경계에서 0.5초 크로스 디졸브로 자연스럽게 연결. 끝→처음도 디졸브로 루프.

---

## VLM 프롬프트 (확정 - 3씬 통합)

### Final Prompt: 카페 → 벚꽃 → 축제 (10s Combined)

```
A cinematic vertical video (9:16 aspect ratio, 10 seconds total) following the same young
Korean couple across three seamlessly cross-dissolving scenes that tell a love story.

CONSISTENT CHARACTERS THROUGHOUT ALL SCENES (must maintain identical faces):
- Him: Young Korean man, early-to-mid 20s. Sharp V-shaped jawline, high nose bridge, thin
  lips with natural pink tint, large deep brown eyes with double eyelids, very pale fair
  skin. Dark brown-to-black medium-length hair with soft bangs falling over his forehead.
  Slim and lean build, narrow shoulders, 175cm. Calm gentle gaze that turns into a boyish
  pure smile when he laughs. Clean-shaven, youthful.
- Her: Young Korean woman, early 20s. Soft round face shape, large round dark brown eyes
  with subtle double eyelids, small nose, full slightly pouty lips, very fair pale skin.
  Dark brown-to-black medium-length hair just past shoulders with wispy see-through bangs
  (sisubang), slightly tousled natural texture. Petite and slim, 160cm. Barely any makeup
  (bare-face look), shy innocent smile, pure and cute aura. Looks naturally pretty without
  trying.

SCENE 1 — CAFE REUNION (0:00–3:30):
Interior of a warm, sunlit cafe with wooden furniture and soft ambient lighting. They sit
facing each other across a small round table by a large window. Golden afternoon sunlight
streams through the window, casting warm light on their faces with soft lens flares. He
wears an ivory cable-knit sweater with a grey beanie, she wears a cream knit top with a
long flowing skirt. Two lattes and a small cake sit on the table between them. They are
mid-conversation — she says something and breaks into a bright, happy laugh covering her
mouth slightly with her hand. He watches her with warm adoring eyes, then laughs along
with his boyish grin, leaning slightly forward. The mood is joyful, like two people
genuinely thrilled to see each other again. Medium two-shot from the side at table level,
slow gentle dolly around them. Warm golden amber color grading, shallow depth of field
with soft cafe interior bokeh.

CROSS-DISSOLVE TRANSITION (0.5s overlap)

SCENE 2 — CHERRY BLOSSOM WALK (3:00–7:00):
Exterior, a cherry blossom-lined riverside path in full spring bloom. Bright but soft
natural daylight, slightly overcast for even flattering illumination. He now wears a light
blue oxford shirt with sleeves casually rolled up and khaki chinos. She wears a floral
midi dress with a light denim jacket. They walk side by side, shoulders almost touching,
pink sakura petals drifting in slow motion all around them. She reaches up playfully with
both hands to catch a falling petal, turning to him with an excited smile. He watches her
with an adoring gentle gaze and soft laugh. Shot starts from behind at a low angle showing
their silhouettes against the pink canopy, then cuts to a medium frontal shot of their
smiling faces framed by falling petals. Pastel pink and soft green color palette. Dreamy
cinematic shallow depth of field. Warm, hopeful, youthful romantic atmosphere.

CROSS-DISSOLVE TRANSITION (0.5s overlap)

SCENE 3 — FESTIVAL NIGHT (6:30–10:00):
Exterior, a Japanese summer matsuri (festival) at night. He wears a casual navy linen
shirt with top button undone. She wears a modern lavender yukata with a small white flower
hairpin tucked in her hair. They walk slowly through a lantern-lit festival street, warm
orange-red paper lanterns and colorful food stall lights creating rich layered bokeh
everywhere in the background. She holds a stick of cotton candy (wataame) and takes a big
playful bite, getting a tiny fluffy bit stuck on the tip of her nose. He notices, laughs,
and gently brushes it off with his thumb while cupping her cheek softly. She scrunches her
nose and they both burst into warm laughter, faces close together. Smooth frontal tracking
shot at medium distance. Rich warm tungsten color grading with deep oranges, reds, and
purples from the lanterns. Dreamy shallow depth of field with heavy bokeh.

END — Cross-dissolve back to Scene 1 cafe warmth for seamless loop.

GLOBAL STYLE DIRECTIVES:
- Cinematic film grain, anamorphic lens quality with subtle horizontal flares
- Consistent skin tones and facial features across all three scenes (critical)
- Slow motion captured at 60fps, played back at 24fps for dreamy feel
- Each transition: soft 0.5-second cross-dissolve
- Romantic, hopeful, warm mood throughout — genuine chemistry, not posed
- Color palette progression: warm golden amber → soft pastel pink → rich warm orange-purple
- Lighting progression: afternoon sunlight → overcast daylight → warm night lanterns
- Camera always at eye level or slightly below, never looking down on subjects
- Both characters always shown with equal visual weight and screen presence
```

---

## 기획 설명

### 인물 컨셉

**남자**: 레퍼런스 사진 기반. "차가운 외모 + 따뜻한 미소" 갭 매력. V라인 턱선, 높은 코, 하얀 피부로 이목구비가 뚜렷하지만, 웃을 때 소년 같은 순수함이 나오는 타입. 비니+니트 조합으로 캐주얼하면서도 감성적인 느낌. 한국 MZ세대 이상형에 가까운 외모.

**여자**: 레퍼런스 사진 기반. "꾸안꾸(꾸민 듯 안 꾸민)" 자연미의 정석. 동그란 눈, 시스루뱅, 살짝 헝클어진 머리결이 포인트. 화장기 없는 맑은 피부에 수줍게 웃는 표정 → 순수하고 가까이하고 싶은 분위기. 과하지 않은 자연스러움이 핵심.

### 스토리라인
"반가운 재회 → 함께 걷는 시간 → 축제 속 친밀함" 3단계 감정 곡선.

1. **카페 (0~3.5초)**: 마주보고 앉아 활짝 웃는 장면. 기존 "우연히 눈 마주침"이 아닌, 이미 만나서 대화 중인 반가운 분위기. "앱으로 매칭 → 실제로 만남 → 이렇게 즐거울 수 있다"는 메시지. 골든아워 자연광, 카페 보케.

2. **벚꽃길 (3~7초)**: 함께하는 시간의 밝고 희망찬 장면. 봄 벚꽃 + 나란히 걷기. 색감이 골든 → 파스텔 핑크로 전환되며 분위기가 한층 밝아짐. 꽃잎 잡으려는 장난스러운 제스처 → 자연스러운 친밀감.

3. **축제의 밤 (6.5~10초)**: 가장 친밀하고 행복한 순간. 유카타를 입은 여자 → 한일 문화 교류를 자연스럽게 표현. 솜사탕 → 코에 묻은 걸 닦아주며 볼 살짝 감싸기 → 이미 편안한 사이의 스킨십. 등불 보케가 만드는 최고의 비주얼로 여운.

### 색감 흐름
```
카페(골든 앰버) → 벚꽃(파스텔 핑크) → 축제(따뜻한 오렌지-퍼플)
    ☀️ 오후         🌸 낮             🏮 밤
```

### 루프 포인트
축제의 따뜻한 등불 톤에서 카페의 골든 톤으로 → 색온도가 비슷해서 자연스러운 연결.

---

## UI 적용 방식

```
┌─────────────────────────────┐
│  [배경 영상 (10s 루프)]       │
│  ┌───────────────────────┐  │
│  │ LinearGradient 오버레이 │  │
│  │ rgba(0,0,0,0)          │  │  ← top: 투명
│  │         ↓              │  │
│  │ rgba(0,0,0,0.65)       │  │  ← bottom: 어둡게
│  │                       │  │
│  │   바다 건너             │  │  ← 흰색 텍스트
│  │   나와 맞는 #여행|      │  │  ← 타이핑 (흰+보라 하이라이트)
│  │   친구를 찾아보세요      │  │
│  │                       │  │
│  │  [#여행] [#음악] [#맛집] │  │  ← 글래스모피즘 칩
│  │  나의 관심사로 찾아드릴게요│  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

- 영상 위에 `LinearGradient` (top: transparent → bottom: rgba(0,0,0,0.65))
- 모든 텍스트를 `inverse` (흰색)으로 변경
- 타이핑 키워드: 흰색 bold + 보라 glow shadow
- 칩: rgba(255,255,255,0.15) 배경 + blur (글래스모피즘), 활성칩: brand.primary
- 국기/파도 이모지 + 물결 텍스트 제거 (영상이 분위기를 완전 대체)
