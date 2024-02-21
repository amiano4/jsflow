import Shape from "./shape.js";

export default class Diamond extends Shape {
  constructor(options) {
    super("polygon");
    this.nodes.textNode.style.maxWidth = "40%";
    this.lockUpdate(options);
  }

  updateEntity() {
    const { width, height } = this.state.prev;
    const points = `${width / 2} 0, ${width} ${height / 2}, ${width / 2} ${height}, 0 ${height / 2}`;
    this.nodes.entity.setAttribute("points", points);
  }

  setTextEditOn(mode = true) {
    if (mode !== true) {
      // stop edit
      const text = this.nodes.textNode.innerHTML;
      this.nodes.textNode.innerHTML = text.replace(/^(<br>)+|(<br>)+$/g, "");
      const height = this.nodes.textNode.clientHeight;
      if (this.height * 0.4 <= height) {
        this.update({ height: height + height * 0.6 }, true);
      }
      this.nodes.textNode.removeAttribute("contenteditable");
    } else {
      // start edit
      this.nodes.textNode.contentEditable = true;
      this.nodes.textNode.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(this.nodes.textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}
