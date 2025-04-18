import apis from "./apis";
import * as hooks from "./hooks";
import * as queries from "./queries";
import * as ui from "./ui";

const Community = {
  ...apis,
  ...hooks,
  ...queries,
  ...ui,
}

export default Community;