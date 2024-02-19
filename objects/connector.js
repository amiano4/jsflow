import { canvas } from "../diagram/canvas.js";
import { getSPZ } from "../diagram/spz.js";
import { Ids, uniqid, Colors, Sizes, lineOffset } from "../diagram/util.js";
import { object } from "./object.js";
import Shape from "./shape.js";

export default class Connector {
  constructor(x, y) {
    this.coords = [[x, y]];
    this.isElbow = false;
    this.appearance = {};
    this.isMoving = false;
    this.movingAnchor = null;
    this.fromId = null;
    this.toId = null;
    this.dragOrigin = null;

    // this.container;
    this.entity = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.id = uniqid("con");
    this.entity.custom(Ids.connector, this.id);

    this.anchors = [this.createAnchor(0)];

    this.anchorGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.externalEntity = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.externalEntity.setAttribute("fill", "none");
    this.externalEntity.setAttribute("stroke", Colors.alpha100);
    this.externalEntity.setAttribute("stroke-width", Sizes.anchor * 0.75);
    this.externalEntity.custom(Ids.connector, this.id);
    this.externalEntity.custom("external");
    this.anchorGroup.custom(Ids.connector, this.id);
  }

  createAnchor(point) {
    const a = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    a.setAttribute("fill", "#fff");
    a.setAttribute("stroke", Colors.lightblue);
    a.setAttribute("stroke-width", "1");
    a.custom(Ids.anchor_path, point);
    a.setAttribute("cx", Sizes.anchor / 2);
    a.setAttribute("cy", Sizes.anchor / 2);
    a.setAttribute("r", Sizes.anchor / 2);
    return a;
  }

  setAppearance(options) {
    if (options.stroke) {
      this.appearance.stroke = options.stroke;
      this.entity.setAttribute("stroke", options.stroke);
    }

    if (options.strokeWidth) {
      this.appearance.strokeWidth = options.strokeWidth;
      this.entity.setAttribute("stroke-width", options.strokeWidth);
    }

    if (options.strokeDashArray) {
      this.appearance.strokeDashArray = options.strokeDashArray;
      this.entity.setAttribute("stroke-dasharray", options.strokeDashArray);
    } else {
      this.appearance.strokeDashArray = options.strokeDashArray;
      this.entity.removeAttribute("stroke-dasharray");
    }

    if (options.arrow) {
      this.appearance.arrow = options.arrow;
      if (options.arrow == "arrow") {
        this.entity.setAttribute("marker-end", "url(#arrowheadend)");
      } else if (options.arrow == "double-arrow") {
        this.entity.setAttribute("marker-end", "url(#arrowheadend)");
        this.entity.setAttribute("marker-start", "url(#arrowheadstart)");
      }
    } else if (options.arrow === null) {
      this.appearance.arrow = null;
      this.entity.removeAttribute("marker-start");
      this.entity.removeAttribute("marker-end");
    }
  }

  move(index, x, y, lock = false, showAnchors = true) {
    if (index === -1) index = this.coords.length - 1;
    let d = "M "; // start d value
    this.coords[index] = [x, y]; // reassign coordinates
    for (let i in this.coords) {
      // begin drawing the line
      if (i == 1) d += "L ";

      // skip undefined set
      if (!this.coords[i]) continue;

      // initialize destination
      let fx = this.coords[i][0];
      let fy = this.coords[i][1];

      // adjust line distance from the source to destination
      // so the cursor can still detect the targeted element (not the line itself)
      // only for endpoints
      if (!lock && i == index && (i == 0 || i == this.coords.length - 1)) {
        let x2 = x,
          y2 = y,
          x1 = this.coords[i == 0 ? 1 : i - 1][0],
          y1 = this.coords[i == 0 ? 1 : i - 1][1];
        // Calculate the distance between the source point and the cursor location
        const distanceToCursor = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        // Calculate the adjusted distance (distance to cursor - distance before cursor)
        const adjustedDistance = distanceToCursor - (distanceToCursor <= 10 ? 5 : 10);
        // const adjustedDistance = distanceToCursor - 20;
        // Calculate the angle between the line connecting the source point and the cursor location, and the x-axis
        const angle = Math.atan2(y2 - y1, x2 - x1);
        // Calculate the coordinates of the point at the adjusted distance from the source point along this angle
        fx = x1 + adjustedDistance * Math.cos(angle);
        fy = y1 + adjustedDistance * Math.sin(angle);
      }
      // write path
      d += fx + " " + fy + " ";
    }
    // update
    this.entity.setAttribute("d", d + "");
    this.externalEntity.setAttribute("d", d + "");

    if (lock) {
      for (let a in this.coords) {
        if (!this.anchors[a]) this.anchors[a] = this.createAnchor(a);
        this.anchors[a].setAttribute("cx", this.coords[a][0]);
        this.anchors[a].setAttribute("cy", this.coords[a][1]);
        showAnchors && this.anchorGroup.appendChild(this.anchors[a]);
      }
      showAnchors && canvas.wrapper.appendChild(this.anchorGroup);
    }
  }
}

