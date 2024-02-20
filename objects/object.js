import { canvas } from "../diagram/canvas.js";
import Rectangle from "./rectangle.js";
import Ellipse from "./ellipse.js";
import Diamond from "./diamond.js";
import Circle from "./circle.js";
import Text from "./text.js";
import Shape from "./shape.js";
import { getSPZ } from "../diagram/spz.js";
import { startConnection, endConnection, connectorMode } from "./connector.js";
import { AnchorKeys } from "../diagram/util.js";
import { triggerCustomEvent } from "../diagram/event.js";

const shapeCollection = {
  Rectangle,
  Ellipse,
  Diamond,
  Circle,
  Text,
};

let obj = null;
let hovered = null;
let busyIsCalled = false;

export function create(shape, config) {
  if (!shapeCollection.hasOwnProperty(shape)) {
    console.error("Incorrect shape to be created.");
    return null;
  }

  obj = new shapeCollection[shape](config);
  canvas[obj.id] = obj;

  if (shape == "Text") {
    canvas.texts.appendChild(obj.nodes.container);
  } else {
    canvas.palette.appendChild(obj.nodes.container);
  }

  obj.useResizeHandler();
  obj.setOn(true);

  return obj;
}

export function object(isCurrent = true) {
  if (isCurrent === "plotting" && isCurrent !== obj) {
    if (obj instanceof Shape) {
      obj.reset();
    }

    return isCurrent === obj ? true : (obj = isCurrent);
  } else if (isCurrent === null) {
    if (obj instanceof Shape) {
      obj.reset();
    }

    return !(obj = null);
  } else if (typeof isCurrent === "string") {
    if (obj instanceof Shape) {
      // remove focus from the previous selected object
      obj.reset();
    }
    obj = null;
    if ((obj = canvas[isCurrent]) instanceof Shape) {
      if (hovered instanceof Shape && hovered.id === obj.id) {
        hovered = null;
      }

      // requested object is valid
      // it should gain focus and brought to front
      canvas[obj.isText ? "texts" : "palette"].appendChild(obj.nodes.container);
      obj.useResizeHandler();
      obj.setOn(true);
    }
    return obj;
  } else if (isCurrent === true) {
    return !(obj instanceof Shape) ? null : obj;
  }
  return obj;
}

export function grabObj(x, y) {
  if (!(obj instanceof Shape) || !obj.controller.status || obj.controller.mode !== "transform") {
    return false;
  }
  obj.state.drag = { x, y };
  getSPZ().disablePan();
  return true;
}

export function dragObj(x, y) {
  if (!(obj instanceof Shape) || !obj.state.drag) {
    return false;
  }
  obj.update({
    x: obj.x + (x - obj.state.drag.x),
    y: obj.y + (y - obj.state.drag.y),
  });
  if (!busyIsCalled) {
    triggerCustomEvent("onbusy");
    busyIsCalled = true;
  }
  return true;
}

export function dropObj(x, y) {
  if (!(obj instanceof Shape) || !obj.state.drag) {
    return false;
  }

  obj.lockUpdate({
    x: obj.x + (x - obj.state.drag.x),
    y: obj.y + (y - obj.state.drag.y),
  });

  obj.state.drag = null;
  getSPZ().enablePan();

  busyIsCalled = false;
  triggerCustomEvent("onstandby");
  return true;
}

export function resizeStart(key) {
  if (!(obj instanceof Shape) || !obj.controller.status || obj.controller.mode !== "transform") {
    return false;
  }

  obj.state.resize = obj.state.prev;
  obj.state.resize.key = key;
  getSPZ().disablePan();

  return true;
}

export function resize(x, y) {
  if (!(obj instanceof Shape) || !obj.controller.status || !obj.state.resize) {
    return false;
  }
  obj.resize(x, y);
  if (!busyIsCalled) {
    triggerCustomEvent("onbusy");
    busyIsCalled = true;
  }
  return true;
}

export function resizeEnd() {
  if (!(obj instanceof Shape) || !obj.controller.status || !obj.state.resize) {
    return false;
  }

  obj.lockUpdate(obj.state.prev);
  obj.state.resize = null;
  getSPZ().enablePan();

  if (busyIsCalled) {
    triggerCustomEvent("onstandby");
    busyIsCalled = false;
  }
  return true;
}

export function hovers(id) {
  if (obj === "plotting" || !connectorMode() || (obj instanceof Shape && (obj.state.drag || obj.state.resize))) return;

  // valid shape id
  if (canvas[id] instanceof Shape) {
    // there is an active shape
    // there is a previously hovered shape
    // not the previously hovered shape
    if (hovered instanceof Shape && id === hovered.id) {
      return;
    }

    // not the active shape
    if (obj instanceof Shape && id === obj.id && obj.controller.mode === "transform") {
      // remove hover from previous
      if (hovered instanceof Shape) {
        hovered.reset();
        hovered = null;
      }
      return;
    }

    if (hovered instanceof Shape) {
      hovered.reset();
    }

    hovered = canvas[id];
    hovered.usePathHandler();
    hovered.setOn(true);
  } else {
    if (hovered instanceof Shape) {
      hovered.reset();
    }
    hovered = null;
  }
}

export function isSource(id, key) {
  if (!(canvas[id] instanceof Shape) && !AnchorKeys.center.includes(key)) {
    console.error("Invalid source parameter(s).");
    return false;
  }
  const objTemp = canvas[id];
  const { x, y } = objTemp.getControllerNodesCoordinate(key, true);
  const conn = startConnection(x, y);
  conn.fromId = id;
  objTemp.connectors.out.push([conn.id, key]);
  return true;
}

export function isDestination(id, key) {
  if (!(canvas[id] instanceof Shape) && !AnchorKeys.center.includes(key)) {
    console.error("Invalid destination parameter(s).");
    return false;
  }

  const objTemp = canvas[id];
  const { x, y } = objTemp.getControllerNodesCoordinate(key, true);
  const conn = endConnection(x, y);
  conn.toId = id;
  objTemp.connectors.in.push([conn.id, key]);
  return true;
}
