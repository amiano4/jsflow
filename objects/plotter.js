import { Sizes, Colors } from "../diagram/util.js";
import { getSPZ } from "../diagram/spz.js";
import { create } from "./object.js";

let plotter = null;

export default class Plotter {
  constructor(object, container) {
    this.node = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.isReady = false;
    this.origin = null;
    this.shape = object;
    this.container = container;

    this.node.setAttribute("x", this.x);
    this.node.setAttribute("y", this.y);
    this.node.setAttribute("width", this.width);
    this.node.setAttribute("height", this.height);
    this.node.setAttribute("fill", Colors.dimblue_alpha);
    this.node.setAttribute("stroke", Colors.dimblue);
    this.node.setAttribute("stroke-width", "1");
    this.node.setAttribute("stroke-dasharray", "5,5");
  }

  update({ x, y, width, height }) {
    width = Math.abs(width || 0);
    height = Math.abs(height || 0);

    this.isReady =
      width > Sizes.minPlotSize &&
      width < Sizes.maxPlotSize &&
      height > Sizes.minPlotSize &&
      height < Sizes.maxPlotSize;

    this.node.setAttribute("x", x);
    this.node.setAttribute("y", y);
    this.node.setAttribute("width", width);
    this.node.setAttribute("height", height);
    this.node.setAttribute("fill", this.isReady ? Colors.lightblue_alpha : Colors.dimblue_alpha);
    this.node.setAttribute("stroke", this.isReady ? Colors.lightblue : Colors.dimblue);

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

export function plotIn(shapeType, container) {
  plotter = new Plotter(shapeType, container);
  return plotter;
}

export function plotStart(x, y) {
  if (!(plotter instanceof Plotter)) {
    return;
  }
  getSPZ().disablePan();
  plotter.origin = { x, y };
  plotter.update({ x, y });
  plotter.container.appendChild(plotter.node);
  return true;
}

export function plot(x, y) {
  if (!(plotter instanceof Plotter) || !plotter.origin) {
    return;
  }

  const width = plotter.origin.x - x;
  const height = plotter.origin.y - y;
  plotter.update({
    x: width > 0 ? x : plotter.x,
    y: height > 0 ? y : plotter.y,
    width,
    height,
  });
  return true;
}

export function plotEnd(x, y) {
  if (!(plotter instanceof Plotter) || !plotter.origin) {
    return;
  }

  if (plotter.isReady) {
    const width = plotter.origin.x - x;
    const height = plotter.origin.y - y;

    plotter.update({
      x: width > 0 ? x : plotter.x,
      y: height > 0 ? y : plotter.y,
      width,
      height,
    });

    const objConfig = {
      x: plotter.x,
      y: plotter.y,
      width: plotter.width,
      height: plotter.height,
    };

    create(plotter.shape, objConfig);
  }

  plotter.node.remove();
  plotter = null;
  getSPZ().enablePan();
  return true;
}
