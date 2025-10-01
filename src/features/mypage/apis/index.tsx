import { axiosClient, fileUtils, platform } from "@/src/shared/libs";
import { nanoid } from "nanoid";
import type { Article as ArticleType } from "@/src/features/community/types";
type RematchingTicket = { total: number };
type MyRematchingTicket = { id: number; name: string };
export type MyArticle = ArticleType;

export type MatchingFilters = {
  avoidUniversity: boolean;
  avoidDepartment: boolean;
};

export type Mbti = { mbti: string | null };

export type MyComment = {
  id: string;
  content: string;
  createdAt: string;
  article: ArticleType;
};

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

const getMyRematchingTicket = async (): Promise<MyRematchingTicket[]> => {
  const { data } = await axiosClient.get<MyRematchingTicket[]>(
    "/tickets/rematching"
  );

  return data;
};

const getAllRematchingTicket = async (): Promise<RematchingTicket> => {
  const myRematchingTickets = await getMyRematchingTicket();

  return { total: myRematchingTickets.length };
};

const getMbti = async (): Promise<Mbti> => {
  const { data } = await axiosClient.get<Mbti>("/profile/mbti");

  return data;
};

const updateMbti = async (mbti: string): Promise<void> => {
  await axiosClient.patch("/profile/mbti", { mbti });
};

const getCurrentMatchingFilters = async (): Promise<MatchingFilters> => {
  const { data } = await axiosClient.get<MatchingFilters>("/profile/filter");

  return data;
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

  await axiosClient.post("/profile/images", formData, {
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
};

const mypageApis: MyPageApis = {
  async getMyArticles({ page, size }) {
    const { data } = await axiosClient.get<PageResp<MyArticle>>(
      "/articles/my-articles",
      { params: { page, size } }
    );

    const items = Array.isArray(data.content) ? data.content : [];

    const meta = {
      currentPage: Number(data.page ?? page),

      itemsPerPage: Number(data.size ?? size),

      totalItems: Number((data as any).totalItems ?? items.length),

      hasNextPage: Boolean(
        (data as any).hasNext ?? items.length >= (data.size ?? size)
      ),

      hasPreviousPage: Boolean(
        (data as any).hasPreviousPage ?? Number(data.page ?? page) > 1
      ),
    };

    const normalized: ItemsMetaPage<MyArticle> = { items, meta };

    return normalized;
  },

  async getMyComments({ page, size }) {
    const { data } = await axiosClient.get<PageResp<MyComment>>(
      "/articles/my-commented-articles",
      { params: { page, size } }
    );

    const items = Array.isArray(data.content) ? data.content : [];

    const meta = {
      currentPage: Number(data.page ?? page),

      itemsPerPage: Number(data.size ?? size),

      totalItems: Number((data as any).totalItems ?? items.length),

      hasNextPage: Boolean(
        (data as any).hasNext ?? items.length >= (data.size ?? size)
      ),

      hasPreviousPage: Boolean(
        (data as any).hasPreviousPage ?? Number(data.page ?? page) > 1
      ),
    };

    const normalized: ItemsMetaPage<MyComment> = { items, meta };

    return normalized;
  },
};

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
