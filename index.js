import { Sizes } from "./diagram/util.js";
import { diagram, canvas } from "./diagram/canvas.js";
import { Init, getSPZ } from "./diagram/spz.js";
import { plotIn } from "./objects/plotter.js";
import { bindEventsOn } from "./diagram/event.js";
import { object } from "./objects/object.js";
import { connectorMode } from "./objects/connector.js";

// Sizes.gridNodes = 500;

const svgElement = document.getElementById("jsfdiagram");
const container = document.querySelector(".jsf-container");

let width = container.clientWidth;
let height = container.clientHeight;

canvas.diagram = diagram(svgElement, width, height);
Init(canvas.diagram);
bindEventsOn(canvas);

const size = Sizes.perNode * Sizes.gridNodes;
const spz = getSPZ();

// default pan to center
spz.pan({ x: -(size - width) / 2, y: -(size - height) / 2 });

const containment = document.getElementById("jsfDiagramContainment");
containment.appendChild(container);

document.querySelectorAll("[data-btn-shape]").forEach((e) => {
    e.addEventListener("click", function (evt) {
        connectorMode(false);
        object("plotting"); // reset object buffer
        const shapeType = evt.target.getAttribute("data-btn-shape");
        plotIn(shapeType, canvas.wrapper);
    });
});

document.querySelectorAll("[data-btn-connector]").forEach((e) => {
    e.addEventListener("click", function (evt) {
        const type = evt.target.getAttribute("data-btn-connector");
        object(null);
        connectorMode(type);
    });
});
