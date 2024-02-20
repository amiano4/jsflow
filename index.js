import { Sizes } from "./diagram/util.js";
import { diagram, canvas, IsEnabled } from "./diagram/canvas.js";
import { Init, getSPZ } from "./diagram/spz.js";
import { plotIn } from "./objects/plotter.js";
import { Subscriptions, bindEventsOn } from "./diagram/event.js";
import { object } from "./objects/object.js";
import { connectorMode, leaveConnectors } from "./objects/connector.js";
import { Customize } from "./custom.js";

// enable console logging
window.EnableDebugging = true;
window.EnableJSF = IsEnabled;

const svgElement = document.getElementById("jsfdiagram");
const container = document.querySelector(".jsf-container");

let width = container.clientWidth;
let height = container.clientHeight;

canvas.diagram = diagram(svgElement, width, height);
Init(canvas.diagram);
bindEventsOn(canvas);
Customize(Subscriptions);
EnableJSF(true);

const size = Sizes.perNode * Sizes.gridNodes;
const spz = getSPZ();

// default pan to center
spz.pan({ x: -(size - width) / 2, y: -(size - height) / 2 });

const containment = document.getElementById("jsfDiagramContainment");
containment.appendChild(container);

containment.querySelectorAll("[data-btn-shape]").forEach((e) => {
  e.addEventListener("click", function (evt) {
    if (!IsEnabled()) return;
    connectorMode(false);
    leaveConnectors();
    object("plotting"); // reset object buffer
    const shapeType = this.getAttribute("data-btn-shape");
    plotIn(shapeType, canvas.wrapper);
    this.blur();
  });
});

containment.querySelectorAll("[data-btn-connector]").forEach((e) => {
  e.addEventListener("click", function (evt) {
    if (!IsEnabled()) return;
    const type = this.getAttribute("data-btn-connector");
    leaveConnectors();
    object(null);
    connectorMode(type);
    this.blur();
  });
});

containment.querySelectorAll("[data-btn-fn]").forEach((e) => {
  e.addEventListener("click", function (evt) {
    if (!IsEnabled()) return;
    const fn = this.getAttribute("data-btn-fn");
    switch (fn) {
      case "zoomin":
        spz.zoomIn();
        break;
      case "zoomout":
        spz.zoomOut();
        break;
      case "zoomreset":
        spz.resetZoom();
        spz.pan({ x: -(size - width) / 2, y: -(size - height) / 2 });
        break;
    }
    this.blur();
  });
});

$(".colorSelector").each(function () {
  $(this).minicolors({
    control: "hue",
    defaultValue: "",
    inline: false,
    letterCase: "lowercase",
    position: "bottom left",
    opacity: false,
    change: function (hex, opacity) {
      if (!hex) return;
      if (opacity) hex += ", " + opacity;
      if (typeof console === "object") {
        console.log(hex);
      }
    },
    theme: "bootstrap",
  });
});
