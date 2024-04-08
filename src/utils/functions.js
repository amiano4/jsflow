import { spz } from "../svgpanzoom";
import { Pixels, canvas } from "./variables";

export function panToCenter() {
  const nodeSize = Pixels.SIZE * Pixels.GRID;
  spz.pan({ x: -(nodeSize - canvas.width) / 2, y: -(nodeSize - canvas.height) / 2 });
}

export function getMouse(evt) {
  const { x: rx, y: ry } = canvas.element.getBoundingClientRect();
  const mouse = {
    // cursor position relative to viewport
    x: evt.clientX - rx,
    y: evt.clientY - ry,
  };

  const svgMatrix = canvas.wrapper.transform.baseVal.consolidate().matrix;
  mouse.scale = svgMatrix.a;
  mouse.offset = {
    x: svgMatrix.e,
    y: svgMatrix.f,
  };

  mouse.x -= mouse.offset.x;
  mouse.y -= mouse.offset.y;
  mouse.x /= mouse.scale;
  mouse.y /= mouse.scale;
  // relative to grid

  mouse.toGrid = {
    x: Math.floor((mouse.x + (Sizes.gridNodes * Sizes.perNode) / 2) / Sizes.perNode),
    y: Math.floor((mouse.y + (Sizes.gridNodes * Sizes.perNode) / 2) / Sizes.perNode),
  };

  return mouse;
}
