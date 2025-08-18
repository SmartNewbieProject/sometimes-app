import { passLogin, passDevLogin } from "../apis";
import type { PassLoginResponse } from "@/src/auth/dto/pass-login.dto";
import {logger} from "@shared/libs";

const envDevelopment = process.env.NODE_ENV === "development";

export const loginByPass = async (impUid: string): Promise<PassLoginResponse> => {
  if (envDevelopment) {
    logger.debug("개발 환경에서 Pass 로그인 시도");
    return await passDevLogin();
  }

  if (!impUid) {
    throw new Error("impUid is required for Pass login");
  }
  return await passLogin(impUid);
};
