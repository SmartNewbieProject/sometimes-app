import { axiosClient } from "@/src/shared/libs";

export const getMySimpleDetails = () => axiosClient.get('/api/user');
