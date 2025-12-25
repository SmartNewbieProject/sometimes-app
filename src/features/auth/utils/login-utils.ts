import { passLogin, passDevLogin } from "../apis";
import type { PassLoginResponse } from "@/src/auth/dto/pass-login.dto";
import {logger} from "@shared/libs";

export const loginByPass = async (impUid: string): Promise<PassLoginResponse> => {
  if (__DEV__) {
    logger.debug("개발 환경에서 Pass 로그인 시도");
    return await passDevLogin();
  }

  if (!impUid) {
    throw new Error("impUid is required for Pass login");
  }
  return await passLogin(impUid);
};
