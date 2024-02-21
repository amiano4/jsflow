import { canvas } from "../diagram/canvas.js";
import { uniqid, Ids, Sizes, Colors, AnchorKeys } from "../diagram/util.js";
import { triggerCustomEvent } from "../diagram/event.js";

function initShape(type) {
  // shape section
  const content = document.createElementNS("http://www.w3.org/2000/svg", type);
  content.setAttribute("fill", "#fff");
  content.setAttribute("stroke", "#000");
  content.setAttribute("stroke-width", "1");

  const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
  container.custom(Ids.shape);
  container.id = uniqid(type.charAt(0)); // identifier id

  const textObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
  textObject.setAttribute("x", 0);
  textObject.setAttribute("y", 0);

  const textBody = document.createElement("div");
  textBody.setAttribute("xlmns", "http://www.w3.org/1999/xhtml");

  const textNode = document.createElement("span");
  textNode.custom(Ids.text);
  textNode.setAttribute("spellcheck", false);
  textNode.setAttribute("autocomplete", "off");
  textNode.textContent = "Add text here";
  textNode.style.color = "#000000";

  textBody.appendChild(textNode);
  textObject.appendChild(textBody);

  container.appendChild(content);
  container.appendChild(textObject);

  // handler section
  const handlerContainer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  handlerContainer.custom(Ids.shape, container.id);

  return {
    container,
    entity: content,
    textBody,
    textObject,
    textNode,
    handlerContainer,
  };
}

