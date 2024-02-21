import Shape from "./shape.js";

export default class Ellipse extends Shape {
  constructor(options) {
    super("ellipse");
    this.lockUpdate(options);
  }

  updateEntity() {
    const { width, height } = this.state.prev;
    this.nodes.entity.setAttribute("cx", width / 2);
    this.nodes.entity.setAttribute("cy", height / 2);
    this.nodes.entity.setAttribute("rx", width / 2);
    this.nodes.entity.setAttribute("ry", height / 2);
  }
}
