export type AuthorizeSmsCode = {
  /**
   * 인증 보안용 고유키
   * @example 'sdjfdks-sdfsdfkl'
   */
  uniqueKey: string;

  /**
   * 인증번호
   * @example '123456'
   */
  authorizationCode: string;
}
