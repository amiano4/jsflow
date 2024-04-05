import { spz, spzInit } from "./svgpanzoom";
import { createElement } from "./utils/element";
import { canvas } from "./utils/variables";

function create(container) {
  try {
    if (!(container instanceof HTMLElement)) {
      throw new Error("Container must be a valid HTMLElement.");
    }

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    canvas.element = createElement("svg");
    canvas.element.setAttribute("width", canvas.width);
    canvas.element.setAttribute("height", canvas.height);
    canvas.element.setAttribute("viewBox", `0 0 ${canvas.width} ${canvas.height}`);
    container.append(canvas.element);

    canvas.container = container;
    spzInit(canvas.element);
  } catch (err) {
    console.error(err);
  }
}

export default create;
