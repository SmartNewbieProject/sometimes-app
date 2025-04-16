import { axiosClient } from "@shared/libs";

export const getMySimpleDetails = () => axiosClient.get('/api/user');
