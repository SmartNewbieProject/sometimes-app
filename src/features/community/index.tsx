import apis from "./apis";
import * as hooks from "./hooks";
import * as queries from "./queries";
import * as ui from "./ui";
import * as types from "./types";
import * as services from './services';


const Community = {
  ...apis,
  ...hooks,
  ...queries,
  ...ui,
  ...types,
  ...services,
}

export default Community;