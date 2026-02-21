# 썸타임 도메인별 신규 기능 기획서

> 원본: domain-feature-proposals.pdf
> 변환일: 2026-02-13

---

**작성일: 2026-02-10**
**기반: 코드베이스 분석 (70+ 모듈, 110+ 테이블) + 기술이전 로드맵 전략서**
**원칙: 기존 기술 자산 활용 극대화, 사용자 체감 가치 중심**

## 1. 매칭 도메인 (Matching)

> 기존 자산: 8단계 벡터 파이프라인, Qdrant 3072d 임베딩, 양방향 스코어링, 13개 필터, 4가지 매칭 타입

### 1-1. Serendipity Mode (우연의 발견)

**핵심 가치: "내 타입 밖의 좋은 사람을 만나게 해줌"**

- 벡터 공간에서 의도적으로 필터를 완화하여, 평소 매칭되지 않을 상대를 추천
- 기존 FindCandidatesStep 의 Qdrant 검색에서 코사인 유사도 임계값을 낮추고, BidirectionalFilterStep 의필터 일부를 선택적 비활성화 주 1회 "탐험 매칭" 슬롯 제공 → 일반 매칭과 별도로 1명 추가 추천 탐험 매칭 수락/거절/대화 지속률을 별도 추적하여 필터버블 탈출 효과 측정

> **활용: weighted-scoring , profile-similar-finder.service.ts , matching-config.service.ts**
> **KPI: 새로운 유형 대화 시작률, 리텐션 변화율**

#### 심리학적 근거

- **필터버블 탈출:** Comunello et al.(2020)은 데이팅 앱 알고리즘이 "관계적 필터버블"을 형성하여 유사한 사람만반복 추천하는 피드백 루프를 만든다고 지적 (The Communication Review, Vol 23)
- **세렌디피티 심리학:** Ross(2024)는 세렌디피티가 수동적 운이 아닌 "준비된 마음의 능동적 연결"이라고 정의. 의도적 탐색이 우연한 발견을 촉진 (Perspectives on Psychological Science, SAGE)
- **탐색 vs 활용 트레이드오프:** 심리학적으로 초기 데이팅 단계에서는 탐색(exploration)이 더 나은 파트너 발견 확률을 높임 (Psychology Today - Dating Exploration)

### 1-2. Real-meet Score (현실 만남 점수)

**핵심 가치: "실제로 만날 수 있는 사람만 매칭"**

- matching-time-patterns , region-cluster 데이터를 활용하여 생활권 겹침 점수 산출 매칭 파이프라인의 WeightedPartnersStep 에 Real-meet 가중치 추가 대학 시간표 기반 빈 시간대 겹침 계산 (선택적 입력)
- "이 사람과 만나기 좋은 시간/장소" 제안 카드 자동 생성 헛매칭(매칭 후 한 번도 안 만남) 데이터를 피드백 루프로 모델 개선

> **활용: region-cluster.service.ts , matching-time-patterns 스키마**
> **KPI: 첫 만남 성사율, 헛매칭 비율 감소**

#### 심리학적 근거

- **근접성 원리 (Propinquity Effect):** Festinger, Schachter & Back(1950)의 MIT Westgate 연구에서 물리적 근접성이 우정/연애 형성의 핵심 요인임을 실증. 5문 이내 거주자 간 우정 형성률 65% (Wikipedia -
- Propinquity)
- **단순 노출 효과와의 연결:** 근접성은 반복 노출을 증가시키고, Zajonc(1968)의 단순 노출 효과에 의해 호감이 상승하는 메커니즘 (Penn State ASP)
- **현실적 만남 가능성:** 물리적 거리가 가까울수록 관계 유지 비용이 낮아져 장기적 관계 성공률 상승 (PsychologyTown - Propinquity)

### 1-3. 매칭 리플레이 (Match Replay)

**핵심 가치: "지나간 인연을 다시 잡을 기회"**

- 과거 매칭에서 양쪽 모두 좋아요를 보냈지만 대화가 끊긴 매치를 주기적으로 리서피스
- matching-histories , match_likes , chat_messages 의 마지막 메시지 시간을 분석
- 30일 이상 대화 없는 상호 좋아요 매치에 "다시 인사하기" 카드 제공 구슬 소모 없이 1회 무료 재연결, 이후는 소량 구슬 사용 매칭 히스토리의 재활용으로 매칭 풀 부족 문제도 완화

> **활용: matching-retention.service.ts , history.service.ts**
> **KPI: 재연결 성공률, 유휴 매칭 재활성화율**

#### 심리학적 근거

- **단순 노출 효과 (Mere Exposure Effect):** Zajonc(1968)의 연구에서 반복 노출된 자극에 대한 호감이 증가함을실증. Bornstein(1989) 메타분석(208개 연구)에서 효과 크기 r=0.26으로 견고함 확인 (Zajonc 원문, ISR
- UMich)
- **친숙성과 호감:** 처음 10~20회 노출에서 효과가 가장 크며, 이전에 상호작용한 매치를 다시 보여주는 것은 친숙성 기반 호감을 재활성화 (Simply Psychology)
- **대면 상호작용에서의 검증:** Reis et al.(2011)이 실제 대면 상호작용에서도 친숙성이 매력을 촉진함을 실증 (Rochester Univ PDF)

### 1-4. 궁합 프리뷰 (Chemistry Preview)

**핵심 가치: "좋아요 보내기 전에 궁합을 미리 본다"**

- 매칭 카드에서 좋아요 전 3가지 궁합 지표 미리보기 제공 모먼트 답변 기반 가치관 일치도, Big5 성격 보완도, 관심사 겹침률
- 기존 emotional-profiling 의 Big5 + interest-matching 의 벡터 유사도 활용 전체 궁합 리포트는 매칭 성사 후 열람 가능 (프리미엄 기능)
- 궁합 프리뷰 본 후 좋아요 전환율 vs 안 본 그룹 A/B 테스트

> **활용: big5-calculator.service.ts , match-reasons/ , interest-matching.service.ts**
> **KPI: 좋아요 전환율, 매칭 수락률, 조기 언매치 감소**

#### 심리학적 근거

- **불확실성 감소 이론 (Uncertainty Reduction Theory):** Berger & Calabrese(1975)에 따르면 낯선 사람과의 첫 상호작용에서 불확실성을 줄이려는 동기가 핵심. 사전 정보 제공이 불확실성을 감소시켜 상호작용 의지를 높임(Wikipedia - URT)
- **인지적 불확실성 vs 행동적 불확실성:** URT는 상대에 대한 인지적 불확실성(무슨 생각?)과 행동적 불확실성(어떻게행동할까?)을 구분하며, 궁합 프리뷰는 인지적 불확실성을 사전에 감소 (Communication Studies)
- **정보 추구 전략:** Berger가 제시한 능동적 정보 수집(active strategy)에 해당하며, 사전 정보가 많을수록 호감(liking)이 증가하는 URT 공리 검증 (EBSCO Research Starters)

### 1-5. 시간 제한 매칭 (Time-bound Match)

**핵심 가치: "72시간 안에 약속을 잡아야 한다는 긴장감"**

- 매칭 성사 후 72시간 카운트다운 시작 → 만남 약속 미제안 시 매치 휴면 처리 만남 제안 기능: 날짜/시간/장소 3개 옵션 중 선택 → 상대 수락 약속 확정 시 카운트다운 해제 + 보너스 구슬 지급 휴면 매치는 구슬로 재활성화 가능
- matching-retention.service.ts 의 리텐션 로직과 연동, matching-alert.service.ts 로 알림

