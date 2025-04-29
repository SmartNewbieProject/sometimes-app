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
