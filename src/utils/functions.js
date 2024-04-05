import { spz } from "../svgpanzoom";
import { Pixels, canvas } from "./variables";

export function panToCenter() {
  const nodeSize = Pixels.SIZE * Pixels.GRID;
  spz.pan({ x: -(nodeSize - canvas.width) / 2, y: -(nodeSize - canvas.height) / 2 });
}
