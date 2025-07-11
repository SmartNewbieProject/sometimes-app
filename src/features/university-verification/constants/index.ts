export const MESSAGES = {
  EMAIL_REQUIRED: "이메일을 입력해주세요.",
  FIELDS_REQUIRED: "이메일과 인증번호를 모두 입력해주세요.",
  CODE_SENT: "인증번호가 전송되었습니다.",
  VERIFICATION_SUCCESS: "이메일 인증이 완료되었습니다.",
  VERIFICATION_FAILED: "인증번호가 일치하지 않아요",
  USER_INFO_ERROR: "사용자 정보를 불러올 수 없습니다.",
  NOT_VERIFIED: "아직 인증이 되지 않았어요. 먼저 이메일 인증을 완료해주세요.",
} as const;

export const UI_CONSTANTS = {
  VERIFICATION_CODE_MAX_LENGTH: 6,
} as const;
