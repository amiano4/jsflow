import { Colors } from "../diagram/util.js";
import Shape from "./shape.js";

export default class Text extends Shape {
  constructor(options) {
    super("rect");
    this.isText = true;
    this.setAppearance({
      fill: "none",
      stroke: Colors.lightblue,
      strokeWidth: "none",
      strokeDashArray: null,
    });
    this.lockUpdate(options);
  }

  setAppearance(options, isFinal = false) {
    if (options.stroke == Colors.lightblue) {
      this.nodes.entity.setAttribute("stroke", Colors.lightblue);
      this.nodes.entity.setAttribute("stroke-width", 1);
      this.nodes.entity.setAttribute("stroke-dasharray", "2,5");
    } else {
      this.nodes.entity.removeAttribute("stroke");
      this.nodes.entity.removeAttribute("stroke-width");
      this.nodes.entity.removeAttribute("stroke-dasharray");
    }

    if (options.fill) {
      this.nodes.entity.setAttribute("fill", options.fill);
    }
  }

  usePathHandler() {
    if (this.controller.mode === "path") return;

    Object.values(this.controller.anchors).forEach((el) => el.remove());
    this.controller.mode = "path";
    return this;
  }
}
