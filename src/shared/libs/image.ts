const S3_BASE_URL = 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources';


export enum ImageResources {
  TICKET = `${S3_BASE_URL}/ticket.png`,
  SMS_CHECK = `${S3_BASE_URL}/sms.png`,
  HIGH = `${S3_BASE_URL}/high.png`,
  NOTHING = `${S3_BASE_URL}/nothing.png`,
  SAME = `${S3_BASE_URL}/same.png`,
  UNDER = `${S3_BASE_URL}/under.png`,
  TERMS = `${S3_BASE_URL}/terms.png`,
  TIME_CARD_BG = `${S3_BASE_URL}/time-card-bg.png`,
  UNIVERSITY = `${S3_BASE_URL}/university.png`,
  DETAILS = `${S3_BASE_URL}/details.png`,
  IMAGE = `${S3_BASE_URL}/image.png`,
  PAPER_PLANE = `${S3_BASE_URL}/paper-plane.png`,
  PAPER_PLANE_WITHOUT_BG = `${S3_BASE_URL}/paper-plane-vanila.png`,
  UNIV_BADGE = `${S3_BASE_URL}/univ-badge.png`,
  BROKEN_SANDTIMER = `${S3_BASE_URL}/broken.png`,
  SANDTIMER = `${S3_BASE_URL}/sand-clock.png`,
  HEART = `${S3_BASE_URL}/heart.png`,
  INSTAGRAM = `${S3_BASE_URL}/instagram.png`,
  HEART_ON = `${S3_BASE_URL}/heart-on.png`,
  MENU = `${S3_BASE_URL}/menu.png`,
  COMMUNITY_LOGO = `${S3_BASE_URL}/community.png`,
  PURPLE_ARROW_RIGHT = `${S3_BASE_URL}/purple-arrow-right.png`,
  REPORT = `${S3_BASE_URL}/report.png`,
  REMATCHING_TICKET_BANNER = `${S3_BASE_URL}/payment-bg.png`,
  GEM_STORE_BANNER = `${S3_BASE_URL}/gem-store-preview.png`,
  GEM = `${S3_BASE_URL}/gem.png`,
  WHITE_HEART = `${S3_BASE_URL}/white_heart.png`,

  DATING_STYLE = `${S3_BASE_URL}/dating-style.png`,
  MILITARY = `${S3_BASE_URL}/military.png`,

  DISAPPEAR_FOX = `${S3_BASE_URL}/disappear_fox.png`,
  PLITE_FOX = `${S3_BASE_URL}/polite_fox.png`,

  ANNOUNCEMENT_ALERT = `${S3_BASE_URL}/announcement-alert.png`,

  // Pre-signup 페이지 이미지
  PRE_SIGNUP_CHARACTER = `${S3_BASE_URL}/pre-signup-character.png`,
  INITIAL_CAMPUS_CARD = `${S3_BASE_URL}/initial_campus_card.png`,
  INITIAL_MATCHING_CARD = `${S3_BASE_URL}/initial_matching_card.png`,
  SWITCH_MATCHING_CARD = `${S3_BASE_URL}/switch_matching_card.png`,
  SWITCH_CAMPUS_CARD = `${S3_BASE_URL}/switch_campus_card.png`,
  INITIAL_PARTICIPANT_CARD = `${S3_BASE_URL}/initial_participant_card.png`,
  SWITCH_PARTICIPANT_CARD = `${S3_BASE_URL}/switch_participant_card.png`,

  SALE_MIHO = `${S3_BASE_URL}/miho-with-gem.png`,
  FIRST_SALE = `${S3_BASE_URL}/first_sale.png`,

  // MBTI 이미지
  ENFJ = `${S3_BASE_URL}/ENFJ.png`,
  ENFP = `${S3_BASE_URL}/ENFP.png`,
  ENTJ = `${S3_BASE_URL}/ENTJ.png`,
  ENTP = `${S3_BASE_URL}/ENTP.png`,
  ESFJ = `${S3_BASE_URL}/ESFJ.png`,
  ESFP = `${S3_BASE_URL}/ESFP.png`,
  ESTJ = `${S3_BASE_URL}/ESTJ.png`,
  ESTP = `${S3_BASE_URL}/ESTP.png`,
  INFJ = `${S3_BASE_URL}/INFJ.png`,
  INFP = `${S3_BASE_URL}/INFP.png`,
  INTJ = `${S3_BASE_URL}/INTJ.png`,
  INTP = `${S3_BASE_URL}/INTP.png`,
  ISFJ = `${S3_BASE_URL}/ISFJ.png`,
  ISFP = `${S3_BASE_URL}/ISFP.png`,
  ISTJ = `${S3_BASE_URL}/ISTJ.png`,
  ISTP = `${S3_BASE_URL}/ISTP.png`,

  // 매칭 관련 이미지
  AGE = `${S3_BASE_URL}/age.png`,
  ARMY = `${S3_BASE_URL}/army.png`,
  BEER = `${S3_BASE_URL}/beer.png`,
  SMOKE = `${S3_BASE_URL}/smoke.png`,
  TATOO = `${S3_BASE_URL}/tatoo.png`,
}

const imageUtils = {
  /**
   * 이미지 리소스 URL 반환
   * @param resource 이미지 리소스 열거형
   * @returns 이미지 URL
   */
  get: (resource: ImageResources) => resource,

  getByFilename: (filename: string) => `${S3_BASE_URL}/${filename}`,

  getBaseUrl: () => S3_BASE_URL,
};

export default imageUtils;
