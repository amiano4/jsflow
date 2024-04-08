import { spz } from "../svgpanzoom";
import { Colors, canvas } from "../utils/variables";
import Node from "./Node";

export default class Plotter extends Node {
  constructor(shapeType) {
    super(
      {
        fill: Colors.dimblue_alpha,
        borderColor: Colors.dimblue,
        borderType: "plot",
      },
      "rect"
    );
    this.shapeResult = shapeType;
    this.origin = null;
  }

  start({ x = 0, y = 0 }) {
    spz.disablePan();
    this.origin = { x, y };
    this.setPosition(this.origin);
    canvas.wrapper.appendChild(this.entity);
    return this;
  }

  plotting({ x, y }) {
    if (!spz.isPanEnabled()) {
      spz.disablePan();
    }

    const { x: x1, y: y1 } = this.origin;
    const width = x1 - x;
    const height = y1 - y;
    this.setPosition({
      x: width > 0 ? x : x1,
      y: height > 0 ? y : y1,
    }).setDimension({ w: width, h: height });

    return this;
  }

  end() {
    return this.getProps();
  }
}
