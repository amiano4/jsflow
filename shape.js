class Shape {
  constructor() {
    this.namespace = JSFLOW_NAMESPACE;
    this.x = 0;
    this.y = 0;
    this.width = 100;
    this.height = 100;
    this.outline = "solid";
    this.fill = "#fff";
    this.stroke = "#000";
    this.strokeWidth = 1;
    this.outline = "solid";
    this.node = null;
    this.anchors = null;
    this.id = null;
    this.lastState = {};
    this.dragging = false;
    this.dragOrigin = { x: 0, y: 0 };
    this.transforming = false;
    this.transformOrigin = null;
    this.editing = false;
    this.pathing = false;
    this.blocks = [];
    this.ports = {};

    this.handler = new Handler();
  }

  create(type) {
    const container = document.createElementNS(this.namespace, "g");
    const content = document.createElementNS(this.namespace, type);
    const textObject = document.createElementNS(this.namespace, "foreignObject");
    const textBody = document.createElement("div");
    const textNode = document.createElement("span");
    const that = this;

    textBody.setAttribute("xlmns", "http://www.w3.org/1999/xhtml");
    textNode.setAttribute("jsflow-text-content", "");
    textNode.setAttribute("spellcheck", false);
    textNode.setAttribute("autocomplete", "off");
    textNode.textContent = JSFLOW_PLACEHOLDER_TEXT;

    this.id = jsFlow.uniqid(8, "jsflow-shape" + window.JSFLOW_ELEMENT_COUNT);
    container.setAttribute("jsflow-shape-object", "");
    container.id = this.id;

    textBody.appendChild(textNode);
    textObject.setAttribute("x", 0);
    textObject.setAttribute("y", 0);
    textObject.setAttribute("width", this.width);
    textObject.setAttribute("height", this.height);
    textObject.setAttribute("jsflow-text-object", "");
    textObject.appendChild(textBody);

    container.appendChild(content);
    container.appendChild(textObject);
    this.node = { container, content, textObject, textBody, textNode };
    return this;
  }

  update(ops = {}, lock = false) {
    if (!this.node) {
      console.error("Unable to update NULL shape element.");
      return;
    }

    let { x, y, height, width, fill, stroke, strokeWidth } = ops;

    if (lock) {
      x = Math.round(x / JSFLOW_GRID_SIZE) * JSFLOW_GRID_SIZE;
      y = Math.round(y / JSFLOW_GRID_SIZE) * JSFLOW_GRID_SIZE;
      width = Math.ceil(width / JSFLOW_GRID_SIZE) * JSFLOW_GRID_SIZE;
      height = Math.ceil(height / JSFLOW_GRID_SIZE) * JSFLOW_GRID_SIZE;
    }

    x = x || this.x;
    y = y || this.y;
    height = height || this.height;
    width = width || this.width;
    fill = fill || this.fill;
    stroke = stroke || this.stroke;
    strokeWidth = strokeWidth || this.strokeWidth;

    const offset = `translate(${x}, ${y})`;
    this.lastState = { x, y, width, height, fill, stroke, strokeWidth };

    this.node.container.setAttribute("transform", offset);
    this.node.container.style.transform = offset;

    switch (this.outline) {
      case "solid":
        this.node.content.removeAttribute("stroke-dasharray");
        break;
      case "dotted":
        this.node.content.setAttribute("stroke-dasharray", "2,2");
        break;
      case "broken":
        this.node.content.setAttribute("stroke-dasharray", "5,3");
        break;
    }

    this.node.textObject.setAttribute("width", width);
    this.node.textObject.setAttribute("height", height);
    this.node.textBody.style.height = height + "px";
    this.node.textNode.style.width = width * 0.8 + "px";

    this.updateContentElement();
    this.handler.update({ x, y, width, height });

    if (lock) {
      const that = this;
      Object.entries(ops).forEach(([key, value]) => {
        if (that.hasOwnProperty(key) && key !== "element") {
          that[key] = value;
        }
      });
    }

    return this;
  }

  // resizing
  transform({ x, y }) {
    const o = this.transformOrigin;
    let nx = x - o.x;
    let ny = y - o.y;
    let width = o.width;
    let height = o.height;

    switch (this.transforming) {
      case "nw":
        width = o.width - nx;
        height = o.height - ny;
        x = width < JSFLOW_MIN_PLOTTER_SIZE ? o.x + o.width - JSFLOW_MIN_PLOTTER_SIZE : x;
        y = height < JSFLOW_MIN_PLOTTER_SIZE ? o.y + o.height - JSFLOW_MIN_PLOTTER_SIZE : y;
        break;
      case "n":
        height -= ny;
        x = o.x;
        y = height < JSFLOW_MIN_PLOTTER_SIZE ? o.y + o.height - JSFLOW_MIN_PLOTTER_SIZE : y;
        break;
      case "ne":
        width = nx;
        height -= ny;
        x = o.x;
        y = height < JSFLOW_MIN_PLOTTER_SIZE ? o.y + o.height - JSFLOW_MIN_PLOTTER_SIZE : y;
        break;
      case "e":
        width = nx;
        x = o.x;
        y = o.y;
        break;
      case "se":
        width = nx;
        height = ny;
        x = o.x;
        y = o.y;
        break;
      case "s":
        height = ny;
        x = o.x;
        y = o.y;
        break;
      case "sw":
        width -= nx;
        height = ny;
        x = width < JSFLOW_MIN_PLOTTER_SIZE ? o.x + o.width - JSFLOW_MIN_PLOTTER_SIZE : x;
        y = o.y;
        break;
      case "w":
        width -= nx;
        x = width < JSFLOW_MIN_PLOTTER_SIZE ? o.x + o.width - JSFLOW_MIN_PLOTTER_SIZE : x;
        y = o.y;
        break;
    }

    width = width < JSFLOW_MIN_PLOTTER_SIZE ? JSFLOW_MIN_PLOTTER_SIZE : width;
    height = height < JSFLOW_MIN_PLOTTER_SIZE ? JSFLOW_MIN_PLOTTER_SIZE : height;

    this.handler.useTransformTool();
    this.update({ x, y, width, height });
  }

  updateContentElement() {
    const { width, height, fill, stroke, strokeWidth } = this.lastState;
    // defaulted to rectangle shape
    this.node.content.setAttribute("width", width);
    this.node.content.setAttribute("height", height);
    this.node.content.setAttribute("fill", fill);
    this.node.content.setAttribute("stroke", stroke);
    this.node.content.setAttribute("stroke-width", strokeWidth);
  }

  highlight() {
    if (this.handler.inDom !== true) {
      this.node.container.appendChild(this.handler.container);
      this.handler.inDom = true;
    }
    return this;
  }

  active() {
    return this.handler.inDom || false;
  }

  startEditing() {
    this.editing = true;
    // return;

    this.node.textNode.contentEditable = true;
    this.node.textNode.focus();

    const selection = window.getSelection();
    const range = document.createRange();

    range.selectNodeContents(this.node.textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    console.log("editing started");
  }

  stopEditing() {
    const text = this.node.textNode.innerHTML;
    this.node.textNode.innerHTML = text.replace(/^(<br>)+|(<br>)+$/g, "");

    const height = this.node.textNode.clientHeight;

    if (this.height <= height) {
      this.update({ height: height + height * 0.2 }, true);
    }

    this.node.textNode.removeAttribute("contenteditable");
    this.editing = false;
  }

  leave() {
    this.editing && this.stopEditing();
  }

  getPathPoint(anchor = false) {
    const { width, height, x, y } = this.lastState;
    const pos = {
      n: { x: width / 2, y: 0 }, // north
      e: { x: width, y: height / 2 }, // east
      w: { x: 0, y: height / 2 }, // west
      s: { x: width / 2, y: height }, // south
    };

    anchor = anchor === false ? this.pathing : anchor;
    if (!pos[anchor]) return;
    pos[anchor].x += x;
    pos[anchor].y += y;

    return pos[anchor];
  }
}

class Rectangle extends Shape {
  constructor(options) {
    super();
    this.create("rect");
    this.update(options, true);
  }
}

class Ellipse extends Shape {
  constructor(options) {
    super();
    this.create("ellipse");
    this.update(options, true);
  }

  updateContentElement() {
    const { width, height, fill, stroke, strokeWidth } = this.lastState;
    this.node.content.setAttribute("cx", width / 2);
    this.node.content.setAttribute("cy", height / 2);
    this.node.content.setAttribute("rx", width / 2);
    this.node.content.setAttribute("ry", height / 2);
    this.node.content.setAttribute("fill", fill);
    this.node.content.setAttribute("stroke", stroke);
    this.node.content.setAttribute("stroke-width", strokeWidth);
  }
}

class Circle extends Shape {
  constructor(options) {
    super();
    this.handler.cornerPointsOnly = true;
    this.handler.usePathTool();
    this.handler.useTransformTool();
    this.create("circle");
    this.update(options, true);
  }

  update(ops = {}, lock = false) {
    if (!this.node) {
      console.error("Unable to update NULL shape element.");
      return;
    }

    let { x, y, height, width, fill, stroke, strokeWidth } = ops;

    if (lock) {
      x = Math.round(x / JSFLOW_GRID_SIZE) * JSFLOW_GRID_SIZE;
      y = Math.round(y / JSFLOW_GRID_SIZE) * JSFLOW_GRID_SIZE;
      width = Math.ceil(width / JSFLOW_GRID_SIZE) * JSFLOW_GRID_SIZE;
      height = Math.ceil(height / JSFLOW_GRID_SIZE) * JSFLOW_GRID_SIZE;
    }

    x = x || this.x;
    y = y || this.y;
    height = height || this.height;
    width = width || this.width;
    fill = fill || this.fill;
    stroke = stroke || this.stroke;
    strokeWidth = strokeWidth || this.strokeWidth;

    const size = Math.min(width, height);
    width = size;
    height = size;

    const offset = `translate(${x}, ${y})`;
    this.lastState = { x, y, width, height, fill, stroke, strokeWidth };

    this.node.container.setAttribute("transform", offset);
    this.node.container.style.transform = offset;

    switch (this.outline) {
      case "solid":
        this.node.content.removeAttribute("stroke-dasharray");
        break;
      case "dotted":
        this.node.content.setAttribute("stroke-dasharray", "2,2");
        break;
      case "broken":
        this.node.content.setAttribute("stroke-dasharray", "5,3");
        break;
    }

    this.node.content.setAttribute("cx", width / 2);
    this.node.content.setAttribute("cy", height / 2);
    this.node.content.setAttribute("r", size / 2);
    this.node.content.setAttribute("fill", fill);
    this.node.content.setAttribute("stroke", stroke);
    this.node.content.setAttribute("stroke-width", strokeWidth);

    // text node
    this.node.textObject.setAttribute("width", size);
    this.node.textObject.setAttribute("height", size);
    this.node.textBody.style.height = size + "px";
    this.node.textNode.style.width = size * 0.8 + "px";

    this.handler.update({ x, y, width, height });

    if (lock) {
      const that = this;
      Object.entries(ops).forEach(([key, value]) => {
        if (that.hasOwnProperty(key) && key !== "element") {
          that[key] = value;
        }
      });
    }

    return this;
  }

  transform({ x, y }) {
    const o = this.transformOrigin;
    const oldRadius = Math.min(o.width, o.height) / 2;
    let delta = 0;

    switch (this.transforming) {
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

    if (diameter < JSFLOW_MIN_PLOTTER_SIZE) {
      diameter = JSFLOW_MIN_PLOTTER_SIZE;
      x = o.x - (diameter / 2 - oldRadius);
      y = o.y - (diameter / 2 - oldRadius);
    }

    this.handler.useTransformTool();
    this.update({ x, y, width: diameter, height: diameter });
  }
}

class Diamond extends Shape {
  constructor(options) {
    super();
    this.create("polygon");
    this.update(options, true);
  }

  updateContentElement() {
    const { width, height, fill, stroke, strokeWidth } = this.lastState;
    const points = `${width / 2} 0, ${width} ${height / 2}, ${width / 2} ${height}, 0 ${height / 2}`;

    this.node.textNode.style.width = width * 0.4 + "px";
    this.node.content.setAttribute("points", points);
    this.node.content.setAttribute("fill", fill);
    this.node.content.setAttribute("stroke", stroke);
    this.node.content.setAttribute("stroke-width", strokeWidth);
  }

  stopEditing() {
    const text = this.node.textNode.innerHTML;
    this.node.textNode.innerHTML = text.replace(/^(<br>)+|(<br>)+$/g, "");

    const height = this.node.textNode.clientHeight;

    if (this.height * 0.4 <= height) {
      this.update({ height: height + height * 0.6 }, true);
    }

    this.node.textNode.removeAttribute("contenteditable");
    this.editing = false;
  }
}
