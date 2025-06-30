import * as apis from './api';
import * as hooks from './hooks';
import * as queries from './queries';
import * as services from './services';
import * as UI from './ui';

const Interest = {
	hooks,
	ui: UI,
	services,
	apis,
	queries,
};

export default Interest;
