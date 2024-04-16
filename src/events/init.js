import { spz } from "../svgpanzoom";
import { canvas, customUserEvents } from "../utils/variables";
import keydown from "./keydown";
import keyup from "./keyup";
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

  canvas.element.addEventListener("wheel", function (e) {
    if (e.ctrlKey && spz.isMouseWheelZoomEnabled()) {
      e.preventDefault();
      console.log("h");
      // spz.enableMouseWheelZoom();
    }
  });

  document.body.addEventListener("keydown", function (e) {
    Object.entries(keydown).forEach(([fn, cb]) => {
      const value = cb(e);

      if (customUserEvents.hasOwnProperty(fn)) {
        customUserEvents[fn].forEach((customFn) => customFn(value));
      }
    });
  });

  document.body.addEventListener("keyup", function (e) {
    Object.entries(keyup).forEach(([fn, cb]) => {
      const value = cb(e);

      if (customUserEvents.hasOwnProperty(fn)) {
        customUserEvents[fn].forEach((customFn) => customFn(value));
      }
    });
  });

  addEventListener("resize", function (e) {
    canvas.element.setAttribute("height", canvas.container.clientHeight);
    canvas.element.setAttribute("width", canvas.container.clientWidth);
  });

  if (customUserEvents.hasOwnProperty("init")) {
    customUserEvents.init.forEach((customFn) => customFn(canvas));
  }
}
