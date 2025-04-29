import { axiosClient } from "@/src/shared/libs";

type RematchingTicket = {
    total: number;
}

type MyRematchingTicket = {
    id: number;
    name: string;
}


const getMyRematchingTicket = async (): Promise<MyRematchingTicket[]> => {
    return await axiosClient.get('/tickets/rematching');
}

const getAllRematchingTicket = async (): Promise<RematchingTicket> => {
    const myRematchingTickets = await getMyRematchingTicket();
    return { total: myRematchingTickets.length };
}

type Service = {
    getMyRematchingTicket: () => Promise<MyRematchingTicket[]>;
    getAllRematchingTicket: () => Promise<RematchingTicket>;
}

const apis: Service = {
    getMyRematchingTicket,
    getAllRematchingTicket,
}

export default apis;



