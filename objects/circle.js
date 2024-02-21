import Shape from "./shape.js";
import { Sizes } from "../diagram/util.js";

export default class Circle extends Shape {
  constructor(options) {
    super("circle");
    this.lockUpdate(options);
  }

  update(options = {}) {
    let { x, y, height, width } = options;
    x = x || this.x;
    y = y || this.y;
    height = height || this.height;
    width = width || this.width;

    const size = Math.min(width, height);
    width = size;
    height = size;
    this.state.prev = { x, y, height, width };

    this.nodes.container.setAttribute("transform", `translate(${x}, ${y})`);
    this.nodes.entity.setAttribute("cx", size / 2);
    this.nodes.entity.setAttribute("cy", size / 2);
    this.nodes.entity.setAttribute("r", size / 2);

    this.nodes.textObject.setAttribute("width", size);
    this.nodes.textObject.setAttribute("height", size);
    this.nodes.textBody.style.height = size + "px";
    this.updateController();
    this.bindConnectors();
    return this;
  }

  resize(x, y) {
    const o = this.state.resize;
    if (!o) return;
    const oldRadius = Math.min(o.width, o.height) / 2;
    let delta = 0;

    switch (o.key) {
      case "nw":
        delta = Math.max(x - o.x, y - o.y) * -1;
        break;
      case "ne":
        delta = Math.max(x - (o.x + o.width), (y - o.y) * -1);
        break;
      case "se":
        delta = Math.max(x - (o.x + o.width), y - (o.y + o.height));
        break;
      case "sw":
        delta = Math.max((x - o.x) * -1, y - (o.y + o.height));
        break;
      default:
        return;
    }

    x = o.x - delta;
    y = o.y - delta;

    let diameter = 2 * (oldRadius + delta);

    if (diameter < Sizes.minPlotSize) {
      diameter = Sizes.minPlotSize;
      x = o.x - (diameter / 2 - oldRadius);
      y = o.y - (diameter / 2 - oldRadius);
    }
    this.bindConnectors();

    return this.update({ x, y, width: diameter, height: diameter });
  }
}
