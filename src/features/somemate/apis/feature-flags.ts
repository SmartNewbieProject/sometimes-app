import axiosClient from "@/src/shared/libs/axios";

export const checkSomemateEnabled = async (): Promise<{ enabled: boolean }> => {
  return axiosClient.get("/feature-flags/somemate");
};

