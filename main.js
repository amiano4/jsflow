import create from "./src/create";
import { canvas, customUserEvents } from "./src/utils/variables";

const app = document.querySelector("#app");

const on = (hook, callback) => {
  !customUserEvents[hook] && (customUserEvents[hook] = []);
  customUserEvents[hook].push(callback);
};

create(app);

const JsFlow = {
  on,
  create,
};

export default JsFlow;
