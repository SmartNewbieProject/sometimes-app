import { matchHistoryApis } from './apis';
import { useMatchPartnerQuery } from './queries';
import * as ui from './ui';

const Match = {
	apis: {
		history: matchHistoryApis,
	},
	queries: {
		useMatchPartnerQuery,
	},
	ui,
};

export default Match;
