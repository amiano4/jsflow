import { createElement } from "../utils/element";
import { BorderDashArrays, Colors } from "../utils/variables";

const defaults = {
  WIDTH: 0,
  HEIGHT: 0,
  FILL: Colors.white,
  BORDER_COLOR: Colors.black, // stroke
  BORDER_WIDTH: 1, // strokeWidth
  BORDER_TYPE: null, // strokeDashArray
};

const allowedEntities = ["circle", "polygon", "rect", "ellipse"];

export default class Node {
  constructor({ x, y, width, height, fill, borderColor, borderWidth, borderType }, type = null) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || defaults.WIDTH;
    this.height = height || defaults.HEIGHT;
    this.fill = fill || defaults.FILL;
    this.border = {
      color: borderColor || defaults.BORDER_COLOR,
      width: borderWidth || defaults.BORDER_WIDTH,
      type: borderType || defaults.BORDER_TYPE,
    };
    this.entity = null;
    this.type = null;
    this.id = null;

    if (type) {
      this.create(type);
    }
  }

  getProps() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      fill: this.fill,
      borderColor: this.border.color,
      borderWidth: this.border.width,
      borderType: this.border.type,
    };
  }

  create(type) {
    if (!allowedEntities.includes(type)) {
      console.error("Unable to create node with type " + type + ".");
      return;
    }

    this.type = type;
    this.entity = createElement(type, {
      fill: this.fill,
      height: this.height,
      width: this.width,
      x: this.x,
      y: this.y,
    });
    this.id = this.entity.id;
    this.setBorder(this.border);

    return this;
  }

  setPosition({ x = null, y = null }) {
    x !== null && this.entity.setAttribute("x", (this.x = x));
    y !== null && this.entity.setAttribute("y", (this.y = y));
    return this;
  }

  setDimension({ w = null, h = null }) {
    w !== null && this.entity.setAttribute("width", (this.width = w));
    h !== null && this.entity.setAttribute("height", (this.height = h));
    return this;
  }

  setBorder({ color, width, type }) {
    color !== null && this.entity.setAttribute("stroke", (this.border.color = color));
    width !== null && this.entity.setAttribute("strokeWidth", (this.border.width = width));
    type !== undefined && (this.border.type = type || "solid");

    if (BorderDashArrays.hasOwnProperty(type)) {
      this.entity.setAttribute("strokeDashArray", BorderDashArrays[type]);
    } else if (type === null || type == "solid") {
      this.entity.removeAttribute("strokeDashArray");
    }

    return this;
  }

  static setDefaults({ width, height, fill, borderColor, borderWidth, borderType }) {
    defaults.WIDTH = width ?? defaults.WIDTH;
    defaults.HEIGHT = height ?? defaults.HEIGHT;
    defaults.FILL = fill ?? defaults.FILL;
    defaults.BORDER_COLOR = borderColor ?? defaults.BORDER_COLOR;
    defaults.BORDER_WIDTH = borderWidth ?? defaults.BORDER_WIDTH;
    defaults.BORDER_TYPE = borderType ?? defaults.BORDER_TYPE;
  }

  static spawn(props, type = null) {
    return new Node(props, type);
  }
}
