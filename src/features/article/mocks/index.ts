import {
	type Article,
	type ArticleListItem,
	ArticleCategory,
	ArticleStatus,
	MediaType,
} from '../types';

const MOCK_AUTHOR = {
	id: 'admin-001',
	name: '썸타임 팀',
	avatar: 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/logo.png',
	role: '콘텐츠 에디터',
};

const createMockThumbnail = (index: number) => ({
	type: MediaType.IMAGE,
	url: `https://picsum.photos/seed/article${index}/800/600`,
	alt: `아티클 ${index} 썸네일`,
	width: 800,
	height: 600,
	duration: null,
	mimeType: 'image/jpeg',
});

const createMockCover = (index: number) => ({
	type: MediaType.IMAGE,
	url: `https://picsum.photos/seed/cover${index}/1920/1080`,
	alt: `아티클 ${index} 커버`,
	width: 1920,
	height: 1080,
	duration: null,
	mimeType: 'image/jpeg',
});

// 마크다운 콘텐츠 샘플
const MOCK_CONTENT_STORY = `# 첫 만남

대학교 3학년이던 2023년 봄, **민수**님은 친구의 추천으로 썸타임을 설치했습니다.

> "처음엔 반신반의했어요. 근데 지영이 프로필을 보는 순간, 이 사람이다 싶었죠."

## 운명 같은 매칭

![첫 데이트 카페](https://picsum.photos/seed/date1/800/500)

두 사람은 학교 근처 카페에서 처음 만났습니다. 3시간이 넘는 대화 끝에 둘 다 "또 만나고 싶다"는 생각을 했다고 해요.

:::tip
첫 데이트는 가벼운 카페에서 시작하는 것을 추천해요! 대화에 집중할 수 있거든요.
:::

---

## 1년 후, 결혼을 앞두고

연애 1년 만에 프로포즈를 했습니다. 지영님은 "예상은 했지만 막상 들으니 눈물이 났다"고 전했어요.

1. 서로를 알아가는 시간
2. 부모님 상견례
3. 프로포즈

> "썸타임이 없었다면 우리는 만나지 못했을 거예요. 진심으로 감사해요."

---

썸타임은 앞으로도 진정성 있는 만남을 응원합니다.
`;

const MOCK_CONTENT_SAFETY = `# 썸타임의 안전 정책

썸타임은 **안전한 만남**을 최우선으로 생각합니다.

## 본인 인증 시스템

모든 사용자는 다음 인증을 완료해야 합니다:

- 휴대폰 번호 인증
- 대학교 이메일 인증
- 프로필 사진 검수

:::info
프로필 사진은 AI와 운영팀이 함께 검수하여 부적절한 사진을 차단합니다.
:::

## 신고 및 차단 시스템

불쾌한 경험이 있다면 즉시 신고해 주세요.

1. 프로필 > 신고하기 버튼 클릭
2. 신고 사유 선택
3. 24시간 내 운영팀 검토

:::warning
허위 신고는 본인 계정에 불이익이 있을 수 있습니다.
:::

---

## 안전한 데이트 가이드

- 첫 만남은 **공공장소**에서
- 친구나 가족에게 **일정 공유**
- 불편하면 **언제든 자리를 피해도** 괜찮아요

썸타임은 여러분의 안전한 연애를 응원합니다.
`;

const MOCK_CONTENT_TIPS = `# 프로필 사진, 이렇게 찍으세요

매칭률을 높이는 프로필 사진 팁을 알려드릴게요.

## 얼굴이 잘 보이는 사진

:::tip
얼굴이 50% 이상 나오는 사진이 좋아요. 선글라스나 마스크는 피해주세요.
:::

## 자연스러운 미소

![자연스러운 미소 예시](https://picsum.photos/seed/smile/800/500)

억지 미소보다 **자연스러운 표정**이 훨씬 좋은 인상을 줍니다.

## 취미 활동 사진

자신의 취미를 보여주는 사진도 좋아요:

- 운동하는 모습
- 여행 중인 사진
- 좋아하는 카페에서의 일상

---

> "프로필 사진을 바꾸고 나서 매칭이 3배 늘었어요!" - 실제 유저 후기

지금 바로 프로필 사진을 업데이트해 보세요!
`;

