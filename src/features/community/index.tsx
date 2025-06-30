import apis from './apis';
import * as hooks from './hooks';
import * as queries from './queries';
import * as services from './services';
import * as types from './types';
import * as ui from './ui';

const Community = {
	...apis,
	...hooks,
	...queries,
	...ui,
	...types,
	...services,
};

export default Community;