export default class Shape {
  constructor(nodeType) {
    this.x = 0;
    this.y = 0;
    this.width = 100;
    this.height = 100;
    this.outline = "solid";
    this.appearance = {};
    this.state = {
      drag: null,
      resize: null,
      textedit: false,
      prev: {},
    };
    this.controller = {
      status: false,
      mode: null,
      anchors: {},
    };
    this.nodes = initShape(nodeType);
    this.id = this.nodes.container.id;
    this.setAppearance(
      {
        fill: "#fff",
        strokeWidth: "1",
        strokeDashArray: null,
        stroke: "#000000",
      },
      true
    );
    this.connectors = { in: [], out: [] };

    const myInstance = this;
    this.nodes.textNode.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        myInstance.setTextEditOn(false);
      }
    });
  }

  setId(id) {
    this.id = id;
    this.nodes.container.id = this.id;
    this.nodes.handlerContainer.custom(Ids.shape, this.id);
  }

  get() {
    const data = {
      type: this.constructor.name,
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height,
      id: this.id,
      outline: this.outline,
      appearance: this.appearance,
      connectors: this.connectors,
      text: this.nodes.textNode.textContent,
    };

    if (this.nodes.ccpLabel) {
      data.ccp = this.nodes.ccpLabel.dataset.ccp;
    }

    if (window.ProcessSteps.hasOwnProperty(this.id)) {
      data.step = window.ProcessSteps[this.id].step || 0;
    }

    return data;
  }

  updateController() {
    if (!this.controller.status) return;

    const that = this;
    const pos = this.getControllerNodesCoordinate("all", true);

    // update border
    Object.entries(this.controller.anchors).forEach(([p, el]) => {
      const { x, y } = pos[p];

      if (that.controller.mode) {
        el.setAttribute("cx", x);
        el.setAttribute("cy", y);
      }
    });
    return this;
  }

  getControllerNodesCoordinate(key, relativeToSelf = false) {
    let { width, height, x, y } = this.state.prev;
    // width = relativeToSelf ? x + width : width;
    // height = relativeToSelf ? y + height : height;
    x = relativeToSelf ? x : 0;
    y = relativeToSelf ? y : 0;
    const coords = {
      nw: { x, y },
      ne: { x: x + width, y },
      sw: { x, y: y + height },
      se: { x: x + width, y: y + height },
      n: { x: x + width / 2, y },
      e: { x: x + width, y: y + height / 2 },
      w: { x, y: y + height / 2 },
      s: { x: x + width / 2, y: y + height },
    };
    return key === "all" ? coords : coords[key] || null;
  }

  setAppearance(options, isFinal = false) {
    if (options.stroke) {
      if (isFinal) this.appearance.stroke = options.stroke;
      this.nodes.entity.setAttribute("stroke", options.stroke);
    } else if (options.stroke === null) {
      this.nodes.entity.setAttribute("stroke", this.appearance.stroke);
    }

    if (options.strokeWidth) {
      this.appearance.strokeWidth = options.strokeWidth;
      this.nodes.entity.setAttribute("stroke-width", this.appearance.strokeWidth);
    }

    if (options.strokeDashArray) {
      this.appearance.strokeDashArray = options.strokeDashArray;
      this.nodes.entity.setAttribute("stroke-dasharray", this.appearance.strokeDashArray);
    } else if (options.strokeDashArray === null) {
      this.appearance.strokeDashArray = options.strokeDashArray;
      this.nodes.entity.removeAttribute("stroke-dasharray");
    }

    if (options.fill) {
      this.appearance.fill = options.fill;
      this.nodes.entity.setAttribute("fill", this.appearance.fill);
    }
  }

  update(options = {}) {
    let { x, y, height, width } = options;
    x = x || this.x;
    y = y || this.y;
    height = height || this.height;
    width = width || this.width;
    this.state.prev = { x, y, height, width };

    this.nodes.container.setAttribute("transform", `translate(${x}, ${y})`);
    this.nodes.textObject.setAttribute("width", width);
    this.nodes.textObject.setAttribute("height", height);
    this.nodes.textBody.style.height = height + "px";
    this.updateEntity();
    this.updateController();
    this.bindConnectors();
    return this;
  }

  updateEntity() {
    const { width, height } = this.state.prev;
    this.nodes.entity.setAttribute("width", width);
    this.nodes.entity.setAttribute("height", height);
  }

  lockUpdate(options = {}) {
    options.x = Math.round((options.x || this.x) / Sizes.perNode) * Sizes.perNode;
    options.y = Math.round((options.y || this.y) / Sizes.perNode) * Sizes.perNode;
    options.width = Math.round((options.width || this.width) / Sizes.perNode) * Sizes.perNode;
    options.height = Math.round((options.height || this.height) / Sizes.perNode) * Sizes.perNode;

    const shape = this.update(options);
    Object.entries(this.state.prev).forEach(([key, value]) => {
      if (shape.hasOwnProperty(key)) {
        shape[key] = value || 0;
      }
    });
    return this;
  }

  resize(x, y) {
    const o = this.state.resize;
    if (!o) return;
    let nx = x - o.x;
    let ny = y - o.y;
    let width = o.width;
    let height = o.height;

    switch (o.key) {
      case "nw":
        width = o.width - nx;
        height = o.height - ny;
        x = width < Sizes.minPlotSize ? o.x + o.width - Sizes.minPlotSize : x;
        y = height < Sizes.minPlotSize ? o.y + o.height - Sizes.minPlotSize : y;
        break;
      case "n":
        height -= ny;
        x = o.x;
        y = height < Sizes.minPlotSize ? o.y + o.height - Sizes.minPlotSize : y;
        break;
      case "ne":
        width = nx;
        height -= ny;
        x = o.x;
        y = height < Sizes.minPlotSize ? o.y + o.height - Sizes.minPlotSize : y;
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
        x = width < Sizes.minPlotSize ? o.x + o.width - Sizes.minPlotSize : x;
        y = o.y;
        break;
      case "w":
        width -= nx;
        x = width < Sizes.minPlotSize ? o.x + o.width - Sizes.minPlotSize : x;
        y = o.y;
        break;
    }

    width = width < Sizes.minPlotSize ? Sizes.minPlotSize : width;
    height = height < Sizes.minPlotSize ? Sizes.minPlotSize : height;
    this.bindConnectors();
    return this.update({ x, y, width, height });
  }

  setOn(mode) {
    if (!mode && this.controller.status !== false) {
      this.controller.status = false;
      this.nodes.handlerContainer.remove();
      this.setAppearance({ stroke: this.appearance.stroke }, true);
      triggerCustomEvent("onshapeblur", this);
    } else if (mode) {
      // show controller/handler
      this.controller.status = true;
      this.updateController();
      canvas.wrapper.appendChild(this.nodes.handlerContainer);
      if (this.controller.mode === "transform") triggerCustomEvent("onshapefocus", this);
      else if (this.controller.mode === "path") triggerCustomEvent("onbusy");
    }
    return this;
  }

  useResizeHandler() {
    this.setAppearance({ stroke: Colors.lightblue });

    if (this.controller.mode === "transform") return;

    Object.values(this.controller.anchors).forEach((el) => el.remove());
    this.controller.anchors = {};
    let points = AnchorKeys.corner;
    if (this.nodes.entity.tagName !== "circle") {
      points = points.concat(AnchorKeys.center);
    }
    for (let p in points) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      el.setAttribute("fill", "#fff");
      el.setAttribute("stroke", Colors.lightblue);
      el.setAttribute("stroke-width", "1");
      el.custom(Ids.anchor_resize, points[p]);
      el.setAttribute("cx", Sizes.anchor / 2);
      el.setAttribute("cy", Sizes.anchor / 2);
      el.setAttribute("r", Sizes.anchor / 2);

      this.controller.anchors[points[p]] = el;
      this.nodes.handlerContainer.appendChild(el);
    }

    this.controller.mode = "transform";
    this.nodes.container.appendChild(this.nodes.handlerContainer);
    return this;
  }

  usePathHandler() {
    this.setAppearance({ stroke: "#000" });

    if (this.controller.mode === "path") return;

    Object.values(this.controller.anchors).forEach((el) => el.remove());
    this.controller.anchors = {};
    const points = AnchorKeys.center;
    for (let p in points) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      el.setAttribute("fill", Colors.lightblue);
      el.custom(Ids.anchor_connector, points[p]);
      el.setAttribute("cx", Sizes.anchor / 2);
      el.setAttribute("cy", Sizes.anchor / 2);
      el.setAttribute("r", Sizes.anchor / 2);

      this.controller.anchors[points[p]] = el;
      this.nodes.handlerContainer.appendChild(el);
    }

    this.controller.mode = "path";
    this.nodes.container.appendChild(this.nodes.handlerContainer);
    return this;
  }

  setTextEditOn(mode = true) {
    if (mode !== true) {
      // stop edit
      const text = this.nodes.textNode.innerHTML;
      this.nodes.textNode.innerHTML = text.replace(/^(<br>)+|(<br>)+$/g, "");
      const height = this.nodes.textNode.clientHeight;
      if (this.height <= height) {
        this.lockUpdate({ height: height + height * 0.2 });
      }

      if (this.nodes.textNode.textContent == "") {
        this.nodes.textNode.innerHTML = "&nbsp;".repeat(15);
      }
      this.nodes.textNode.removeAttribute("contenteditable");
      triggerCustomEvent("ontextchange", this.nodes.textNode);
      triggerCustomEvent("onstandby");
    } else {
      // start edit
      this.nodes.textNode.contentEditable = true;
      this.nodes.textNode.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(this.nodes.textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      triggerCustomEvent("onbusy");
    }

    this.state.textedit = mode;
  }

  bindConnectors() {
    const pt = this.getControllerNodesCoordinate("all", true);

    for (let i in this.connectors.in) {
      const [id, key] = this.connectors.in[i];
      const con = canvas[id] || null;
      if (!con) continue;

      con.move(-1, pt[key].x, pt[key].y, true, false);
    }

    for (let i in this.connectors.out) {
      const [id, key] = this.connectors.out[i];
      const con = canvas[id] || null;
      if (!con) continue;

      con.move(0, pt[key].x, pt[key].y, true, false);
    }
  }

  reset() {
    this.state.drag = null;
    this.state.resize = null;
    this.controller.status && this.setOn(false);
    this.state.textedit && this.setTextEditOn(false);
  }

  remove() {
    // unmount connectors
    for (let i in this.connectors.in) {
      const con = canvas[this.connectors.in[i][0]] || null;
      if (con) con.toId = null;
    }
    for (let i in this.connectors.out) {
      const con = canvas[this.connectors.out[i][0]] || null;
      if (con) con.fromId = null;
    }
    this.nodes.handlerContainer.remove();
    this.nodes.container.remove();
    delete canvas[this.id];
  }

  transpose(newX, newY) {
    const { e, f } = canvas.containment.getCTM();
    const cloned = this.nodes.container.cloneNode(true);
    // console.log(e, this.x);
    cloned.setAttribute("transform", `translate(${newX}, ${newY})`);
    return cloned;
  }
}
