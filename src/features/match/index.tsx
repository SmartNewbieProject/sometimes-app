import { matchHistoryApis } from "./apis";
import { useMatchPartnerQuery } from "./queries";
import * as ui from './ui';
import * as mihoMessageService from './services/miho-message-service';

export * from './types/miho-message';

const Match = {
  apis: {
    history: matchHistoryApis,
  },
  queries: {
    useMatchPartnerQuery,
  },
  ui,
  mihoMessageService,
};

export default Match;

