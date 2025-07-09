import { axiosClient } from "@/src/shared/libs";
import type { Preferences } from "../../my-info/api";

interface TotalMatchCountResponse {
  count: number;
}

export type Notification = {
  announcement: string;
  title: string;
  content: string;
  redirectUrl?: string;
  okMessage: string;
};

export const getTotalMatchCount = (): Promise<TotalMatchCountResponse> =>
  axiosClient.get("/matching/total-count");

export const getNotification = (): Promise<Notification[]> =>
  axiosClient.get("/profile/notifications");

export const checkPreferenceFill = async (): Promise<boolean> =>
  axiosClient.get("/preferences/check/fill");

export const getTotalUserCount = (): Promise<number> =>
  axiosClient.get("/stats/total-user-count");

export const getPreferencesSelf = async (): Promise<Preferences[]> =>
  axiosClient.get("/preferences/self");

type HomeApiService = {
  getTotalMatchCount: () => Promise<TotalMatchCountResponse>;
  checkPreferenceFill: () => Promise<boolean>;
  getTotalUserCount: () => Promise<number>;
  getNotification: () => Promise<Notification[]>;
  getPreferencesSelf: () => Promise<Preferences[]>;
};

const apis: HomeApiService = {
  getTotalMatchCount,
  checkPreferenceFill,
  getTotalUserCount,
  getNotification,
  getPreferencesSelf,
};

export default apis;
