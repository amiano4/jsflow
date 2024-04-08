import { canvas, customUserEvents } from "../utils/variables";
import mousedown from "./mousedown";

export default function init() {
  // begin mouse click
  canvas.element.addEventListener("mousedown", function (e) {
    Object.entries(mousedown).forEach(([fn, cb]) => {
      const value = cb(e);

      if (customUserEvents.hasOwnProperty(fn)) {
        customUserEvents[fn].forEach((customFn) => customFn(value));
      }
    });
  });

  if (customUserEvents.hasOwnProperty("init")) {
    customUserEvents.init.forEach((customFn) => customFn(canvas));
  }
}
