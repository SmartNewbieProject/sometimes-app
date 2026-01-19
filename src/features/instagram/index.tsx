import * as services from './services';
import * as ui from './ui';

const Instagram = {
	ui,
	services,
};

export default Instagram;

export { useUpdateInstagramId } from './queries/use-update-instagram-id';
export { updateInstagramId } from './apis';
