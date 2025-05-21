import { axiosClient } from "@/src/shared/libs";

type RematchingTicket = {
    total: number;
}

type MyRematchingTicket = {
    id: number;
    name: string;
}

export type Mbti = {
    mbti: string | null;
}


const getMyRematchingTicket = async (): Promise<MyRematchingTicket[]> => {
    return await axiosClient.get('/tickets/rematching');
}

const getAllRematchingTicket = async (): Promise<RematchingTicket> => {
    const myRematchingTickets = await getMyRematchingTicket();
    return { total: myRematchingTickets.length };
}

const getMbti = async (): Promise<Mbti> => {
    return await axiosClient.get('/profile/mbti');
};

const updateMbti = async (mbti: string): Promise<void> => {
    return await axiosClient.patch('/profile/mbti', { mbti });
};

type Service = {
    getMyRematchingTicket: () => Promise<MyRematchingTicket[]>;
    getAllRematchingTicket: () => Promise<RematchingTicket>;
    getMbti: () => Promise<Mbti>;
    updateMbti: (mbti: string) => Promise<void>;
}

const apis: Service = {
    getMyRematchingTicket,
    getAllRematchingTicket,
    getMbti,
    updateMbti,
}

export default apis;
