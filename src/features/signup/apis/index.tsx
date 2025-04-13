import { axiosClient } from "@/src/shared/libs";

export const getUnivs = async (): Promise<string[]> => {
  return axiosClient.get('/universities');
};

export const getDepartments = async (univ: string): Promise<string[]> => {
  return axiosClient.get(`/universities/departments?university=${univ}`);
};

type Service = {
  getUnivs: () => Promise<string[]>;
  getDepartments: (univ: string) => Promise<string[]>;
}

const apis: Service = {
  getUnivs,
  getDepartments,
};

export default apis;
