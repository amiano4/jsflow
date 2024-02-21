import Shape from "./shape.js";

export default class Rectangle extends Shape {
  constructor(options) {
    super("rect");
    this.lockUpdate(options);
  }
}