> **활용: matching-alert-cron.service.ts , push-notification/**
> **KPI: 약속 성사율, 평균 약속까지 소요 시간, 대화만 하고 안 만나는 비율 감소**

#### 심리학적 근거

- **희소성 원리 (Scarcity Principle):** Cialdini(1984) Influence에서 희소한 것일수록 가치를 높게 평가한다고 실증. 시간 제한은 기회의 희소성을 만들어 행동 촉진 (Wikipedia - Scarcity)
- **손실 회피 (Loss Aversion):** Kahneman & Tversky(1979) 전망 이론에 따르면 손실의 고통이 동등한 이익의쾌감보다 약 2배 강함. 매치 소멸은 "손실"로 프레이밍되어 행동을 유도 (Wikipedia - Loss Aversion)
- **시간 압박과 의사결정:** 시간 제약은 단기적 이득을 우선시하게 만들어, "나중에 하자"는 미루기를 방지하고 즉각적행동(약속 잡기)을 촉진 (Dool Agency - Time Scarcity)

## 2. 채팅/대화 도메인 (Chat)

> 기존 자산: 실시간 채팅, GPT-4 대화 분석, 대화 품질 스코어링, AI 챗봇

### 2-1. 대화 안전 넛지 (Safety Nudge)

**핵심 가치: "보내기 전에 한 번 더 생각하게 해줌"**

- 메시지 전송 직전 GPT-4가 부적절/공격적 표현을 감지하여 넛지 제공
- "이 메시지가 상대에게 불편할 수 있어요" → 수정 유도 (차단이 아닌 넛지)
- 기존 chat-analysis.service.ts 의 LLM 분석 로직을 실시간 경량 버전으로 분리 넛지 무시 후 상대가 신고한 케이스는 TrustScore에 가중치 반영 넛지 수용률과 신고율 간의 상관관계를 데이터로 축적

> **활용: llm-analysis.service.ts , signal_reports 스키마, report/**
> **KPI: 신고 발생률 감소, 넛지 수용률, 대화 만족도**

#### 심리학적 근거

- **넛지 이론 (Nudge Theory):** Thaler & Sunstein(2008) Nudge에서 선택 설계(choice architecture)를 통해금지 없이 행동을 예측 가능하게 변경할 수 있음을 제시. 영국 Behavioural Insights Team("넛지 유닛")이 정책적용 성공 (Wikipedia - Nudge Theory)
- **자유주의적 온정주의:** 넛지는 옵션을 제거하지 않으면서(차단이 아닌 권유) 더 나은 선택을 유도. "보내기 전 한 번 더생각"은 System 2(숙고적 사고) 활성화 (The Decision Lab)
- **투명한 넛지 원칙:** Thaler는 넛지가 투명하고, 개인 복지를 향상시키며, 쉽게 거부할 수 있어야 한다고 강조. "무시"옵션 필수 (Princeton Review)

### 2-2. AI 아이스브레이커 (AI Icebreaker)

**핵심 가치: "첫 대화가 어색하지 않게"**

- 매칭 성사 직후 두 사람의 프로필 공통점 기반 대화 시작 질문 3개 자동 생성 모먼트 답변, 관심사, 학과, 지역 등을 종합하여 개인화된 오프너 제안
- "같은 질문에 같이 답하기" 모드: 동시 답변 후 서로의 답 공개 (동시 시작)
- 둘 다 3개 질문에 답하면 자유 대화 해제 → 부담 없는 대화 진입
- 기존 ai-chat.service.ts 의 LLM 기반 대화 생성 + emotional-profiling 활용

> **활용: llm-client.service.ts , user-answers 스키마, interest/**
> **KPI: 첫 메시지 전송까지 시간, 대화 시작 후 24시간 내 응답률**

#### 심리학적 근거

- **불확실성 감소 이론:** Berger & Calabrese(1975)의 URT에서 낯선 사람 간 첫 대화의 불확실성이 커뮤니케이션을저해. 구조화된 질문이 불확실성을 감소시켜 대화 진입 장벽을 낮춤 (Mastersincommunications.com)
- **상호적 자기 노출:** 동시에 답하고 공개하는 구조는 자기 노출의 상호성(reciprocal self-disclosure)을 보장하여취약성 불균형을 해소 (tutor2u - Self-disclosure)
- **공통점 기반 대화:** URT의 유사성 공리(similarity axiom)에 따르면 유사점 발견이 불확실성을 줄이고 호감을 증가시킴 (Communication Theory)

### 2-3. 대화 리듬 엔진 (Conversation Rhythm Engine)

**핵심 가치: "대화가 자연스럽게 이어지도록"**

- 대화 흐름이 멈추면(24시간 무응답) 맥락에 맞는 다음 화제 자동 제안 기존 대화 내용을 GPT-4로 분석하여 자연스러운 다음 질문/화제 생성 모먼트 주간 질문 중 둘 다 답한 항목을 대화 화제로 연결 대화 길이/빈도 기반 "대화 온도계" 시각화 → 관계 진전도 직관적 표현 일방적 대화(한 쪽만 길게 보내는 패턴) 감지 시 밸런스 넛지

> **활용: chat-analysis.service.ts , moment/daily-question.service.ts**
> **KPI: 대화 지속률(7일 이상), 평균 대화 라운드 수, 일방적 대화 비율 감소**

#### 심리학적 근거

- **사회적 침투 이론 (Social Penetration Theory):** Altman & Taylor(1973)에 따르면 관계는 양파 껍질처럼표면적→심층적 자기 노출의 단계를 거침. 대화 화제 제안은 다음 "층"으로의 자연스러운 전환을 돕는 촉매 (Wikipedia - SPT)
- **상호적 자기 노출의 보상-비용 평가:** 자기 노출은 취약성을 수반하며, 보상이 비용을 초과할 때만 깊어짐. 화제 제안은 "다음 노출"의 비용(무슨 말을 해야 하지?)을 낮춤 (EBSCO - SPT)
- **너비와 깊이의 균형:** SPT에서 관계 발전은 대화의 너비(다양한 주제)와 깊이(심층적 내용) 모두 필요. 리듬 엔진은 너비를 확장하여 깊이로 가는 발판을 제공 (Communication Theory.org)

### 2-4. 보이스 프로필 (Voice Profile)

**핵심 가치: "텍스트로는 전달 못하는 매력"**

- 프로필에 10초 음성 자기소개 등록 기능 대화 중 음성 메시지 전송 (최대 30초) → 텍스트 대화의 한계 보완 첫 만남 전 통화 기능: 앱 내 VoIP로 전화번호 노출 없이 통화 음성 메시지에도 안전 넛지 적용 (STT → 분석)
- 음성 교환 후 만남 성사율 vs 텍스트만 교환 그룹 A/B 측정

> **활용: 신규 개발 + face/ 모듈 참조 (미디어 검증 패턴), AWS S3**
> **KPI: 음성 사용 매치의 만남 성사율, 사진-실물 괴리 불만 감소**

#### 심리학적 근거

- **음성의 매력 신호:** Hughes et al.(Psi Chi)의 연구에 따르면 음성은 호르몬 수치, 생식 능력, 건강 상태 등 유전적/사회적 정보를 전달하는 진화적 신호 (Psi Chi - Voice Attractiveness)
- **성별 차이와 선호:** 여성은 낮은 기본 주파수(F0)의 남성 목소리를, 남성은 높은 음높이와 넓은 포먼트 분산의 여성 목소리를 선호 (Puts, 2005; Feinberg et al.) (PMC - Dominance and Attractiveness)
- **음성 매력과 협력 행동:** Frontiers in Psychology(2022) 연구에서 음성 매력이 높은 사람에게 더 협력적으로 행동하는 경향 발견 → 음성이 신뢰와 호감 형성에 기여 (Frontiers - Vocal Attractiveness)

### 2-5. 2인 협동 미니게임 (Duo Mission)

**핵심 가치: "함께 뭔가를 하면 대화가 더 쉬워진다"**

- 매칭 후 대화 중 2인용 미니 미션 제안 (하루 1개)
- 미션 예시: "오늘 하늘 사진 서로 공유", "좋아하는 노래 1곡 추천", "오늘의 점심 투표"
- 미션 완료 시 구슬 보상 + 스트릭 카운트 기존 모먼트 시스템의 스트릭/보상 메커니즘 재활용
- 3회 연속 미션 완료 시 "만남 제안" 넛지 → 오프라인 전환 유도

> **활용: moment/reward/ , streak-calculator.service.ts , gem-transaction.builder.ts**
> **KPI: 미션 참여율, 대화 지속일수, 오프라인 전환율**

#### 심리학적 근거

- **자기 확장 이론 (Self-Expansion Theory):** Aron & Aron(1986)에 따르면 인간은 관계를 통해 자아를 확장하려는 근본적 동기를 가짐. 함께 새롭고 자극적인 활동을 하면 관계 만족도가 유의미하게 상승 (Wikipedia - Self-Expansion Model)
- **공동 과제와 관계 품질:** Aron et al.(2000)의 3개 실험에서 7분간의 신선하고 자극적인 공동 과제가 일상적 과제대비 관계 품질을 유의미하게 향상시킴 (APA PsycNet)
- **자아에 타인 포함 (IOS):** 자기 확장 모델의 핵심 메커니즘. 공동 활동 시 상대를 자아의 일부로 포함하게 되어 자원,정체성, 관점을 공유하는 느낌 증가 (PMC - Pair-Bonding as IOS)

## 3. 모먼트 도메인 (Moment)

> 기존 자산: 주간 Q&A(5차원 7문항), Big5 성격 분석, 주간 리포트, 스트릭, 보상, 온보딩

### 3-1. 모먼트 매칭 인사이트 (Moment-Match Insight)

**핵심 가치: "왜 이 사람과 잘 맞는지 근거를 보여줌"**

- 매칭 상대와의 모먼트 답변을 비교하여 공통점/차이점 카드 자동 생성
- "이번 주 같은 질문에 두 분 다 A를 골랐어요" → 공감 포인트
- "이 부분은 관점이 달라요" → 대화 소재로 제안
- 기존 weekly-report-narrative.service.ts 의 GPT-4 내러티브 생성을 2인 비교 버전으로 확장
- XAI(설명 가능한 매칭)의 핵심 구현체 → 매칭 납득도 향상

> **활용: user-answers , weekly-report-aggregator.service.ts , match-reasons/**
> **KPI: 인사이트 열람률, 매칭 납득도 설문, 대화 시작률**

#### 심리학적 근거

- **유사성-매력 가설 (Similarity-Attraction Hypothesis):** Byrne(1971)의 연구에서 태도/가치관의 유사성이대인 매력의 가장 강력한 예측변수임을 실증. 공통점 시각화는 유사성 인지를 강화 (URT 유사성 공리 - Toolshero)불확실성 감소: Berger & Calabrese(1975)의 URT에서 유사점 발견이 불확실성을 감소시키고, 불확실성 감소가호감 증가로 이어지는 공리적 연결 (Montgomery College - URT)
- **XAI와 납득감:** "왜 이 사람인지" 설명은 알고리즘 투명성(algorithmic transparency)을 높여 사용자 신뢰와 만족도를 향상시키는 것으로 HCI 연구에서 반복 검증됨

### 3-2. 연애 성장 저널 (Dating Growth Journal)

**핵심 가치: "나의 연애 패턴을 인지하고 성장할 수 있게"**

- 모먼트 답변 + 매칭 이력 + 대화 패턴을 종합한 월간 자기 인사이트 리포트
- "이번 달 당신의 대화 스타일은 '따뜻한 경청형'이었어요"
- Big5 변화 추이 그래프 → 시간에 따른 성격/가치관 변화 시각화 매칭 성공/실패 패턴 분석 → "이런 유형에 적극적이고, 이런 유형은 피하는 경향" 비공개 개인 전용 (상대에게 노출 안 됨)

> **활용: emotional-profile.service.ts , weekly-report-metrics.service.ts , chat-analysis/**
> **KPI: 리포트 열람률, 장기 리텐션(3개월+), 모먼트 응답 지속률**

#### 심리학적 근거

- **성장 마인드셋 (Growth Mindset):** Dweck(2006) Mindset에서 능력이 노력으로 발전 가능하다는 믿음이 도전수용과 실패 학습을 촉진함을 실증. 연애 패턴 인사이트는 "고정형"에서 "성장형"으로 전환 유도 (Carol Dweck -fs.blog)
- **반복적 마인드셋 (Iterative Mindset):** 성장 마인드셋의 확장. 실패를 판단 없이 평가하고 의도적 연습으로 대응하는 것이 핵심. 월간 리포트가 이 반복 루프를 제공 (PMC - Iterative Mindset)
- **피드백 루프와 자기 효능감:** 정기적 자기 분석 리포트는 양적 자기(Quantified Self) 개념과 연결. 피드백이 자기 효능감(self-efficacy)을 높이고 동기를 강화 (Tandfonline - Growth Mindset & Self-efficacy)

### 3-3. 커플 모먼트 (Couple Moment)

**핵심 가치: "매칭된 상대와 함께 답하는 질문"**

- 매칭 성사 후 2인 전용 모먼트 질문 제공 (일반 모먼트와 별도)
- 각자 답변 후 동시 공개 → 결과 비교 카드 자동 생성
- "첫 데이트에서 가장 중요한 것은?" 같은 관계 탐색형 질문
- 3문항 완료 시 둘만의 궁합 리포트 해금 커플 모먼트 참여율이 높은 매치의 만남 성사율 상관관계 추적

> **활용: daily-question.service.ts , question-selection.service.ts , answer-**
- sequence.service.ts
> **KPI: 커플 모먼트 참여율, 궁합 리포트 생성 수, 만남 전환율**

#### 심리학적 근거

- **사회적 침투 이론 (Social Penetration Theory):** Altman & Taylor(1973)의 동시 노출→비교 구조는 관계발전의 "탐색적 감정 단계"(exploratory affective stage)에서 감정 공유로 전환하는 핵심 메커니즘 (Psychology Fanatic - SPT)
- **상호적 자기 노출과 친밀감:** 연구에 따르면 상호적 자기 노출(reciprocal self-disclosure)이 낯선 사람 간 친밀감과 호감을 증가시킴 (tutor2u - Self-disclosure)
- **자기 확장 이론:** Aron et al.의 공동 활동(여기서는 공동 질문 답변)이 관계 품질을 향상시키는 효과와 연결 (SAGE -Self-Expansion Updated Review)

### 3-4. 성격 뱃지 시스템 (Personality Badge)

**핵심 가치: "나의 성격을 재미있게 표현하는 아이콘"**

- 모먼트 답변 누적으로 성격 뱃지 자동 부여 (예: "공감 마스터", "모험가", "깊은 대화러")
- Big5 5개 차원 × 3단계 = 15개 기본 뱃지 특수 뱃지: 연속 4주 응답(꾸준함), 다양한 관점 선택(열린 마음) 등 프로필 카드에 대표 뱃지 3개 노출 → 텍스트 없이도 성격 직관적 전달 뱃지 조합에 따른 궁합 로직 추가 (보완형 매칭 강화)

> **활용: user-streaks , big5-calculator.service.ts , personality-view.service.ts**
> **KPI: 뱃지 획득 후 프로필 조회수 변화, 모먼트 참여 지속률**

#### 심리학적 근거

- **자기결정 이론 (Self-Determination Theory):** Deci & Ryan의 SDT에서 내재적 동기는 자율성(autonomy),유능감(competence), 관계성(relatedness) 3가지 기본 욕구 충족 시 번성. 뱃지는 유능감을 충족 (Springer -SDT & Gamification)
- **게이미피케이션과 내재적 동기:** 메타분석(2023)에서 게이미피케이션이 자율성과 관계성 인식을 유의미하게 향상시킴을 확인. 단, 외재적 보상(포인트/뱃지)에만 의존하면 내재적 동기가 손상될 수 있어 설계 주의 필요 (Springer -Gamification Meta-analysis)
- **도전 난이도와 유능감:** Big5 차원별 3단계 뱃지는 점진적 난이도 상승을 통해 유능감을 지속적으로 자극. 즉각적 피드백(뱃지 획득)이 핵심 (Drimify - Deci & Ryan)

### 3-5. 주간 캠퍼스 트렌드 (Weekly Campus Trend)

**핵심 가치: "우리 학교 학생들은 이렇게 생각한다"**

- 모먼트 답변을 대학교별/지역별 집계하여 익명 통계 리포트 발행
- "이번 주 서울대 학생 72%가 A를 선택했어요" → 소속감 + 호기심 나의 답변이 다수/소수인지 시각적 표시 → 재미 요소 트렌드 카드를 대화 중 공유 기능 → 대화 소재 대학별 최소 N명 이상 응답 시에만 공개 (프라이버시)

> **활용: response-analytics.service.ts , universities 스키마, weekly-question-groups**
> **KPI: 모먼트 응답률 증가, 트렌드 공유 횟수, 대화 내 트렌드 언급률**

#### 심리학적 근거

- **사회 비교 이론 (Social Comparison Theory):** Festinger(1954)에 따르면 인간은 자신의 의견과 능력을 타인과 비교하여 평가하려는 근본적 동인이 있음. 대학별 통계는 내집단 비교 기준을 제공 (Wikipedia - Social
- Comparison Theory)
- **사회적 정체성 이론 (Social Identity Theory):** Tajfel & Turner의 이론에서 집단 소속감은 자존감의 핵심 원천. "우리 학교 학생 72%가 A 선택"은 내집단 정체성을 강화하고 소속감을 증가시킴 (Positive Psychology -Social Identity)
- **캠퍼스 맥락에서의 동류의식(Homophily):** 대학 친구들은 학업 성취, 관심사, 열망 등 다차원에서 유사성을 보이므로 "일상적 비교 기준"으로 기능 (PMC - Social Comparison Academic)

## 4. 결제/경제 도메인 (Payment/Gems)

> 기존 자산: 구슬 경제 시스템, 트랜잭션 빌더 패턴, Apple IAP, Portone, 7개 참조 유형

### 4-1. 성과 기반 과금 (Pay-for-Outcome)

**핵심 가치: "만남이 이루어져야 돈의 가치가 있다"**

- 기본 매칭/대화는 무료, 가치 있는 액션에만 과금 구슬 소모 시점 재설계:
무료: 매칭 수신, 좋아요, 기본 대화
유료: 프로필 전체 공개, 궁합 상세 리포트, 만남 플래너, 추가 매칭 슬롯
- "만남 성사 보너스": 실제 만남 후 체크인 시 사용한 구슬 50% 환급 만남이 성사되지 않은 매칭의 구슬은 "다음 매칭 쿠폰"으로 전환

> **활용: gem-transaction.builder.ts , gem-feature-costs 스키마, gem-payment.service.ts**
> **KPI: ARPU 변화, 만남 성사율, 과금 불만 감소**

#### 심리학적 근거

- **전망 이론과 손실 프레이밍:** Kahneman & Tversky(1979)의 전망 이론에서 결과의 주관적 프레이밍이 효용에 영향. "만남 성사 시 환급"은 이득 프레이밍으로 긍정적 행동 유도 (Wikipedia - Prospect Theory)
- **성과 기반 보상과 내재적 동기:** 과정이 아닌 결과에 과금하면 "만남"이라는 본질적 목표에 집중하게 되어 서비스의도구적 가치가 명확해짐 (NN/g - Prospect Theory UX)
- **공정성 인식:** 성과와 연동된 과금은 절차적 공정성(procedural justice) 인식을 높여 과금 불만을 감소시킴. Tyler& Lind의 연구에서 공정한 절차가 부정적 결과도 수용하게 만듦 (ResearchGate - Procedural Justice)

### 4-2. 구슬 구독 패스 (Gem Subscription Pass)

**핵심 가치: "월정액으로 부담 없이 모든 기능을"**

- 월간 구독으로 프리미엄 기능 번들 제공
무제한 궁합 프리뷰
주 2회 추가 매칭 슬롯
프로필 A/B 테스트
매칭 리플레이 무료
주간 인사이트 리포트 상세 버전
- 구독자 전용 뱃지 → 프로필에 "프리미엄 멤버" 표시 (선택적)
- 1주 무료 체험 → 자동 전환

> **활용: apple-iap.service.ts , product-viewer.service.ts , ticket.service.ts**
> **KPI: 구독 전환율, 구독 유지율(M1/M3/M6), LTV 변화**

#### 심리학적 근거

- **보유 효과 (Endowment Effect):** Kahneman, Knetsch & Thaler(1990)의 머그컵 실험에서 소유한 것의 가치를 비소유보다 약 2배 높게 평가. 구독 후 기능을 "보유"하면 해지 저항이 발생 (AEA - Endowment Effect)현상 유지 편향 (Status Quo Bias): 일단 구독을 시작하면 현재 상태를 유지하려는 심리적 편향이 작용하여 이탈률 감소 (Wikipedia - Loss Aversion)
- **번들링 효과:** 여러 기능을 묶어 제공하면 개별 기능의 가치 평가보다 번들 전체의 지각 가치가 높아지는 "번들 할인착시" 효과 활용

### 4-3. 구슬 선물하기 (Gem Gifting)

**핵심 가치: "관심 표현의 새로운 방법"**

- 매칭 상대에게 구슬을 선물로 보낼 수 있는 기능 선물 시 메시지 첨부 가능 → "이 구슬로 우리 만남 플래너 써봐요"
- 받는 사람은 구슬 + 감사 알림 수신 선물 이력은 프로필 뷰어에서 "선물을 보낸 사람" 필터로 조회 가능 구슬 선물을 보낸 매치의 대화 지속률 vs 일반 매치 비교 추적

> **활용: gem-transaction.builder.ts , gem-query.service.ts , notification/**
> **KPI: 선물 전송 빈도, 선물 매치 대화 지속률, 구슬 구매량 변화**

#### 심리학적 근거

- **호혜성 규범 (Norm of Reciprocity):** Gouldner(1960)는 호혜성이 인간에게 보편적인 도덕 규범이라고 제시.선물을 받으면 보답하려는 사회적 의무감이 발생하여 관계 투자를 유도 (SAGE - Gouldner Reciprocity)
- **사회적 교환 이론 (Social Exchange Theory):** 사회적 상호작용은 이익 극대화/비용 최소화의 교환으로 이해. 구슬 선물은 "관계 투자" 신호로 작용하여 상대의 호혜적 반응을 촉진 (Frontiers - Social Exchange Theory)선물의 심리학: PMC(2025) 연구에서 감사 선물(thank-you gift)이 관계 유지와 사회적 유대를 강화하는 심리적메커니즘 분석 (PMC - Psychology of Thank-you Gift)

### 4-4. 활동 보상 시스템 (Activity Rewards)

**핵심 가치: "적극적으로 활동하면 보상받는다"**

- 일일/주간 활동 미션 체계 도입
일일: 모먼트 응답(+3 구슬), 프로필 업데이트(+2), 대화 시작(+5)
주간: 3일 연속 로그인(+10), 모먼트 주간 완료(+15), 첫 만남 체크인(+30)
- 기존 모먼트 스트릭 보상 시스템을 전체 서비스로 확장 랭킹: 주간 활동왕 Top 10 → 추가 매칭 슬롯 보너스 활동 포인트와 구슬의 분리: 활동 포인트는 기능 해금용, 구슬은 프리미엄 기능용

> **활용: reward/ , streak-calculator.service.ts , user_activities 스키마**
> **KPI: DAU/WAU, 활동 미션 완료율, 구슬 구매와의 시너지**

#### 심리학적 근거

- **변동 비율 강화 계획 (Variable Ratio Reinforcement):** Skinner의 조작적 조건화에서 변동 비율 강화가 가장높은 반응률과 소거 저항성을 보임. 매일 다른 미션과 예측 불가능한 보상은 이 원리 적용 (Simply Psychology -Reinforcement Schedules)
- **디지털 플랫폼에서의 강화 계획:** 알림, 좋아요, 스트릭, 뱃지, 보상 등이 디지털 플랫폼에서 습관적 참여를 유도하는강화 메커니즘으로 활용됨 (ResearchGate - Reinforcement in Digital Age)
- **자기결정 이론과의 균형:** SDT 관점에서 외재적 보상(구슬)이 내재적 동기를 훼손하지 않도록, 활동 자체의 자율성과유능감을 함께 설계해야 함 (Springer - SDT & Gamification)

### 4-5. 환불형 좋아요 (Refundable Like)

**핵심 가치: "좋아요의 가치를 높이고 남발 방지"**

- 좋아요에 소량 구슬 비용 부과 (1~2개)
- 24시간 내 상대가 미열람 시 구슬 자동 환급 상대가 열람 후 좋아요 미응답 시에도 48시간 후 50% 환급 상호 좋아요 매칭 시 양쪽 모두 전액 환급 좋아요의 "희소성" 증가 → 받는 사람이 더 의미있게 느낌

> **활용: gem-transaction.builder.ts , match_likes 스키마, matching-alert-cron.service.ts**
> **KPI: 좋아요 남발 감소, 좋아요당 매칭 전환율, 사용자 만족도**

#### 심리학적 근거

- **희소성과 가치 인식:** Cialdini(1984)의 희소성 원리에서 제한된 자원(비용이 드는 좋아요)은 더 높은 가치로 인식됨.받는 사람이 "이 좋아요는 진심"으로 느낌 (Cognitigence - Cialdini Principles)
- **손실 회피와 환불 메커니즘:** Kahneman & Tversky의 손실 회피 이론에서 "환불" 프레이밍은 비용 지불의 심리적장벽을 낮춤. 미열람 시 자동 환급은 "손실 없는 투자"로 인식 (The Decision Lab - Loss Aversion)
- **보유 효과와 좋아요 가치:** 구슬을 지불하고 보낸 좋아요는 보유 효과에 의해 "내가 투자한 것"으로 인식되어, 보낸 사람도 해당 매치에 더 높은 가치를 부여 (AEA - Endowment Effect)

## 5. 프로필/사용자 도메인 (Profile/User)

> 기존 자산: 3슬롯 이미지 시스템, Big5 성격 분석, 감성 프로파일링, 관심사 매칭, 인스타그램 연동

### 5-1. 프로필 A/B 테스트 (Profile Lab)

**핵심 가치: "어떤 사진/소개가 더 매력적인지 데이터로 알 수 있다"**

- 프로필 사진/소개문을 2개 버전으로 등록 → 무작위 노출 각 버전별 좋아요 수신률, 프로필 조회 시간, 매칭 수락률 추적
- 1주일 후 성과 리포트: "B 버전이 좋아요를 40% 더 받았어요"
- 기존 ab_test_results 테이블과 matching-ab-test.service.ts 인프라 활용
- AI 기반 사진 개선 제안: "조명이 밝은 사진이 인기가 더 높아요" (향후)

> **활용: profile_images , ab_test_results , matching-ab-test.service.ts**
> **KPI: A/B 테스트 참여율, 테스트 후 매칭률 변화**

#### 심리학적 근거

- **성장 마인드셋과 피드백:** Dweck(2006)의 연구에서 피드백은 성장 마인드셋 활성화의 핵심 촉매. 프로필 성과 데이터는 "나는 개선할 수 있다"는 인식을 강화 (Stanford - Growth Mindset)
- **양적 자기(Quantified Self):** 자기 데이터를 수집·분석하면 자기 인식(self-awareness)이 향상되고, 근거 기반행동 변화가 촉진됨
- **오류에서의 학습:** Dweck의 실험에서 성장 마인드셋 참가자는 오류 관련 신경 활동이 더 활발했음 → A/B 테스트의"실패 버전"에서도 배움을 얻는 구조 (Mindtools - Dweck)

### 5-2. 지연 공개 프로필 (Gradual Reveal)

**핵심 가치: "천천히 알아가는 설렘"**

- 처음에는 흐릿한 사진 + 기본 정보만 노출 대화 진행에 따라 단계적으로 공개:
1단계 (매칭): 흐릿한 메인 사진 + 학교/나이/관심사
2단계 (대화 5회): 선명한 메인 사진
3단계 (대화 20회): 추가 사진 + 상세 프로필
4단계 (구슬 사용 또는 만남 약속): 전체 공개
- 단계마다 공개될 정보 프리뷰 → 다음 단계 기대감 유발 사진-실물 괴리 불만 감소 (대화로 먼저 판단)

> **활용: profile-viewer.service.ts , profile-image-provider.service.ts**
> **KPI: 대화 지속률, 사진 기반 이탈률 변화, 만남 후 만족도**

#### 심리학적 근거

- **사회적 침투 이론 (Social Penetration Theory):** Altman & Taylor(1973)의 "양파 모델"에서 관계는 표면적→ 탐색적 → 감정적 → 안정적 단계를 거침. 지연 공개는 이 자연스러운 단계를 디지털에서 재현 (Wikipedia -SPT)
- **자기 노출의 보상-비용 분석:** SPT에서 자기 노출은 취약성(비용)을 수반하며, 보상이 비용을 초과할 때만 다음 단계로 진행. 단계적 공개는 각 단계에서 보상(대화 품질)을 먼저 확인 후 비용(사진 공개)을 지불하게 설계 (Rutgers -SPT)
- **외모 기반 판단 지연:** 사진 없이 대화로 먼저 판단하면 내적 특성(성격, 가치관)에 기반한 매력 평가가 가능하여, 외모편향을 줄이고 만남 후 만족도를 높임

### 5-3. 취향 DNA 카드 (Taste DNA Card)

**핵심 가치: "나의 취향을 시각적으로 예쁘게 보여주기"**

- 관심사 + 모먼트 답변 + 성격을 종합한 시각적 취향 카드 자동 생성 레이더 차트 형태: 6축 (활동성, 감성, 지적호기심, 사교성, 모험심, 심미안) 카드 디자인 커스터마이징 (배경색, 아이콘 등)
- SNS 공유 가능 형태 → 바이럴 효과 (개인정보 미포함)
- 매칭 상대와 카드 겹쳐보기 → 궁합 시각화

> **활용: emotional-profiling/ , user-answers , interest/ , background-image-presets**
> **KPI: 카드 생성률, SNS 공유 수, 프로필 완성도 향상**

#### 심리학적 근거

- **자기 개념 명확성 (Self-Concept Clarity):** Campbell et al.(1996)의 연구에서 자기 개념이 명확한 사람이 더높은 자존감과 관계 만족도를 보임. 취향 카드는 자기 이해를 시각화하여 명확성을 높임
- **정체성 신호 이론 (Identity Signaling):** 사람들은 자신의 정체성을 타인에게 전달하기 위해 소비·취향·행동을 선택. 취향 DNA 카드는 이 정체성 신호를 효율적으로 압축·전달
- **사회 비교와 자기 표현:** Festinger(1954)의 사회 비교 이론에서 타인과의 비교를 통해 자기를 평가. 매칭 상대와 카드를 겹쳐보는 기능은 유사성/차이점을 직관적으로 비교 가능하게 함 (Wikipedia - Social Comparison)

### 5-4. 매력 포인트 하이라이트 (Charm Spotlight)

**핵심 가치: "내 프로필에서 가장 매력적인 부분을 AI가 찾아줌"**

- GPT-4가 프로필 전체를 분석하여 가장 차별화되는 매력 포인트 3개 추출
- "이 사람의 특별한 점": 관심사 조합의 희소성, 성격 프로필의 독특한 점, 소개문의 매력 포인트 매칭 카드 상단에 매력 포인트 뱃지 표시 상대방이 본 나의 매력 포인트 통계 → "72%가 '독서광' 매력에 관심을 보였어요"

> **활용: ai-chat.service.ts (LLM), profile-enrichment.service.ts , profile-access-**
- logger.service.ts
> **KPI: 매력 포인트 설정률, 프로필 조회 시간 증가, 좋아요 수신률**

#### 심리학적 근거

- **독특성 효과 (Distinctiveness Effect):** 인지심리학에서 독특한 정보가 일반적 정보보다 더 잘 기억됨(VonRestorff Effect). AI가 추출한 "가장 차별화되는 매력"은 프로필 기억률을 높임
- **인상 관리 (Impression Management):** Goffman(1959)의 자기 표현 이론에서 "무대 위(front stage)"에서의도적으로 특정 정체성을 투사. AI가 최적의 매력 포인트를 선별해주는 것은 효과적 인상 관리 지원 (JCMC - Self-Presentation Online Dating)
- **AI와 자기 인식:** 자신이 인지하지 못한 매력을 AI가 발견해주는 경험은 자기 효능감과 서비스 신뢰를 동시에 높임

### 5-5. 프렌드 보증 리뷰 (Friend Endorsement)

**핵심 가치: "친구가 보증하는 사람이 더 믿을 수 있다"**

- 친구에게 프로필 보증 요청 → 친구가 한 줄 코멘트 작성
- "이 사람은 정말 따뜻한 사람이에요" (익명/실명 선택)
- 보증인은 앱 유저가 아니어도 링크로 참여 가능 보증 리뷰 1개 이상 있는 프로필에 "친구 인증" 뱃지 보증 리뷰가 있는 프로필의 매칭 수락률 변화 측정

> **활용: invite/ (링크 시스템 재활용), profile.service.ts**
> **KPI: 보증 리뷰 등록률, 보증 프로필의 매칭 수락률 차이**

#### 심리학적 근거

- **사회적 증거 (Social Proof):** Cialdini(1984)의 6가지 설득 원리 중 하나. 타인(특히 유사한 타인)의 행동/평가가의사결정에 강력한 영향을 미침. 친구의 보증은 가장 신뢰도 높은 사회적 증거 (Wikipedia - Social Proof)
- **제3자 보증의 신뢰도:** 연구에 따르면 고객 후기가 판매 전환률을 82% 증가시키며, 온라인 리뷰를 50%가 개인 추천과 동등하게 신뢰 (Trustpilot - Social Proof Psychology)
- **전문가/사용자 증거 구분:** NN/g의 UX 연구에서 "일반인"의 증언이 전문가 추천보다 더 공감 가능하고 신뢰할 수 있다고 평가됨. 친구 보증은 "일반인 증언"의 가장 강력한 형태 (NN/g - Social Proof UX)

## 6. 안전/신뢰 도메인 (Safety/Trust)

> 기존 자산: 프로필 신고, 양방향 차단, 연락처 해시 차단, Google Vision 사진 검증, 얼굴 매칭

### 6-1. TrustScore (신뢰 점수)

**핵심 가치: "이 사람이 안전한지 수치로 알 수 있다"**

- 다차원 신뢰 점수 산출:
인증 점수: 대학 인증 + 얼굴 인증 + 재학 주기 검증
행동 점수: 신고 이력 없음 + 응답 성실도 + 약속 이행률
커뮤니티 점수: 프렌드 보증 + 장기 활동 이력
- 매칭 카드에 TrustScore 뱃지 표시 (높음/보통, 낮음은 미표시)
- 높은 TrustScore 유저에게 추가 매칭 기회 인센티브 점수 하락 시 개선 가이드 제공 (차단이 아닌 교정)

> **활용: identity-verifications , reports , user_blocks , face-validation.service.ts**
> **KPI: TrustScore 분포, 고TrustScore 매칭의 신고율, 이탈률 변화**

#### 심리학적 근거

- **매슬로우 욕구 위계 - 안전 욕구:** Maslow(1943)의 위계에서 안전 욕구는 생리적 욕구 다음으로 기본적. 디지털 시대에는 프라이버시, 사기 방지, 안전한 환경이 안전 욕구의 핵심 구성요소 (Simply Psychology - Maslow)
- **신뢰의 3가지 관계적 변수:** Tyler & Lind의 절차적 공정성 모델에서 신뢰는 지위 인정(status recognition), 선의에 대한 믿음(trust in benevolence), 의사결정 중립성(neutrality)의 3요소로 구성 (UCLA - Lind Tyler Huo)신뢰 점수의 행동 경제학: 가시적 신뢰 지표는 정보 비대칭(information asymmetry)을 줄여 "레몬 시장" 문제를완화. Akerlof(1970)의 역선택 이론과 직접 연결

### 6-2. 캠퍼스 안전 코호트 (Campus Safety Cohort)

**핵심 가치: "같은 학교/과 친구에겐 절대 노출 안 됨"**

- 같은 대학교/학과 학생 자동 비노출 (기본값 ON)
- 연락처 해시 차단 확장: 카카오톡/인스타 친구 목록 해시 비교 → 아는 사람 차단 비노출 범위 커스터마이징: 같은 학교 전체 / 같은 학과만 / 특정 학번
- "주변에 이용 사실이 알려질 걱정 없음" → Kano 만족계수 1.00 대응 비노출 설정 변경 시 확인 단계 추가 (실수 방지)

> **활용: contact-hashes , universities , user_preferences , matching-filter/**
> **KPI: 프라이버시 불안 이탈률 감소, 비노출 설정 활성화율**

#### 심리학적 근거

- **인상 관리와 프라이버시:** Goffman(1959)의 자기 표현 이론에서 "무대 뒤(back stage)" 보호가 핵심. 데이팅 앱사용 사실이 노출되면 무대 뒤가 침범되는 것으로 인식 (SAGE - Goffman Online)
- **프라이버시와 자기 노출의 딜레마:** Ellison et al.(2006)의 온라인 데이팅 연구에서 사용자는 매력적 자기 표현과프라이버시 보호 간 긴장 관계를 경험. 86%가 타인의 자기 표현 과장을 인식 (JCMC - Self-Presentation
- Online)
- **Kano 모델의 매력 요인:** 본 기획서의 Kano 분석에서 "주변에 이용 사실이 알려질 걱정 없음"이 만족계수 1.00으로 최상위 매력 요인. 있으면 만족이 극대화되지만 없다고 즉시 불만은 아닌 영역

### 6-3. 데이트 안심 체크인 (Date Safety Check-in)

**핵심 가치: "첫 만남 때 안전 장치가 있다는 안심감"**

- 만남 약속 확정 시 안전 타이머 활성화 만남 시작/종료 시 앱에서 체크인 → 친구에게 자동 알림 (선택)
- 만남 중 비상 버튼: 탭 하면 미리 지정한 긴급 연락처에 위치 공유 만남 후 간단한 안전 피드백: "안전하게 끝났어요" / "불편한 점이 있었어요"
- 안전 체크인 데이터를 TrustScore에 반영 (약속 이행 = 점수 상승)

> **활용: 신규 개발 + push-notification/ , slack-notification/ (운영 알림)**
> **KPI: 안전 체크인 사용률, 비상 버튼 발동률, 첫 만남 성사율 증가**

#### 심리학적 근거

- **매슬로우 안전 욕구의 디지털 확장:** 온라인에서 시작된 관계의 오프라인 전환 시 안전 불안이 급증. 안전 장치의 존재자체가 "지각된 안전감(perceived safety)"을 높여 행동(만남)을 촉진 (Khiron Clinics - Modern Hierarchy)위험 인식과 통제감: 심리학에서 통제감(perceived control)은 위험 인식을 감소시키는 핵심 변수. 비상 버튼, 체크인, 친구 알림은 통제감을 제공하여 첫 만남의 심리적 장벽을 낮춤
- **안전 행동과 신뢰 순환:** 안전 체크인 데이터가 TrustScore에 반영되는 구조는 "안전 행동 → 신뢰 점수 상승 → 더좋은 매칭 → 더 안전한 행동"의 선순환 루프를 형성

### 6-4. AI 이상행동 탐지 (Anomaly Detection)

**핵심 가치: "스캠/사기꾼을 사전에 걸러냄"**

- 가입 패턴, 프로필 작성 패턴, 대화 패턴을 종합하여 이상행동 자동 감지 감지 지표:
짧은 시간 내 다수에게 동일 메시지 전송
외부 링크/연락처 반복 공유 시도
프로필 사진의 인터넷 역검색 매칭 (향후)
가입 직후 적극적 활동 (일반 유저와 다른 패턴)
- 이상 감지 시 자동 제한 + 관리자 리뷰 대기열 추가 signal_reports 데이터와 결합하여 정확도 개선

> **활용: signal_reports , chat-analysis.service.ts , admin/**
> **KPI: 스캠 계정 사전 탐지율, 오탐률, 신고 접수 대비 사전 차단 비율**

#### 심리학적 근거

- **행동 분석과 기저율 비교:** 행동 심리학에서 이상행동 탐지의 핵심은 "정상 행동 패턴"의 기저율(baseline) 확립. 개인별 행동 패턴 프로파일링을 통해 편차를 감지 (Fraud.com - Anomaly Detection)
- **기만 탐지의 한계:** 일반인의 거짓말 탐지 정확도는 약 54%에 불과. AI 기반 다중모드(multimodal) 분석이 인간의인지적 한계를 보완 (PolygrAI - Deception Detection)
- **행동 생체인식 (Behavioral Biometrics):** 모든 사용자에게는 고유한 온라인 행동 패턴(브라우징, 타이핑, 스와이프 패턴)이 있으며, 이를 기반으로 신뢰를 구축하고 이상 행동을 탐지 (LexisNexis - Behavioral Biometrics)

### 6-5. 투명한 커뮤니티 가이드라인 (Transparent Guidelines)

**핵심 가치: "규칙이 명확하면 불안이 줄어든다"**

- 신고/차단/제재 기준의 인앱 투명 공개 내 계정 상태 대시보드: 경고 이력, TrustScore, 개선 방법 신고 처리 과정 실시간 알림: "접수 → 검토중 → 처리완료"
- 이의 제기 프로세스: 잘못된 신고에 대한 이의 신청 → 관리자 재검토 제재 시 구체적 사유 + 개선 행동 가이드 제공

> **활용: report/ , admin/ , notification/ , support-chat/**
> **KPI: 이의 제기 후 유지율, 투명성 만족도, 반복 신고율 감소**

#### 심리학적 근거

- **절차적 공정성 (Procedural Justice):** Tyler & Lind의 연구에서 절차의 공정성 인식이 결과의 공정성보다 순응,신뢰, 협력에 더 큰 영향을 미침. 부정적 결과(제재)도 절차가 공정하면 수용됨 (Wikipedia - Procedural Justice)집단 가치 모델 (Group Value Model): Lind & Tyler의 모델에서 절차적 공정성은 지위 인정, 신의 신뢰, 중립성 3가지로 구성. 투명한 가이드라인은 중립성과 지위 인정을 동시에 충족 (PHLR - Procedural Justice)
- **발언권 효과 (Voice Effect):** 의사결정 과정에서 발언할 기회(이의 제기)가 주어지면, 결과와 무관하게 공정성 인식이 향상. 이의 제기 프로세스는 이 발언권을 보장 (Ethena - Procedural Justice)

## 7. AI/분석 도메인 (AI/Analytics)

> 기존 자산: GPT-4 대화 분석, Big5 프로파일링, 임베딩 서비스, RAG 기반 고객지원 챗봇

### 7-1. AI 데이트 코치 (AI Dating Coach)

**핵심 가치: "연애 고민을 AI가 1:1로 상담해줌"**

- 기존 support-chat 의 RAG 시스템을 연애 상담 특화 버전으로 확장 대화 내용 분석 기반 맞춤 조언: "상대가 이런 표현을 쓸 때는 이런 의미일 수 있어요"
- 첫 데이트 준비 가이드: 상대 프로필 기반 대화 주제/장소 추천 관계 진단: 현재 매칭 상대와의 대화 패턴 기반 관계 진전도 분석 개인정보 보호: 코치 대화는 암호화 + 분석 데이터에서 제외

> **활용: conversational-rag.service.ts , support-chat/ , chat-analysis/ , emotional-profiling/**
> **KPI: 코치 상담 이용률, 상담 후 행동 변화율, 매칭 성사율 변화**

#### 심리학적 근거

- **AI 치료적 동맹 연구:** ScienceDirect(2024) 연구에서 AI 챗봇의 관계 상담 능력을 일반인과 치료사 모두 공감성/유용성에서 높게 평가. 치료사의 53.9%만이 AI/인간 응답을 정확히 구분 (ScienceDirect - AI RelationshipCounselling)
- **하이브리드 AI-인간 코칭:** Frontiers(2024) 연구에서 AI 코치가 목표 추적, 책임감, 편의성에서 유용하며, 인간 코치의 지지 하에 심리적 안전감이 더 높아짐 (Frontiers - AI vs Human Coaches)
- **AI 심리 상담 효과:** Dartmouth(2025) 최초 RCT에서 AI 치료 챗봇 참가자의 우울 증상이 평균 51% 감소 → 전통치료와 유사한 효과 (JMIR - AI Mental Health Chatbots)

### 7-2. 주간 매칭 인사이트 리포트 (Weekly Match Intelligence)

**핵심 가치: "내 매칭 데이터를 분석해서 전략을 알려줌"**

- 매주 개인화된 매칭 분석 리포트 자동 발행 포함 내용:
이번 주 프로필 조회수/좋아요 수 트렌드
나를 좋아한 사람들의 공통 특성 분석
매칭 풀에서 나의 포지션 (상위 %) → 동기부여
개선 제안: "프로필 사진을 야외 사진으로 바꾸면 조회수가 올라갈 수 있어요"
- 기존 weekly-report 인프라 확장 (현재 모먼트만 대상)

> **활용: matching-analytics.service.ts , weekly-report-scheduler.service.ts , profile-view/**
> **KPI: 리포트 열람률, 리포트 제안 반영률, 다음 주 활동 지표 변화**

#### 심리학적 근거

- **성장 마인드셋과 정기 피드백:** Dweck(2006)의 연구에서 정기적 피드백이 "나는 개선할 수 있다"는 성장 마인드셋을 강화하고, 이것이 행동 변화로 이어짐 (The Decision Lab - Carol Dweck)
- **사회 비교 이론:** Festinger(1954)의 이론에서 "매칭 풀에서 나의 포지션(상위 %)" 정보는 상향/하향 비교를 유발.적절한 상향 비교는 동기 부여, 하향 비교는 자존감 보호 (Structural Learning - Social Comparison)
- **실행 가능한 인사이트의 행동 변화 효과:** HCI 연구에서 "무엇을 해야 하는지" 구체적 제안이 포함된 피드백이 일반적 피드백보다 행동 변화율이 유의미하게 높음

### 7-3. 감성 대화 분석 대시보드 (Emotional Chat Dashboard)

**핵심 가치: "내 대화가 어떤 감정 흐름이었는지 한눈에"**

- 매칭별 대화의 감정 타임라인 시각화
- GPT-4 기반 감정 태깅: 설렘/호감/유머/진지/불편/거리감 전체 매칭 대비 이 대화의 긍정 감정 비율
- "이 대화에서 가장 케미가 좋았던 순간" 하이라이트 대화 품질 점수 기반 만남 추천: "이 분과 감정 교류가 좋아요, 만남을 추천합니다"

> **활용: chat-analysis.service.ts , llm-analysis.service.ts , chat-analysis-reports 스키마**
> **KPI: 대시보드 조회율, 분석 후 만남 제안률, 대화 품질 점수 분포**

#### 심리학적 근거

- **감정 명명 효과 (Affect Labeling):** Lieberman et al.(2007) UCLA fMRI 연구에서 감정에 이름을 붙이면 편도체 반응이 감소하고 감정 조절이 향상됨. 대화 감정 태깅은 자기 감정 인식을 높임
- **감성 지능 (Emotional Intelligence):** Goleman(1995)의 EQ 모델에서 자기 감정 인식(self-awareness)이관계 관리의 기초. 감정 타임라인은 자기 감정 패턴 인식을 지원
- **관계 만족도 예측:** 긍정 감정 비율이 관계 만족도의 강력한 예측 변수. Gottman의 연구에서 안정적 커플의 긍정:부정 비율은 5:1 → 대화 품질 점수가 이 비율을 추적

### 7-4. 스마트 알림 최적화 (Smart Notification)

**핵심 가치: "딱 맞는 타이밍에 필요한 알림만"**

- 사용자 행동 패턴 학습 기반 알림 타이밍/빈도 자동 최적화 앱 접속 시간대 분석 → 가장 응답률 높은 시간에 알림 발송 알림 유형별 반응률 추적 → 반응 없는 유형은 자동 빈도 감소
- "지금 상대가 앱에 접속중" 같은 실시간 넛지 (선택적)
- 일일 알림 한도 설정 → 알림 피로 방지

> **활용: notification/ , push-notification/ , user_activities , matching-time-patterns**
> **KPI: 알림 클릭률, 알림 후 액션 전환률, 알림 비활성화율 감소**

#### 심리학적 근거

- **인지 부하 이론 (Cognitive Load Theory):** 인간의 주의는 유한한 자원. 과도한 알림은 인지 부하를 초과시켜 이탈을 유발. 2020년 이후 알림량 97% 증가, 오픈율 31% 하락 (ContextSDK - Psychology of Push)
- **알림 피로 데이터:** 시간당 10개 이상 알림 수신 시 반응률 52% 하락, 47%가 첫 주 내 알림 비활성화, 38%의 활성사용자를 잃음 (MagicBell - Notification Fatigue)
- **맞춤형 알림의 효과:** 개인화된 알림은 참여율을 800% 이상 향상시킬 수 있음. 화요일 저녁 8시가 "골든 아워"로 가장 높은 참여율 (Erik Fiala - Psychology of Notifications)
- **통제감과 수용성:** PLoS One(2017) 연구에서 알림의 시기, 빈도, 방법에 대한 사용자 통제권이 수용성의 핵심 요인(PLoS One - Push Notification Timing)

### 7-5. A/B 테스트 자동화 플랫폼 (Auto A/B Testing)

**핵심 가치: "모든 기능 변경을 데이터로 검증"**

- 기존 feature_flags + ab_test_results 인프라를 셀프서비스 A/B 테스트 플랫폼으로 고도화 관리자가 코드 배포 없이 실험 설정: 대상 그룹, 변수, 측정 지표 자동 표본 크기 계산 + 통계적 유의성 판정
- Mixpanel 연동 자동 리포트 생성 실험 결과에 따른 자동 롤아웃/롤백

> **활용: feature_flags , ab_test_results , analytics-events/ , Mixpanel**
> **KPI: 실험 수행 빈도, 실험 기반 의사결정 비율, 배포 롤백률 감소**

#### 심리학적 근거

- **확증 편향 방지:** Nickerson(1998)의 연구에서 인간은 기존 믿음을 확인하는 정보를 선호하는 확증 편향
- (confirmation bias)이 있음. A/B 테스트는 데이터 기반 의사결정으로 편향을 교정
- **과학적 방법론의 제품 적용:** RCT(무작위 대조 시험)는 의학에서 "골드 스탠다드". 온라인 A/B 테스트는 이 방법론을제품 개발에 적용한 것으로, Kohavi et al.(2020) Trustworthy Online Controlled Experiments에서 체계화조직 학습과 심리적 안전: Edmondson(1999)의 연구에서 실험 문화는 실패를 학습 기회로 재정의하는 심리적 안전감이 필요. 자동화된 A/B 플랫폼은 실험 비용을 낮춰 실험 문화를 촉진

## 8. 글로벌/크로스컬처 도메인 (Global)

> 기존 자산: kr/jp 멀티스키마, 글로벌 매칭, 번역 시스템, 한일 크로스 매칭

### 8-1. 언어 교환 매칭 (Language Exchange Match)

**핵심 가치: "연애뿐 아니라 언어 교환 친구도 찾을 수 있다"**

- 글로벌 매칭에 "언어 교환" 모드 추가 한국 유저 ↔ 일본 유저 간 언어 교환 목적의 매칭 대화 중 실시간 번역 지원 (기존 translation/ 모듈 활용)
- "오늘의 표현" 공유: 매일 1개 표현을 서로 가르쳐주기 미션 언어 교환에서 시작하여 로맨스로 전환되는 케이스 추적 → 자연스러운 전환

> **활용: global-matching.service.ts , translation/ , moment/ (미션 구조)**
> **KPI: 언어 교환 매칭 신청률, 교환 대화 지속률, 로맨스 전환율**

#### 심리학적 근거

- **접촉 가설 (Contact Hypothesis):** Allport(1954) The Nature of Prejudice에서 적절한 조건 하의 집단 간 접촉이 편견을 효과적으로 감소시킨다고 제시. 500개 이상의 후속 연구에서 검증 (Wikipedia - Contact
- Hypothesis)
- **Pettigrew의 확장 모델:** Pettigrew(1998)는 집단 간 접촉이 편견을 줄이는 4가지 매개 과정을 제시: (a) 외집단학습, (b) 행동 패턴 변화, (c) 감정적 유대 형성, (d) 내집단 재평가 (ResearchGate - Intergroup ContactTheory)
- **최적 접촉 조건:** 동등한 지위, 공동 목표, 집단 간 협력, 권위의 지지 → 언어 교환은 이 4가지를 자연스럽게 충족 (서로 배우는 대등한 관계, 언어 학습이라는 공동 목표) (Simply Psychology - Contact Hypothesis)

### 8-2. 크로스컬처 궁합 리포트 (Cross-Culture Chemistry)

**핵심 가치: "문화가 다른 사람과의 궁합을 특별하게 분석"**

- 한일 글로벌 매칭 시 문화 차이 기반 궁합 분석 추가 리포트
- "한국에서는 이런 게 보통인데, 일본에서는 이렇게 다를 수 있어요" → 문화 이해 카드 데이트 에티켓 차이 가이드: 시간 관념, 표현 방식, 식사 매너 등
- GPT-4 기반 문화 컨텍스트 맞춤 대화 조언 크로스컬처 매칭 성공 스토리 익명 공유

> **활용: match-reasons/ , llm-analysis.service.ts , global-matching/**
> **KPI: 크로스컬처 리포트 열람률, 글로벌 매칭 지속률, 문화 관련 불만 감소**

#### 심리학적 근거

- **문화 지능 (Cultural Intelligence, CQ):** Earley & Ang(2003)의 CQ 이론에서 문화적 차이를 이해하고 적응하는 능력이 이문화 관계 성공의 핵심 예측변수. 문화 이해 카드는 CQ의 인지적 요소를 강화
- **접촉 가설과 정보 제공:** Allport의 접촉 가설 확장에서 외집단에 대한 "학습(learning about outgroups)"이 편견 감소의 첫 번째 매개 과정. 문화 차이 가이드가 이 학습을 구조화 (Simply Psychology - Contact
- Hypothesis)
- **불확실성-불안 관리 이론:** Gudykunst(1993)의 AUM(Anxiety/Uncertainty Management) 이론에서 이문화커뮤니케이션의 불안과 불확실성을 관리하면 효과적 의사소통이 가능. 문화 컨텍스트 조언이 이 역할 수행

### 8-3. 여행자 매칭 (Traveler Match)

**핵심 가치: "여행 중 현지 대학생과 만날 수 있다"**

- 일시적으로 다른 국가의 매칭 풀에 참여 가능
- "2월 15일~20일 도쿄 여행" 등록 → 해당 기간 도쿄 매칭 풀에 편입 여행자 뱃지 표시: "한국에서 온 여행자" → 현지 유저에게 호기심 유발 현지 맛집/명소 추천을 매칭과 결합 → "이 사람이 좋아하는 장소로 데이트"
- 여행 기간 한정 매칭이므로 부담 적음 → 첫 글로벌 경험 진입장벽 하락

> **활용: global-matching.service.ts , region-cluster.service.ts , 기간 한정 로직 추가**
> **KPI: 여행자 매칭 등록률, 여행 중 만남 성사율, 귀국 후 연락 유지율**

#### 심리학적 근거

- **감각 추구 성향 (Sensation Seeking):** Zuckerman(1979)의 이론에서 새로운 자극을 추구하는 성향이 높은 사람이 여행, 새로운 경험, 새로운 사람과의 만남을 적극적으로 추구. 여행자는 이 성향이 높은 집단
- **일시성의 매력 (Temporal Scarcity):** Cialdini의 희소성 원리 변형. 기간 한정 매칭은 "지금 아니면 못한다"는 시간적 희소성을 만들어 행동을 촉진하면서도 장기적 부담은 감소
- **자기 확장과 여행:** Aron & Aron의 자기 확장 이론에서 새로운 환경과 사람은 자아 확장의 핵심 원천. 여행 중 현지인과의 만남은 최고 수준의 자기 확장 경험 (Wikipedia - Self-Expansion)

### 8-4. 멀티국가 캠퍼스 랭킹 (Global Campus Ranking)

**핵심 가치: "우리 학교가 글로벌에서 어디에 있는지"**

- 대학교별 활동 지수 글로벌 랭킹 공개 지표: 매칭 성사율, 모먼트 참여율, 평균 대화 길이, 만남 성사율 한국 대학 vs 일본 대학 비교 → 건전한 경쟁 + 소속감 학교별 이벤트: "이번 주 가장 활발한 캠퍼스 Top 3" → 추가 매칭 슬롯 보너스 신규 대학 유입 시 바이럴 효과: "우리 학교 순위를 올려보자"

> **활용: universities , matching-analytics.service.ts , stats.service.ts**
> **KPI: 캠퍼스 랭킹 조회수, 랭킹 공유 횟수, 신규 가입 대학별 추적**

#### 심리학적 근거

- **사회적 정체성 이론과 집단 간 경쟁:** Tajfel & Turner(1979)의 SIT에서 내집단 선호와 외집단 차별은 자존감 유지의 핵심 메커니즘. 대학 간 랭킹은 건전한 집단 간 경쟁을 통해 내집단 정체성을 강화 (Positive Psychology -Social Identity)
- **사회 비교와 동기부여:** Festinger(1954)의 이론에서 상향 비교(더 높은 순위 학교)는 동기 부여를, 하향 비교(더 낮은 순위)는 자존감 보호를 제공. 적절한 경쟁은 참여율을 높임 (Wikipedia - Social Comparison)
- **소속감과 집단 행동:** "우리 학교 순위를 올리자"는 집단 목표는 개인 활동에 사회적 의미를 부여하여 참여 동기를 강화. 사회적 촉진(social facilitation) 효과와 결합

### 8-5. 국가 확장 원클릭 프랜차이즈 (Country Expansion Kit)

**핵심 가치: "새 국가 진출을 기술적으로 즉시 지원"**

- 멀티스키마 아키텍처를 활용한 국가 확장 자동화 도구 신규 국가 추가 시: 스키마 생성 → 대학 DB 시드 → 기본 설정 → 매칭 파라미터 관리자 대시보드에서 국가별 운영 지표 통합 모니터링 국가별 커스터마이징: 매칭 알고리즘 가중치, 결제 수단, 인증 방식 기술이전 시 핵심 가치: "스키마 하나 추가만으로 새 국가 서비스 오픈"

> **활용: schema.middleware.ts , kr/ , jp/ 모듈 구조, Drizzle migration**
> **KPI: 신규 국가 런칭 소요 시간, 국가별 초기 DAU, 기술이전 계약 체결**

#### 심리학적 근거

- **네트워크 효과와 플랫폼 경제학:** 양면 시장(two-sided market) 이론에서 사용자 수 증가가 서비스 가치를 비선형적으로 향상시킴. 국가 확장은 매칭 풀 크기를 증가시켜 모든 사용자의 가치를 높임
- **규모의 경제와 학습 효과:** 2개국(kr/jp) 운영 경험에서 축적된 학습이 3번째 국가부터는 비용을 급격히 낮춤.
- Wright(1936)의 학습 곡선 이론과 연결
- **기술 수용 모델 (TAM):** Davis(1989)의 TAM에서 인지된 유용성(perceived usefulness)과 인지된 사용 용이성(perceived ease of use)이 기술 수용의 핵심. "원클릭 확장"은 사용 용이성을 극대화

## 기능 우선순위 매트릭스

### Phase 1 (즉시 착수, 0-3개월) -- 기존 자산 활용, 빠른 출시

| # | 기능 | 도메인 | 개발 복잡도 | 사업 임팩트 | 비고 |
|---|------|--------|------------|-----------|------|
| 1 | AI 아이스브레이커 | 채팅 | S | 높음 | 니즈 #2 (부담 없이 먼저 말 걸기) |
| 2 | 캠퍼스 안전 코호트 | 안전 | S | 높음 | Kano 만족계수 1.00 |
| 3 | 궁합 프리뷰 | 매칭 | S | 높음 | KS-QFD P0-PRECHECK |
| 4 | 성격 뱃지 시스템 | 모먼트 | S | 중간 | 모먼트 참여 동기 강화 |
| 5 | 환불형 좋아요 | 결제 | S | 중간 | 좋아요 품질 향상 |
| 6 | 주간 매칭 인사이트 리포트 | AI | M | 높음 | 리텐션 핵심 |
| 7 | 활동 보상 시스템 | 결제 | M | 높음 | DAU 향상 |

### Phase 2 (3-9개월) -- 차별화 기능

| # | 기능 | 도메인 | 개발 복잡도 | 사업 임팩트 |
|---|------|--------|------------|-----------|
| 8 | Serendipity Mode | 매칭 | M | 높음 |
| 9 | Real-meet Score | 매칭 | L | 매우 높음 |
| 10 | 대화 안전 넛지 | 채팅 | M | 높음 |
| 11 | TrustScore | 안전 | L | 매우 높음 |
| 12 | AI 데이트 코치 | AI | L | 높음 |
| 13 | 프로필 A/B 테스트 | 프로필 | M | 중간 |
| 14 | 커플 모먼트 | 모먼트 | M | 중간 |
| 15 | 데이트 안심 체크인 | 안전 | M | 높음 |

### Phase 3 (9-18개월) -- 플랫폼 확장

| # | 기능 | 도메인 | 개발 복잡도 | 사업 임팩트 |
|---|------|--------|------------|-----------|
| 16 | 시간 제한 매칭 | 매칭 | M | 높음 |
| 17 | 지연 공개 프로필 | 프로필 | L | 높음 |
| 18 | 구슬 구독 패스 | 결제 | L | 매우 높음 |
| 19 | 언어 교환 매칭 | 글로벌 | M | 중간 |
| 20 | 여행자 매칭 | 글로벌 | M | 중간 |

### 전략 로드맵과의 정렬

| 로드맵 Phase | 핵심 테마 | 대응 신규 기능 |
|-------------|----------|---------------|
| Phase 1: 신뢰의 기반 | 안전하니까 쓴다 | 캠퍼스 안전 코호트, TrustScore, 대화 안전 넛지, 데이트 안심 체크인 |
| Phase 2: 경험의 확장 | 여기서만 가능한 경험 | Serendipity Mode, Real-meet Score, 커플 모먼트, AI 데이트 코치, 시간 제한 매칭 |
| Phase 3: 데이터의 수확 | 데이터가 돈이 된다 | A/B 테스트 플랫폼, 주간 매칭 인사이트, 국가 확장 Kit, 크로스컬처 리포트 |

### 핵심 심리학 이론 요약

| 이론 | 연구자(년도) | 핵심 개념 | 적용 기능 |
|------|------------|----------|----------|
| 사회적 침투 이론 | Altman & Taylor (1973) | 관계는 표면->심층 자기 노출의 단계를 거침 | 지연 공개, 대화 리듬, 커플 모먼트 |
| 불확실성 감소 이론 | Berger & Calabrese (1975) | 낯선 사람 간 불확실성 감소가 호감 증가로 | 궁합 프리뷰, AI 아이스브레이커 |
| 단순 노출 효과 | Zajonc (1968) | 반복 노출이 호감을 증가시킴 (r=0.26) | 매칭 리플레이 |
| 근접성 원리 | Festinger, Schachter & Back (1950) | 물리적 근접성이 관계 형성의 핵심 | Real-meet Score |
| 희소성 원리 | Cialdini (1984) | 희소한 것의 가치가 높게 인식됨 | 시간 제한 매칭, 환불형 좋아요 |
| 손실 회피 | Kahneman & Tversky (1979) | 손실의 고통이 이익의 쾌감보다 2배 | 시간 제한 매칭, 환불형 좋아요, 구독 패스 |
| 넛지 이론 | Thaler & Sunstein (2008) | 선택 설계로 행동을 자유롭게 유도 | 대화 안전 넛지 |
| 자기 확장 이론 | Aron & Aron (1986) | 공동 활동이 관계 품질을 향상 | 2인 협동 미션, 여행자 매칭 |
| 자기결정 이론 | Deci & Ryan (1985) | 자율성/유능감/관계성이 내재적 동기의 핵심 | 성격 뱃지, 활동 보상 |
| 사회 비교 이론 | Festinger (1954) | 타인과 비교하여 자기를 평가하는 동인 | 캠퍼스 트렌드, 캠퍼스 랭킹, 주간 인사이트 |
| 사회적 증거 | Cialdini (1984) | 타인의 행동/평가가 의사결정에 영향 | 프렌드 보증 리뷰 |
| 호혜성 규범 | Gouldner (1960) | 선물/도움에 보답하려는 보편적 규범 | 구슬 선물하기 |
| 조작적 조건화 | Skinner (1957) | 변동 비율 강화가 최고 반응률 | 활동 보상 시스템 |
| 접촉 가설 | Allport (1954) | 적절한 집단 간 접촉이 편견 감소 | 언어 교환 매칭, 크로스컬처 리포트 |
| 절차적 공정성 | Tyler & Lind (1988) | 절차의 공정성이 결과 수용에 더 큰 영향 | 투명한 가이드라인 |
| 성장 마인드셋 | Dweck (2006) | 능력은 노력으로 발전 가능하다는 믿음 | 연애 성장 저널, 프로필 A/B |
| 인상 관리 | Goffman (1959) | 무대 위/뒤 구분을 통한 자기 표현 관리 | 캠퍼스 안전 코호트, 매력 포인트 |
| 매슬로우 욕구 위계 | Maslow (1943) | 안전 욕구는 기본적 욕구 중 2번째 | TrustScore, 데이트 안심 체크인 |

> **총 8개 도메인 x 5개 = 40개 신규 기능 기획**
> 기존 기술 자산(벡터 매칭, Big5, GPT-4, 멀티스키마)을 최대한 활용하여 개발 비용 최소화

---

## 참고문헌 (References)

### 핵심 심리학 이론
사회적 증거
Cialdini (1984)
타인의 행동/평가가 의사결정에
영향
프렌드 보증 리뷰
호혜성 규범
Gouldner (1960)
선물/도움에 보답하려는 보편적
규범
구슬 선물하기
조작적 조건
화
Skinner (1957)
변동 비율 강화가 최고 반응률
활동 보상 시스템
접촉 가설
Allport (1954)
적절한 집단 간 접촉이 편견 감소
언어 교환 매칭, 크로스컬처 리포트
절차적 공정
성
Tyler & Lind (1988)
절차의 공정성이 결과 수용에 더
큰 영향
투명한 가이드라인
성장 마인드
셋
Dweck (2006)
능력은 노력으로 발전 가능하다
는 믿음
연애 성장 저널, 프로필 A/B
인상 관리
Goffman (1959)
무대 위/뒤 구분을 통한 자기 표
현 관리
캠퍼스 안전 코호트, 매력 포인트
매슬로우 욕
구 위계
Maslow (1943)
안전 욕구는 기본적 욕구 중 2번
째
TrustScore, 데이트 안심 체크인

### 웹 리서치 출처
- Psychology Today - Serendipity
- Comunello et al. (2020) - Relational Filter Bubbles
- Ross (2024) - Accidental Thinking, SAGE
- Festinger et al. (1950) - Westgate Studies
- Zajonc (1968) - Mere Exposure, ISR UMich
- Bornstein (1989) - Meta-analysis r=0.26
- Reis et al. (2011) - Familiarity in Live Interaction
- Berger & Calabrese (1975) - URT
- Kahneman & Tversky (1979) - Prospect Theory
- Cialdini (1984) - Influence: Science and Practice
- Thaler & Sunstein (2008) - Nudge
- Altman & Taylor (1973) - Social Penetration Theory
- Hughes et al. - Voice Attractiveness
- PMC (2022) - Vocal Attractiveness and Cooperation
- Aron et al. (2000) - Shared Novel Activities
- Aron & Aron (2022) - Self-Expansion Updated Review
- Deci & Ryan - SDT & Gamification Meta-analysis
- Dweck (2006) - Growth Mindset
- Gouldner (1960) - Reciprocity Norm
- Frontiers (2022) - Social Exchange Theory Review
- Skinner - Variable Ratio Reinforcement
- Kahneman et al. (1990) - Endowment Effect
- Goffman (1959) - Online Self-Presentation
- Ellison et al. (2006) - Online Dating Self-Presentation
- Tyler & Lind - Procedural Justice
- ScienceDirect (2024) - AI Relationship Counselling
- Frontiers (2024) - AI vs Human Coaches
- Allport (1954) - Contact Hypothesis
- Pettigrew (1998) - Intergroup Contact Theory
- Maslow (1943) - Hierarchy of Needs
- ContextSDK - Push Notification Psychology
- PLoS One (2017) - Notification Timing Study
- Fraud.com - Anomaly Detection
- LexisNexis - Behavioral Biometrics
