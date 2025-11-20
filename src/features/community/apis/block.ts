import axiosClient from "@/src/shared/libs/axios";
import { tryCatch } from "@/src/shared/libs";

export const blockUser = async (userId: string): Promise<void> => {
  return tryCatch(async () => {
    await axiosClient.post(`/user/${userId}/block`);
  });
};