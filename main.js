import create from "./src/create";
import { createStyle, jfMarkup } from "./src/utils/element";
import { canvas, customUserEvents } from "./src/utils/variables";
import "remixicon/fonts/remixicon.css";
import "./src/style.css";

const app = document.querySelector("#app");
const jf = jfMarkup();
const style = createStyle();
const diagramContainer = jf.querySelector(".jfContentDiagramWrap");

app.innerHTML = "";
document.head.appendChild(style);
app.appendChild(jf);

const on = (hook, callback) => {
  !customUserEvents[hook] && (customUserEvents[hook] = []);
  customUserEvents[hook].push(callback);
};

create(diagramContainer);

const JsFlow = {
  on,
  create,
};

export default JsFlow;
