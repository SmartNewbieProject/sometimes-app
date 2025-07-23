export type MatchingHistoryList = {
  text: string;
};

export type MatchingDetail = {
  text: string;
};

/**
 *@figma https://www.figma.com/design/utH1DTiDrKT9rymvBPUIJ6/SMART-NEWBIE?node-id=5160-21442&t=72UgNC4PhzF20wST-4
 * 각 카드에 필요한 데이터를 응답합니다.
 *blinded 가 true 인 경우 프로필 풀기 및 잠금처리해주세요.
 * 프로필 풀기같은경우는 준비중 기능으로.. 아쉽지만.
 * 이미지는 imageUrl 에서 blinded 가 true 면 알아서 블러처리된 이미지로 응답이됩니다.
 */
export type MatchingHistoryDetails = {
  matchId: string;
  blinded: boolean;
  partnerId: string;
  imageUrl: string;
  age: number;
  mbti: string;
  universityName: string;
  universityAuthentication: boolean;
}

/**
 * 이전내역 매칭 조회 API 응답 구조
 */
export type MatchHistoryDetailsResponse = {
  histories: MatchingHistoryDetails[];
}

/**
 * @figma https://www.figma.com/design/utH1DTiDrKT9rymvBPUIJ6/SMART-NEWBIE?node-id=5242-20925&t=72UgNC4PhzF20wST-4
 * 나를 선택한 사용자들의 얼굴 사진을 미리볼 수 있게끔 기획을 우회하였습니다.
 * 각 사용자들의 이미지 url 정보만 리스트로 전달드릴게요. 렌더링만 부탁드리며 해당 요소 Press 시 이전 내역으로 Redirect.
 */
export type PreviewMatchingHistory = {
  imageUrls: string[];
}
