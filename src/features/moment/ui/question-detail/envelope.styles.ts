import { StyleSheet, Dimensions } from 'react-native';
import colors from '@/src/shared/constants/colors';

const { width } = Dimensions.get('window');

export const envelopeStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  envelopeWrapper: {
    marginBottom: 40,
  },

  envelopeContainer: {
    width: 230,
    height: 130,
    // backgroundColor is handled by LinearGradient
    borderRadius: 16,
    shadowColor: colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightPurple,
    overflow: 'hidden', // Ensure gradient stays within bounds
  },

  envelopeFlap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100, // Fixed height for the flap area
    // backgroundColor is handled by Svg
    zIndex: 1,
  },

  heartButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.state.attention, // #F70A8D
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.moreLightPurple,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    zIndex: 10,
    borderWidth: 2,
    borderColor: colors.moreLightPurple,
  },

  touchText: {
    position: 'absolute',
    bottom: 16,
    fontSize: 10,
    fontWeight: '600',
    color: colors.brand.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.muted,
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  titleText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 32,
  },

  subtitleText: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // 애니메이션 관련 스타일
  envelopeGlow: {
    position: 'absolute',
    borderRadius: 20,
    shadowColor: colors.brand.secondary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4, // Controlled by Animated.View opacity
    shadowRadius: 40,
    elevation: 5, // Lower than envelopeContainer (10) to stay behind
    zIndex: 0,
  },
});

export const questionCardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 56,
    marginBottom: 32,
    shadowColor: colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.smooth,
    position: 'relative',
  },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.cardPurple,
    borderRadius: 12,
    marginBottom: 12,
  },

  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 30,
    marginBottom: 16,
  },

  highlightText: {
    color: colors.brand.primary,
    textDecorationLine: 'underline',
    textDecorationColor: colors.lightPurple,
    textDecorationStyle: 'solid',
  },

  toggleButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.moreLightPurple,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.smooth,
  },

  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
    marginLeft: 6,
  },
});

export const answerInputStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: colors.text.primary,
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.white,
    zIndex: 10,
  },

  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },

  activeStatusText: {
    color: colors.brand.primary,
  },

  inactiveStatusText: {
    color: colors.text.disabled,
  },

  aiInspirationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.cardPurple,
    borderRadius: 6,
    marginRight: 12,
  },

  aiButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand.primary,
    marginLeft: 4,
  },

  textInputContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 66, // 전송 버튼 공간 확보
    position: 'relative',
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    textAlignVertical: 'top',
    lineHeight: 46, // 48보다 2 작게 조정
    paddingTop: 1, // 1px 위에서 시작
    paddingBottom: 1, // 아래 여백
    includeFontPadding: false, // 기본 폰트 패딩 제거
  },

  optionsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },

  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },

  optionButtonSelected: {
    backgroundColor: colors.cardPurple,
    borderColor: colors.brand.primary,
    shadowColor: colors.brand.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  optionButtonUnselected: {
    backgroundColor: colors.white,
    borderColor: colors.border.default,
  },

  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionRadioSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },

  optionRadioUnselected: {
    borderColor: colors.border.default,
  },

  optionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    lineHeight: 24,
  },

  optionTextSelected: {
    color: colors.brand.primary,
  },

  optionTextUnselected: {
    color: colors.text.primary,
  },

  submitButton: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: colors.white,
    marginBottom: 36,
  },
});

export const sentStepStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  successCircle: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(128, 255, 128, 0.2)', // #80FF80 with opacity
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },

  successCircleGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(128, 255, 128, 0.3)',
    borderRadius: 50,
    opacity: 0.3,
  },

  titleText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },

  aiReplyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: colors.lightPurple,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  aiReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  aiReplyHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
    marginLeft: 8,
  },

  aiReplyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },

  gemIcon: {
    width: 24,
    height: 24,
  },

  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: colors.brand.primary,
    borderWidth: 0,
    borderRadius: 20,
    shadowColor: colors.brand.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});