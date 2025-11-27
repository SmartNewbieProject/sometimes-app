import {axiosClient} from "@/src/shared/libs";
import type {Preferences, SelectedPreferences} from "../../my-info/api";

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

export interface UniversityUpdateRequest {
  university: string,
  department: string;
  studentNumber: string,
  grade: string;
}

export const getTotalMatchCount = (): Promise<TotalMatchCountResponse> =>
    axiosClient.get("/matching/total-count");

export const getNotification = (): Promise<Notification[]> =>
    axiosClient.get("/profile/notifications");

export const checkPreferenceFill = async (): Promise<boolean> =>
    axiosClient.get("/preferences/check/fill");

export const getTotalUserCount = (): Promise<number> =>
    axiosClient.get("/stats/total-user-count");

export const getPreferencesSelf = async (): Promise<SelectedPreferences[]> =>
    axiosClient.get("/preferences/self");

export const checkExistsUniversity = (): Promise<boolean> =>
    axiosClient.get("/temporal/university/none");

export const updateUniversity = async (body: UniversityUpdateRequest) => {
  await axiosClient.put("/temporal/university", {...body})
};

export const checkBusan = (): Promise<boolean> =>
    axiosClient.get('/temporal/is-busan');

export interface HomeBanner {
  id: string;
  imageUrl: string | number;
  link?: string;
  externalLink?: string;
}

export const getHomeBanners = (): Promise<HomeBanner[]> =>
    axiosClient.get("/home/banners");

type HomeApiService = {
  getTotalMatchCount: () => Promise<TotalMatchCountResponse>;
  checkPreferenceFill: () => Promise<boolean>;
  getTotalUserCount: () => Promise<number>;
  getNotification: () => Promise<Notification[]>;
  getPreferencesSelf: () => Promise<SelectedPreferences[]>;
  checkExistsUniversity: () => Promise<boolean>;
  updateUniversity: (body: UniversityUpdateRequest) => Promise<void>;
  checkBusan: () => Promise<boolean>;
  getHomeBanners: () => Promise<HomeBanner[]>;
};

const apis: HomeApiService = {
  getTotalMatchCount,
  checkPreferenceFill,
  getTotalUserCount,
  getNotification,
  getPreferencesSelf,
  checkExistsUniversity,
  updateUniversity,
  checkBusan,
  getHomeBanners,
};

export default apis;
