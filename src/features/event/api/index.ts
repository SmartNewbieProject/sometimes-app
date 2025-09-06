import { axiosClient } from "@shared/libs";
import type { EventDetails, EventType } from "../types";

export const getEventByType = (type: EventType) =>
    axiosClient.get(`v1/event/${type}`) as Promise<EventDetails>;

export const participateEvent = (type: EventType) => axiosClient.patch(`v1/event/${type}`);
