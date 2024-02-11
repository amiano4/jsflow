class Plotter {
  constructor(object, options = {}) {
    this.node = document.createElementNS(JSFLOW_NAMESPACE, "rect");
    this.strokeWidth = 1;
    this.strokeDashArray = "5,5";
    this.passiveFill = "#1c9ce23d";
    this.passiveStroke = "#1c9ce2";
    this.readyFill = "#00a5ff7d";
    this.readyStroke = "#00a5ff";
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = 0;
    this.height = 0;
    this.shape = object;

    this.node.setAttribute("x", this.x);
    this.node.setAttribute("y", this.y);
    this.node.setAttribute("width", this.width);
    this.node.setAttribute("height", this.height);
    this.node.setAttribute("fill", this.passiveFill);
    this.node.setAttribute("stroke", this.passiveStroke);
    this.node.setAttribute("stroke-width", this.strokeWidth);
    this.node.setAttribute("stroke-dasharray", this.strokeDashArray);
  }

  update({ x, y, width, height }, lock = false) {
    width = Math.abs(width);
    height = Math.abs(height);

    const r =
      width > JSFLOW_MIN_PLOTTER_SIZE &&
      width < JSFLOW_MAX_PLOTTER_SIZE &&
      height > JSFLOW_MIN_PLOTTER_SIZE &&
      height < JSFLOW_MAX_PLOTTER_SIZE;

    this.node.setAttribute("x", x);
    this.node.setAttribute("y", y);
    this.node.setAttribute("width", width);
    this.node.setAttribute("height", height);
    this.node.setAttribute("fill", r ? this.readyFill : this.passiveFill);
    this.node.setAttribute("stroke", r ? this.readyStroke : this.passiveStroke);

    if (lock) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
    return this;
  }

  toShape() {
    return this.width > JSFLOW_MIN_PLOTTER_SIZE &&
      this.width < JSFLOW_MAX_PLOTTER_SIZE &&
      this.height > JSFLOW_MIN_PLOTTER_SIZE &&
      this.height < JSFLOW_MAX_PLOTTER_SIZE
      ? this.shape
      : false;
  }

  cancel() {
    this.node.remove();
  }
}
