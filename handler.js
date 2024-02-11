class Handler {
  constructor() {
    this.container = document.createElementNS(JSFLOW_NAMESPACE, "g");
    this.borderBox = document.createElementNS(JSFLOW_NAMESPACE, "path");
    this.anchors = {};
    this.inDom = false;
    this.toolMode = null;
    this.centerPoints = ["n", "e", "w", "s"];
    this.cornerPoints = ["nw", "ne", "sw", "se"];
    this.clientBox = null;
    this.color = "#00a5ff";
    this.cornerPointsOnly = false;

    this.borderBox.setAttribute("fill", "none");
    this.borderBox.setAttribute("stroke", this.color);
    this.borderBox.setAttribute("stroke-width", "1");
    this.borderBox.setAttribute("stroke-dasharray", "2,2");
    this.container.appendChild(this.borderBox);

    // create all anchors, square as default
    const points = this.centerPoints.concat(this.cornerPoints);
    const handler = this;
    points.forEach((p) => {
      const anchor = document.createElementNS(JSFLOW_NAMESPACE, "rect");
      anchor.setAttribute("fill", handler.color);
      anchor.setAttribute("stroke", "#fff");
      anchor.setAttribute("stroke-width", "1");
      anchor.setAttribute("jsflow-anchor", p);
      anchor.setAttribute("width", JSFLOW_VERTEX_SIZE);
      anchor.setAttribute("height", JSFLOW_VERTEX_SIZE);
      handler.container.appendChild(anchor);
      handler.anchors[p] = anchor;
    });

    this.useTransformTool();
  }

  off() {
    if (this.inDom) {
      this.container.remove();
      this.inDom = false;
    }
  }

  update({ x, y, width, height }, center = false) {
    const handler = this;
    const pos = {
      nw: { x: 0, y: 0 }, // northwest
      ne: { x: width, y: 0 }, // northeast
      sw: { x: 0, y: height }, // southwest
      se: { x: width, y: height }, // southeast
      n: { x: width / 2, y: 0 }, // north
      e: { x: width, y: height / 2 }, // east
      w: { x: 0, y: height / 2 }, // west
      s: { x: width / 2, y: height }, // south
    };

    // update border
    this.borderBox.setAttribute("d", `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} L  0 0 Z`);
    // update offset/position
    if (center) {
      const t = `translate(${x}, ${y})`;
      // this.container.style.transform = t;
      // this.container.setAttribute("transform", t);
    } else {
      this.container.style.transform = "";
      this.container.removeAttribute("transform");
    }

    Object.entries(this.anchors).forEach(([p, el]) => {
      const { x, y } = pos[p];
      switch (handler.toolMode) {
        case "transform":
          el.setAttribute("x", x - JSFLOW_VERTEX_SIZE / 2);
          el.setAttribute("y", y - JSFLOW_VERTEX_SIZE / 2);
          break;
        case "path":
          el.setAttribute("cx", x);
          el.setAttribute("cy", y);
          break;
      }
    });

    return this;
  }

  useTransformTool() {
    if (this.toolMode === "transform") return;

    const handler = this;
    Object.entries(this.anchors).forEach(([p, el]) => {
      if (handler.centerPoints.includes(p) && el.tagName !== "rect") {
        const x = Number(el.getAttribute("cx")) || 0;
        const y = Number(el.getAttribute("cy")) || 0;
        // anchor is a center point
        el.remove();
        el = document.createElementNS(JSFLOW_NAMESPACE, "rect");
        el.setAttribute("fill", handler.color);
        el.setAttribute("stroke", "#fff");
        el.setAttribute("stroke-width", "1");
        el.setAttribute("jsflow-anchor", p);
        el.setAttribute("x", x - JSFLOW_VERTEX_SIZE / 2);
        el.setAttribute("y", y - JSFLOW_VERTEX_SIZE / 2);
        el.setAttribute("width", JSFLOW_VERTEX_SIZE);
        el.setAttribute("height", JSFLOW_VERTEX_SIZE);

        handler.cornerPointsOnly !== true && handler.container.appendChild(el);
        handler.anchors[p] = el;
      } else {
        handler.container.appendChild(el);
      }
    });

    this.container.appendChild(this.borderBox);
    this.toolMode = "transform";
    return this;
  }

  usePathTool() {
    if (this.toolMode === "path") return;

    const handler = this;
    Object.entries(this.anchors).forEach(([p, el]) => {
      el.remove();
      if (handler.centerPoints.includes(p) && el.tagName !== "circle") {
        // anchor is a center point
        const x = Number(el.getAttribute("x")) || 0;
        const y = Number(el.getAttribute("y")) || 0;
        el = document.createElementNS(JSFLOW_NAMESPACE, "circle");
        el.setAttribute("r", JSFLOW_VERTEX_SIZE / 2);
        el.setAttribute("fill", handler.color);
        el.setAttribute("stroke", "#fff");
        el.setAttribute("stroke-width", "1");
        el.setAttribute("jsflow-path-anchor", p);
        el.setAttribute("cx", x + JSFLOW_VERTEX_SIZE / 2);
        el.setAttribute("cy", y + JSFLOW_VERTEX_SIZE / 2);
        handler.container.appendChild(el);
        handler.anchors[p] = el;
      }
    });

    this.borderBox.remove();
    this.toolMode = "path";
    return;
  }
}
