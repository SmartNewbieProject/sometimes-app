import { axiosClient, fileUtils, platform } from "@/src/shared/libs";
import { nanoid } from "nanoid";

type RematchingTicket = {
  total: number;
};

type MyRematchingTicket = {
  id: number;
  name: string;
};

export type Mbti = {
  mbti: string | null;
};

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
  return await axiosClient.patch("/profile/mbti", { mbti });
};

// 프로필 이미지 삭제
const deleteProfileImage = async (imageId: string): Promise<void> => {
  return await axiosClient.delete(`/profile/images/${imageId}`);
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
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } as any),
  });

const uploadProfileImage = async (
  image: string,
  isMain: number
): Promise<void> => {
  const formData = new FormData();
  const file = createProfileFileObject(image, `profile-${nanoid(6)}.png`);

  formData.append("files", file);
  formData.append("isMain", isMain.toString());

  return axiosClient.post("/profile/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const uploadProfileImages = async (images: string[]): Promise<void> => {
  const formData = new FormData();

  // biome-ignore lint/complexity/noForEach: <explanation>
  images
    .filter((image) => image !== null)
    .forEach((imageUri) => {
      const file = createProfileFileObject(
        imageUri,
        `profile-${nanoid(6)}.png`
      );
      formData.append("files", file);
    });

  formData.append("isMain", "0");

  return axiosClient.post("/profile/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30000,
  });
};

type Service = {
  getMyRematchingTicket: () => Promise<MyRematchingTicket[]>;
  getAllRematchingTicket: () => Promise<RematchingTicket>;
  getMbti: () => Promise<Mbti>;
  updateMbti: (mbti: string) => Promise<void>;
  deleteProfileImage: (imageId: string) => Promise<void>;
  uploadProfileImage: (image: string, isMain: number) => Promise<void>;
  uploadProfileImages: (images: string[]) => Promise<void>;
};

const apis: Service = {
  getMyRematchingTicket,
  getAllRematchingTicket,
  getMbti,
  updateMbti,
  deleteProfileImage,
  uploadProfileImage,
  uploadProfileImages,
};

export default apis;
