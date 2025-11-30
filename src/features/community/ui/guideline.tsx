import { View, StyleSheet } from "react-native";
import { Text } from '@shared/ui';
import { semanticColors } from '@/src/shared/constants/colors';

export const CommunityGuideline = () => (
  <View style={styles.container}>
    <Text style={styles.title}>썸타임 커뮤니티 이용 가이드라인</Text>
    <Text style={styles.content}>안녕하세요! 썸타임 커뮤니티에 오신 것을 환영합니다. </Text>
    <Text style={[styles.content, styles.bottomMargin]}>모두가 편안하고 즐겁게 소통할 수 있는 공간을 만들기 위해 아래 가이드라인을 준수해 주세요.</Text>
    <Text style={[styles.content, styles.sectionTitle]}>기본 규칙</Text>
    <Text style={styles.content}> 1. 상호 존중: 다른 회원의 의견과 관점을 존중해 주세요. 비방, 조롱, 혐오 발언은 삼가주세요.</Text>
    <Text style={styles.content}> 2. 개인정보 보호: 본인 또는 타인의 실명, 연락처, SNS ID 등 개인정보를 공개하지 마세요.</Text>
    <Text style={styles.content}> 3. 건전한 내용: 불법적이거나 선정적인, 폭력적인 내용의 게시글과 댓글은 작성하지 마세요.</Text>
    <Text style={styles.content}> 4. 광고 금지: 상업적 홍보나 광고성 콘텐츠는 게시하지 마세요.</Text>
    <Text style={[styles.content, styles.bottomMargin]}>게시글 작성 팁</Text>
    <Text style={styles.content}> ㆍ 제목은 내용을 잘 반영하도록 작성해 주세요.</Text>
    <Text style={styles.content}> ㆍ 다른 회원들에게 도움이 될 수 있는 정보나 경험을 공유해 보세요.</Text>
    <Text style={styles.content}> ㆍ 질문이나 고민이 있다면 구체적으로 작성하면 더 좋은 답변을 받을 수 있어요.</Text>
    <Text style={[styles.content, styles.bottomMargin]}> ㆍ 재미있는 데이트 장소나 활동을 공유하는 것도 좋아요!</Text>
    <Text style={[styles.content, styles.sectionTitle]}>신고 및 제재</Text>
    <Text style={styles.content}>가이드라인을 위반하는 게시글이나 댓글은 관리자에 의해 삭제될 수 있으며, 위반 정도에 따라 계정</Text>
    <Text style={styles.content}>이용이 제한될 수 있습니다. 부적절한 콘텐츠를 발견하시면 신고 기능을 통해 알려주세요.즐겁고 의미 있는 커뮤니티 활동 되세요!💕 </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
    paddingRight: 10,
  },
  title: {
    fontSize: 14,
    color: semanticColors.text.primary,
    opacity: 0.6,
    lineHeight: 17.6,
    paddingBottom: 9,
  },
  content: {
    fontSize: 12,
    color: semanticColors.text.primary,
    opacity: 0.6,
    lineHeight: 17.6,
    paddingBottom: 9,
  },
  bottomMargin: {
    paddingBottom: 26,
  },
  sectionTitle: {
    // Additional styling for section titles if needed
  },
});