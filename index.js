import { Sizes } from "./diagram/util.js";
import { diagram, canvas, IsEnabled } from "./diagram/canvas.js";
import { Init, getSPZ } from "./diagram/spz.js";
import { plotIn } from "./objects/plotter.js";
import { Subscriptions, bindEventsOn } from "./diagram/event.js";
import { object } from "./objects/object.js";
import Connector, { connectorMode, leaveConnectors } from "./objects/connector.js";
import { Customize, setCCP } from "./custom.js";
import { exportDiagram } from "./diagram/image.js";
import Shape from "./objects/shape.js";
import Rectangle from "./objects/rectangle.js";
import Circle from "./objects/circle.js";
import Text from "./objects/text.js";
import Diamond from "./objects/diamond.js";
import Ellipse from "./objects/ellipse.js";

// enable console logging
window.EnableDebugging = true;
window.EnableJSF = IsEnabled;
window.setCCPToDiagram = setCCP;

const shapeCollection = {
  Rectangle,
  Circle,
  Text,
  Connector,
  Diamond,
  Ellipse,
};

const svgElement = document.getElementById("jsfdiagram");
const container = document.querySelector(".jsf-container");

let width = container.clientWidth;
let height = container.clientHeight;

canvas.diagram = diagram(svgElement, width, height);
Init(canvas.diagram);
EnableJSF(true);
bindEventsOn(canvas);
Customize(Subscriptions);

window.ExportJSF = (callback) => exportDiagram(canvas, callback);

const size = Sizes.perNode * Sizes.gridNodes;
const spz = getSPZ();

// default pan to center
spz.pan({ x: -(size - width) / 2, y: -(size - height) / 2 });

const containment = document.getElementById("jsfDiagramContainment");
containment.appendChild(container);

containment.querySelectorAll("[data-btn-shape]").forEach((e) => {
  e.addEventListener("click", function (evt) {
    if (!IsEnabled()) return;
    const shapeType = this.getAttribute("data-btn-shape");
    connectorMode(false);
    leaveConnectors();
    object("plotting"); // reset object buffer
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

window.getJSFDiagram = function () {
  const jsf = [];
  Object.entries(canvas).forEach(([id, obj]) => {
    if (obj instanceof Shape || obj instanceof Connector) {
      if (obj instanceof Shape) obj.setOn(false);
      jsf.push(obj.get());
    }
  });
  return jsf;
};

window.setJSFDiagram = function (data) {
  if (!data) return;
  data.forEach((d) => {
    if (d.type == "Connector") {
      const line = new Connector(d.coords[0][0], d.coords[0][1]);
      canvas[d.id] = line;
      line.coords = d.coords;
      line.setId(d.id);
      line.setAppearance(d.appearance, true);
      let p = "M ";
      for (let i in d.coords) {
        if (i == 1) p += "L ";
        let fx = d.coords[i][0];
        let fy = d.coords[i][1];
        p += fx + " " + fy + " ";
      }

      // update
      line.entity.setAttribute("d", p + "");
      line.externalEntity.setAttribute("d", p + "");

      line.lineType = d.line;
      line.fromId = d.from;
      line.toId = d.to;
      canvas.connects.appendChild(line.entity);
      canvas.connects.appendChild(line.externalEntity);
    } else {
      const options = {
        x: d.x,
        y: d.y,
        width: d.w,
        height: d.h,
      };
      const obj = new shapeCollection[d.type || "Rectangle"](options);

      obj.state.prev = options;
      obj.setId(d.id);
      obj.setAppearance(d.appearance, true);
      obj.connectors = d.connectors;
      obj.outline = d.outline;
      obj.lockUpdate(options);
      canvas[d.id] = obj;

      obj.nodes.textNode.textContent = d.text || "Add text here";
      d.step && obj.processStep(d.step);
      if (d.type == "Text") {
        canvas.texts.appendChild(obj.nodes.container);
      } else {
        canvas.palette.appendChild(obj.nodes.container);
      }

      if (d.ccp) {
        setCCP(d.id, d.ccp);
        console.log(d.cpp);
      }
      // obj.useResizeHandler();
      // obj.setOn(true);
      // obj.setOn(false);
      // console.log(obj);
    }
  });
};

setJSFDiagram(window.HACCPDIAGRAM);