let obj = null;
let enabledAll = false;
let lastDragCoords = null;

export function connectorMode(mode = null) {
  if (mode === false || mode instanceof Connector) {
    obj = null;
    showPorts(false);
    canvas.diagram.style.cursor = "default";
    getSPZ().enablePan();

    if (mode instanceof Connector) {
      return (obj = mode);
    }
  } else if (mode !== null) {
    obj = mode;
    showPorts(true);
    canvas.diagram.style.cursor = "crosshair";
  }

  return typeof obj === "string";
}

export function startConnection(x, y) {
  if (!connectorMode()) {
    console.error("Invalid start connection call.");
    return false;
  }

  const options = {
    stroke: Colors.lightblue_alpha,
    strokeWidth: 1,
    strokeDashArray: "2,5",
  };

  if (obj == "arrow" || obj == "arrow-elbow") options.arrow = "arrow";
  else if (obj == "double-arrow" || obj == "double-arrow-elbow") options.arrow = "double-arrow";

  // x = Math.round(x / Sizes.perNode) * Sizes.perNode;
  // y = Math.round(y / Sizes.perNode) * Sizes.perNode;

  obj = new Connector(x, y);
  obj.isMoving = true;
  obj.setAppearance(options);

  canvas[obj.id] = obj;
  canvas.connects.appendChild(obj.entity);
  canvas.connects.appendChild(obj.externalEntity);
  getSPZ().disablePan();
  return obj;
}

export function connect(x, y) {
  if (!(obj instanceof Connector) || !obj.isMoving) return false;
  obj.move(obj.movingAnchor || 1, x, y, false, false);
  return true;
}

export function endConnection(x, y, snap = false) {
  if (!(obj instanceof Connector) || !obj.isMoving) return false;

  if (snap) {
    x = Math.round(x / Sizes.perNode) * Sizes.perNode;
    y = Math.round(y / Sizes.perNode) * Sizes.perNode;
  }

  obj.move(obj.movingAnchor || 1, x, y, true, true);
  obj.setAppearance({
    stroke: "#000",
    strokeWidth: 1,
    strokeDashArray: null,
  });
  obj.movingAnchor = null;
  obj.isMoving = false;
  connectorMode(obj);
  return obj;
}

export function showPorts(mode) {
  if (mode === enabledAll) return;
  Object.values(canvas).forEach((obj) => {
    if (obj instanceof Shape) {
      if (!mode) {
        obj.reset();
        enabledAll = false;
      } else {
        enabledAll = true;
        obj.usePathHandler();
        obj.setOn(true);
      }
    }
  });
}

export function leaveConnectors() {
  Object.values(canvas).forEach((obj) => {
    if (obj instanceof Connector) {
      obj.anchorGroup.remove();
    }
  });
  connectorMode(false);
  return true;
}

export function focusOnConnector(id, mode = true) {
  if ((obj instanceof Connector && (obj.isMoving || obj.movingAnchor)) || !(canvas[id] instanceof Connector))
    return false;

  if (mode) {
    leaveConnectors();
    obj = canvas[id];
    obj.isMoving = false;
    canvas.wrapper.appendChild(obj.anchorGroup);
  } else {
    canvas[id].anchorGroup.remove();
  }
  return true;
}

