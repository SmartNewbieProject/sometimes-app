export const MESSAGES = {
  EMAIL_REQUIRED: "이메일을_입력해주세요",
  FIELDS_REQUIRED: "이메일과_인증번호를_모두_입력해주세요",
  CODE_SENT: "인증번호가_전송되었습니다",
  VERIFICATION_SUCCESS: "이메일_인증이_완료되었습니다",
  VERIFICATION_FAILED: "인증번호가_일치하지_않아요",
  USER_INFO_ERROR: "사용자_정보를_불러올_수_없습니다",
  NOT_VERIFIED: "아직_인증이_되지_않았어요_먼저_이메일_인증을_완료해",
} as const;

export const UI_CONSTANTS = {
  VERIFICATION_CODE_MAX_LENGTH: 6,
} as const;
