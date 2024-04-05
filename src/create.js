import { spz, spzInit } from "./svgpanzoom";
import { createElement, createDefElement } from "./utils/element";
import { panToCenter } from "./utils/functions";
import { DataNames, Pixels, canvas } from "./utils/variables";

function create(container) {
  try {
    if (!(container instanceof HTMLElement)) {
      throw new Error("Container must be a valid HTMLElement.");
    }

    const nodeSize = Pixels.SIZE * Pixels.GRID;

    canvas.container = container;

    // getting the initial dimensions
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // initializing the SVG element (canvas itself)
    canvas.element = createElement("svg", {
      width: canvas.width,
      height: canvas.height,
      viewBox: `0 0 ${canvas.width} ${canvas.height}`,
    });

    // creating diagram containers
    canvas.wrapper = createElement("g");
    canvas.palette = createElement("g", { ["data-" + DataNames.SHAPE_CONTAINER]: "" });
    canvas.containment = createElement("g", { "data-containment": "" });
    canvas.texts = createElement("g", { "data-texts": "" });
    canvas.connects = createElement("g", { "data-connectors": "" });

    // creating the grid
    const grid = createElement("rect", {
      fill: "url(#gridGroup)",
      width: nodeSize,
      height: nodeSize,
      x: 0,
      y: 0,
    });

    // appending defs element (pattern and styling)
    canvas.containment.append(createDefElement());
    canvas.containment.append(canvas.palette);
    canvas.containment.append(canvas.texts);
    canvas.containment.append(canvas.connects);

    canvas.wrapper.append(grid);
    canvas.wrapper.append(canvas.containment);

    canvas.element.append(canvas.wrapper);
    canvas.container.append(canvas.element);

    // initialize zooming and panning
    spzInit(canvas.element);

    // default pan position
    panToCenter();
  } catch (err) {
    console.error(err);
  }
}

export default create;
