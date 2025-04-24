import { UserProfile } from "@/src/types/user";

export type MatchViewType = 'open' | 'waiting' | 'not-found' | 'rematching';

export type MatchDetails = {
  type: MatchViewType;
  endOfView: Date | null;
  partner: UserProfile | null;
};

export type ServerMatchDetails = Omit<MatchDetails, 'endOfView'> & {
  endOfView: string | null;
};
