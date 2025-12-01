export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  /** @deprecated 하위 호환성을 위해 유지.*/
  role?: "user" | "admin" | "tester";
  roles?: ("user" | "admin" | "tester")[];
}