export function createConnector(x, y) {
  const options = {
    stroke: Colors.black,
    strokeWidth: 1,
    strokeDashArray: null,
  };

  if (obj == "arrow" || obj == "arrow-elbow") options.arrow = "arrow";
  else if (obj == "double-arrow" || obj == "double-arrow-elbow") options.arrow = "double-arrow";

  x = Math.round(x / Sizes.perNode) * Sizes.perNode;
  y = Math.round(y / Sizes.perNode) * Sizes.perNode;

  const con = new Connector(x, y);
  con.isMoving = false;
  con.setAppearance(options);
  con.move(1, x + 50, y + 50, true);

  canvas[con.id] = con;
  canvas.connects.appendChild(con.entity);
  canvas.connects.appendChild(con.externalEntity);
  connectorMode(con);
  return true;
}

export function grabConnector(index) {
  if (!(obj instanceof Connector)) return false;

  obj.setAppearance({
    stroke: Colors.lightblue_alpha,
    strokeWidth: 1,
    strokeDashArray: "2,5",
  });

  if ((obj.fromId && index == 0) || (obj.toId && index == obj.coords.length - 1)) {
    disconnect();
  }

  obj.isMoving = true;
  obj.movingAnchor = index;
  obj.anchors[index].remove();

  showPorts(true);
  getSPZ().disablePan();
  return true;
}

export function disconnect() {
  if (!(obj instanceof Connector)) return false;
  if (obj.fromId) {
    const temp = canvas[obj.fromId];
    temp.connectors["out"] = temp.connectors["out"].filter(([id, key]) => {
      if (id !== obj.id) {
        obj.fromId = null;
        return true;
      }
    });
  }
  if (obj.toId) {
    const temp = canvas[obj.toId];
    temp.connectors["in"] = temp.connectors["in"].filter(([id, key]) => {
      if (id !== obj.id) {
        obj.toId = null;
        return true;
      }
    });
  }
  return true;
}

export function reroute(id, key) {
  if (!(obj instanceof Connector) || !obj.isMoving) return false;

  if (obj.movingAnchor == 0 || obj.movingAnchor == obj.coords.length - 1) {
    // is rerouted source point to a shape
    const objTemp = canvas[id];
    const { x, y } = objTemp.getControllerNodesCoordinate(key, true);

    if (obj.movingAnchor == 0) {
      obj.fromId = id;
      objTemp.connectors.out.push([obj.id, key]);
    } else {
      obj.toId = id;
      objTemp.connectors.in.push([obj.id, key]);
    }
    endConnection(x, y);
    return true;
  }
  return false;
}

export function startDrag(x, y) {
  if (!(obj instanceof Connector)) return false;
  obj.dragOrigin = { x, y };
  getSPZ().disablePan();
  object(null);
  return true;
}

export function dragConnector(x, y) {
  if (!(obj instanceof Connector) || !obj.dragOrigin || obj.isMoving) return false;
  lastDragCoords = [];
  const dr = obj.dragOrigin;
  x -= dr.x;
  y -= dr.y;
  let d = "M ";
  for (let i in obj.coords) {
    if (i == 1) d += "L ";
    let fx = obj.coords[i][0] + x;
    let fy = obj.coords[i][1] + y;
    // write path
    d += fx + " " + fy + " ";
    lastDragCoords[i] = [fx, fy];
  }

  // update
  obj.entity.setAttribute("d", d + "");
  obj.externalEntity.setAttribute("d", d + "");

  for (let a in lastDragCoords) {
    if (!obj.anchors[a]) obj.anchors[a] = obj.createAnchor(a);
    obj.anchors[a].setAttribute("cx", lastDragCoords[a][0]);
    obj.anchors[a].setAttribute("cy", lastDragCoords[a][1]);
    obj.anchorGroup.appendChild(obj.anchors[a]);
  }
  canvas.wrapper.appendChild(obj.anchorGroup);

  return true;
}

export function dropConnector(x, y) {
  if (!(obj instanceof Connector) || !obj.dragOrigin) return false;

  if (lastDragCoords) {
    x = Math.round(x / Sizes.perNode) * Sizes.perNode;
    y = Math.round(y / Sizes.perNode) * Sizes.perNode;
    dragConnector(x, y);
    obj.coords = lastDragCoords;
    disconnect();
  }

  obj.dragOrigin = null;
  lastDragCoords = null;
  getSPZ().enablePan();
  return true;
}
