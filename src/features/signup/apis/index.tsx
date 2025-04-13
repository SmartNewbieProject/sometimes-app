import { axiosClient } from "@/src/shared/libs";

export const getUnivs = async (): Promise<string[]> => {
  return axiosClient.get('/universities');
};

type Service = {
  getUnivs: () => Promise<string[]>;
}

const apis: Service = {
  getUnivs,
};

export default apis;
