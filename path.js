class Path {
  constructor({ x, y }, type = "solid") {
    this.origin = { x, y };
    this.end = { x: 0, y: 0 };
    // this.lineVaa = "straight";
    this.type = type;
    this.color = "#000"; // default (black)
    this.thickness = 1;

    this.node = document.createElementNS(JSFLOW_NAMESPACE, "path");
    this.variant({ type });
  }

  variant({ type, color, thickness }) {
    type = type || this.type;

    if (type === "dashed") {
      this.node.setAttribute("stroke-dasharray", "5,3");
    } else if (type === "dotted") {
      this.node.setAttribute("stroke-dasharray", "2,2");
    } else if (type === "solid") {
      this.node.removeAttribute("stroke-dasharray");
    } else {
      console.error("Invalid path type.");
      return;
    }

    this.type = type;
    this.color = color || this.color;
    this.thickness = thickness || this.thickness;

    this.node.setAttribute("stroke", this.color);
    this.node.setAttribute("stroke-width", this.thickness);
    return this;
  }

  update({ x, y }) {
    // ...
  }
}
