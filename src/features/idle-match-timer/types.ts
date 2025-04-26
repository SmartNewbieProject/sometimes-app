import { UserProfile } from "@/src/types/user";
import { Dayjs } from "dayjs";

export type MatchViewType = 'open' | 'waiting' | 'not-found' | 'rematching';

export type MatchDetails = {
  type: MatchViewType;
  endOfView: Dayjs | null;
  partner: UserProfile | null;
};

export type ServerMatchDetails = Omit<MatchDetails, 'endOfView'> & {
  endOfView: string | null;
};
