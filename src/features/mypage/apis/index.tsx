import { axiosClient, fileUtils, platform } from "@/src/shared/libs";
import { nanoid } from "nanoid";
import type { Article as MyArticle } from "@/src/features/community/types";
import type { MyComment as MyComment } from "@/src/features/community/types";
import type { MyLike as MyLike } from "@/src/features/community/types";
type RematchingTicket = { total: number };
type MyRematchingTicket = { id: number; name: string };

export type MatchingFilters = {
  avoidUniversity: boolean;
  avoidDepartment: boolean;
};

export type Mbti = { mbti: string | null };

export type ProfileReviewStatus = "none" | "approved" | "rejected" | "pending";

export interface PageResp<T> {
  content: T[];
  page: number;
  size: number;
  hasNext: boolean;
}

export type ItemsMetaPage<T> = {
  items: T[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export interface ProfileImageReviewStatusResp {
  reviewStatus: ProfileReviewStatus;
  rejectionReason?: string | null;
}

function extractPayload(raw: any) {
  const lvl1 = raw?.data ?? raw;
  const lvl2 =
    lvl1 && typeof lvl1 === "object" && "data" in lvl1 ? lvl1.data : lvl1;
  return lvl2 ?? lvl1;
}

const getMyRematchingTicket = async (): Promise<MyRematchingTicket[]> => {
  return await axiosClient.get("/tickets/rematching");
};

const getAllRematchingTicket = async (): Promise<RematchingTicket> => {
  const myRematchingTickets = await getMyRematchingTicket();

  return { total: myRematchingTickets.length };
};

const getMbti = async (): Promise<Mbti> => {
  return await axiosClient.get("/profile/mbti");
};

const updateMbti = async (mbti: string): Promise<void> => {
  await axiosClient.patch("/profile/mbti", { mbti });
};

const getCurrentMatchingFilters = async (): Promise<MatchingFilters> => {
  return await axiosClient.get("/profile/filter");
};

const updateAvoidUniversityFilter = async (flag: boolean): Promise<void> => {
  await axiosClient.patch("/profile/filter/avoid-university", { flag });
};

const updateAvoidDepartmentFilter = async (flag: boolean): Promise<void> => {
  await axiosClient.patch("/profile/filter/avoid-department", { flag });
};

const deleteProfileImage = async (imageId: string): Promise<void> => {
  await axiosClient.delete(`/profile/images/${imageId}`);
};

const createProfileFileObject = (imageUri: string, fileName: string) =>
  platform({
    web: () => {
      const blob = fileUtils.dataURLtoBlob(imageUri);
      return fileUtils.toFile(blob, fileName);
    },
    default: () =>
      ({
        uri: imageUri,
        name: fileName,
        type: "image/png",
      } as any),
  });

const uploadProfileImage = async (
  image: string,
  isMain: number
): Promise<void> => {
  const formData = new FormData();
  const file = createProfileFileObject(image, `profile-${nanoid(6)}.png`);

  formData.append("files", file);
  formData.append("isMain", String(isMain));

  await axiosClient.post("/profile/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const uploadProfileImages = async (images: string[]): Promise<void> => {
  const formData = new FormData();

  images
    .filter((image): image is string => !!image)
    .forEach((imageUri) => {
      const file = createProfileFileObject(
        imageUri,
        `profile-${nanoid(6)}.png`
      );
      formData.append("files", file);
    });

  formData.append("isMain", "0");

  await axiosClient.post("/v2/profile/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30000,
  });
};

export type MyPageApis = {
  getMyArticles: (args: {
    page: number;
    size: number;
  }) => Promise<ItemsMetaPage<MyArticle>>;

  getMyComments: (args: {
    page: number;
    size: number;
  }) => Promise<ItemsMetaPage<MyComment>>;

  getMyLike: (args: {
    page: number;
    size: number;
  }) => Promise<ItemsMetaPage<MyLike>>;
};

function normalizeItemsMetaPage<T>(
  data: any,
  fallback: { page: number; size: number }
): ItemsMetaPage<T> {
  if (data && Array.isArray(data.items) && data.meta) {
    const m = data.meta;
    return {
      items: data.items as T[],
      meta: {
        currentPage: Number(m.currentPage ?? fallback.page),
        itemsPerPage: Number(m.itemsPerPage ?? fallback.size),
        totalItems: Number(m.totalItems ?? data.items.length),
        hasNextPage: Boolean(m.hasNextPage ?? false),
        hasPreviousPage: Boolean(
          m.hasPreviousPage ?? Number(m.currentPage ?? fallback.page) > 1
        ),
      },
    };
  }

  if (data && Array.isArray(data.content)) {
    const items = data.content as T[];
    const page = Number(data.page ?? fallback.page);
    const size = Number(data.size ?? fallback.size);
    const hasNext = Boolean(data.hasNext ?? items.length >= size);
    return {
      items,
      meta: {
        currentPage: page,
        itemsPerPage: size,
        totalItems: Number(data.totalItems ?? items.length),
        hasNextPage: hasNext,
        hasPreviousPage: page > 1,
      },
    };
  }

  return {
    items: [],
    meta: {
      currentPage: fallback.page,
      itemsPerPage: fallback.size,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: fallback.page > 1,
    },
  };
}

const mypageApis: MyPageApis = {
  async getMyArticles({ page, size }) {
    const resp = await axiosClient.get<unknown>("/articles/my-articles", {
      params: { page, size },
    });
    const payload = extractPayload(resp);
    return normalizeItemsMetaPage<MyArticle>(payload as any, { page, size });
  },

  async getMyComments({ page, size }) {
    const resp = await axiosClient.get<unknown>(
      "/articles/my-commented-articles",
      {
        params: { page, size },
      }
    );
    const payload = extractPayload(resp);
    return normalizeItemsMetaPage<MyComment>(payload as any, { page, size });
  },

  async getMyLike({ page, size }) {
    const resp = await axiosClient.get<unknown>("/articles/my-liked-articles", {
      params: { page, size },
    });
    const payload = extractPayload(resp);
    return normalizeItemsMetaPage<MyLike>(payload as any, { page, size });
  },
};

export async function getProfileImageReviewStatus(): Promise<ProfileImageReviewStatusResp> {
  return await axiosClient.get("/profile/images/review-status");
}

export async function confirmProfileImageReview(): Promise<void> {
  await axiosClient.post("/profile/images/review/confirm");
}

type Service = {
  [x: string]: any;
  getMyRematchingTicket: () => Promise<MyRematchingTicket[]>;
  getAllRematchingTicket: () => Promise<RematchingTicket>;
  getMbti: () => Promise<Mbti>;
  updateMbti: (mbti: string) => Promise<void>;
  deleteProfileImage: (imageId: string) => Promise<void>;
  uploadProfileImage: (image: string, isMain: number) => Promise<void>;
  uploadProfileImages: (images: string[]) => Promise<void>;
  getCurrentMatchingFilters: () => Promise<MatchingFilters>;
  updateAvoidUniversityFilter: (flag: boolean) => Promise<void>;
  updateAvoidDepartmentFilter: (flag: boolean) => Promise<void>;
  mypageApis: MyPageApis;
};

const apis: Service = {
  getMyRematchingTicket,
  getAllRematchingTicket,
  getMbti,
  updateMbti,
  deleteProfileImage,
  uploadProfileImage,
  uploadProfileImages,
  getCurrentMatchingFilters,
  updateAvoidUniversityFilter,
  updateAvoidDepartmentFilter,
  mypageApis,
};

export default apis;
