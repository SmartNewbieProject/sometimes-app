import { axiosClient } from "@/src/shared/libs";


type MyPageProfile = {
    id: number;
    name: string;
    image: string[];
    university: {
        id: number;
        name: string;
        image: string;
    };
    gender: string;
}

type MyRematchingTicket = {
    id: number;
    name: string;
}

const getMyPageProfile = async (): Promise<MyPageProfile> => {
    return await axiosClient.get('/profile');
}

const getMyRematchingTicket = async (): Promise<MyRematchingTicket[]> => {
    return await axiosClient.get('/rematching-ticket');
}

type Service = {
    getMyPageProfile: () => Promise<MyPageProfile>;
    getMyRematchingTicket: () => Promise<MyRematchingTicket[]>;
}

const apis: Service = {
    getMyPageProfile,
    getMyRematchingTicket,
}

export default apis;



