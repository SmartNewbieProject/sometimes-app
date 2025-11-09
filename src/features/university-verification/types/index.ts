export interface User {
  profileId: string;
  id: string;
  name: string;
  /** @deprecated 하위 호환성을 위해 유지. */
  role?: string;
  roles?: string[];
}