// Mock 아티클 상세 데이터
export const MOCK_ARTICLES: Article[] = [
	{
		id: '550e8400-e29b-41d4-a716-446655440001',
		slug: 'our-first-couple-story',
		status: ArticleStatus.PUBLISHED,
		category: ArticleCategory.STORY,
		publishedAt: '2025-01-15T09:00:00Z',
		createdAt: '2025-01-10T14:30:00Z',
		updatedAt: '2025-01-15T08:45:00Z',
		title: '썸타임에서 만난 우리, 1년 후 결혼합니다',
		subtitle: '민수님과 지영님의 이야기',
		content: MOCK_CONTENT_STORY,
		excerpt: '대학 시절 썸타임에서 처음 만난 두 사람이 1년간의 연애 끝에 결혼을 앞두고 있습니다.',
		thumbnail: createMockThumbnail(1),
		coverImage: createMockCover(1),
		author: MOCK_AUTHOR,
		viewCount: 1523,
		shareCount: 89,
		seo: {
			metaTitle: null,
			metaDescription: null,
			ogImage: null,
			keywords: ['커플', '성공사례', '대학생연애', '썸타임'],
		},
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440002',
		slug: 'sometime-safety-guide',
		status: ArticleStatus.PUBLISHED,
		category: ArticleCategory.SAFETY,
		publishedAt: '2025-01-10T09:00:00Z',
		createdAt: '2025-01-08T10:00:00Z',
		updatedAt: '2025-01-10T08:30:00Z',
		title: '썸타임의 안전 정책을 소개합니다',
		subtitle: '안전한 만남을 위한 우리의 노력',
		content: MOCK_CONTENT_SAFETY,
		excerpt: '썸타임은 본인 인증, 사진 검수, 신고 시스템을 통해 안전한 만남 환경을 제공합니다.',
		thumbnail: createMockThumbnail(2),
		coverImage: createMockCover(2),
		author: MOCK_AUTHOR,
		viewCount: 2341,
		shareCount: 156,
		seo: {
			metaTitle: '썸타임 안전 가이드',
			metaDescription: '안전한 데이팅을 위한 썸타임의 정책을 알아보세요',
			ogImage: null,
			keywords: ['안전', '본인인증', '신고', '데이팅앱'],
		},
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440003',
		slug: 'profile-photo-tips',
		status: ArticleStatus.PUBLISHED,
		category: ArticleCategory.TIPS,
		publishedAt: '2025-01-05T09:00:00Z',
		createdAt: '2025-01-03T11:00:00Z',
		updatedAt: '2025-01-05T08:00:00Z',
		title: '매칭률 3배 높이는 프로필 사진 꿀팁',
		subtitle: '사진 전문가가 알려주는 팁',
		content: MOCK_CONTENT_TIPS,
		excerpt: '프로필 사진 하나로 매칭률이 달라집니다. 전문가가 알려주는 사진 팁을 확인하세요.',
		thumbnail: createMockThumbnail(3),
		coverImage: createMockCover(3),
		author: MOCK_AUTHOR,
		viewCount: 4521,
		shareCount: 312,
		seo: {
			metaTitle: null,
			metaDescription: null,
			ogImage: null,
			keywords: ['프로필', '사진팁', '매칭률', '데이팅'],
		},
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440004',
		slug: 'meet-sometime-team',
		status: ArticleStatus.PUBLISHED,
		category: ArticleCategory.TEAM,
		publishedAt: '2024-12-20T09:00:00Z',
		createdAt: '2024-12-18T14:00:00Z',
		updatedAt: '2024-12-20T08:30:00Z',
		title: '썸타임을 만드는 사람들',
		subtitle: '팀 비하인드 스토리',
		content: `# 안녕하세요, 썸타임 팀입니다

저희는 **진정성 있는 만남**을 만들기 위해 매일 노력하고 있어요.

## 우리 팀은요

- 개발팀 5명
- 디자인팀 2명
- 운영팀 3명

:::info
모든 팀원이 썸타임 유저이기도 해요!
:::

앞으로도 더 좋은 서비스로 찾아뵐게요.
`,
		excerpt: '썸타임 팀을 소개합니다. 진정성 있는 만남을 위해 노력하는 사람들의 이야기.',
		thumbnail: createMockThumbnail(4),
		coverImage: createMockCover(4),
		author: MOCK_AUTHOR,
		viewCount: 891,
		shareCount: 45,
		seo: {
			metaTitle: null,
			metaDescription: null,
			ogImage: null,
			keywords: ['팀소개', '비하인드', '썸타임팀'],
		},
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440005',
		slug: 'interview-yuna',
		status: ArticleStatus.PUBLISHED,
		category: ArticleCategory.INTERVIEW,
		publishedAt: '2024-12-15T09:00:00Z',
		createdAt: '2024-12-13T10:00:00Z',
		updatedAt: '2024-12-15T08:00:00Z',
		title: '"썸타임 덕분에 용기를 냈어요" - 유나님 인터뷰',
		subtitle: '내성적인 성격도 괜찮아요',
		content: `# 유나님을 만나다

유나님은 스스로를 "극도로 내성적인 사람"이라고 소개했어요.

> "오프라인에서 먼저 말 걸기가 정말 어려웠어요. 썸타임에서는 채팅으로 먼저 알아갈 수 있어서 좋았어요."

## 첫 매칭의 기억

:::tip
유나님의 팁: "관심사가 비슷한 사람에게 먼저 대화를 걸어보세요!"
:::

지금은 썸타임에서 만난 분과 행복하게 연애 중이시래요.
`,
		excerpt: '내성적인 성격의 유나님이 썸타임을 통해 용기를 내고 사랑을 찾은 이야기.',
		thumbnail: createMockThumbnail(5),
		coverImage: createMockCover(5),
		author: MOCK_AUTHOR,
		viewCount: 1234,
		shareCount: 67,
		seo: {
			metaTitle: null,
			metaDescription: null,
			ogImage: null,
			keywords: ['인터뷰', '유저스토리', '내성적', '연애'],
		},
	},
];

// Mock 리스트 아이템 (경량 버전)
export const MOCK_ARTICLE_LIST: ArticleListItem[] = MOCK_ARTICLES.map((article) => ({
	id: article.id,
	slug: article.slug,
	status: article.status,
	category: article.category,
	publishedAt: article.publishedAt,
	title: article.title,
	subtitle: article.subtitle,
	excerpt: article.excerpt,
	thumbnail: article.thumbnail,
	author: article.author,
	viewCount: article.viewCount,
}));

// 아티클 ID 또는 slug로 찾기
export const findArticleByIdOrSlug = (idOrSlug: string): Article | undefined => {
	return MOCK_ARTICLES.find((article) => article.id === idOrSlug || article.slug === idOrSlug);
};

// 카테고리별 필터링
export const filterArticlesByCategory = (category?: ArticleCategory): ArticleListItem[] => {
	if (!category) return MOCK_ARTICLE_LIST;
	return MOCK_ARTICLE_LIST.filter((article) => article.category === category);
};
