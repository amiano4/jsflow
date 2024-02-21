import {
  connect,
  connectorMode,
  createConnector,
  dragConnector,
  dropConnector,
  endConnection,
  focusOnConnector,
  grabConnector,
  leaveConnectors,
  reroute,
  startDrag,
} from "../objects/connector.js";
import {
  dragObj,
  dropObj,
  grabObj,
  object,
  resizeEnd,
  resize,
  resizeStart,
  hovers,
  isSource,
  isDestination,
} from "../objects/object.js";
import { plotStart, plot, plotEnd } from "../objects/plotter.js";
import { IsEnabled } from "./canvas.js";
import { getSPZ } from "./spz.js";
import { Ids, getMouse, maxClickTimer } from "./util.js";

export const Subscriptions = {
  // onshapefocus
  // onshapeblur
  // ontextchange
  // onconnectorfocus
  // onconnectorblur
  // onbusy
  // onstandby
};

export function triggerCustomEvent(eventName, args) {
  if (Subscriptions.hasOwnProperty(eventName)) {
    Subscriptions[eventName](args);
  }
}

export function bindEventsOn(canvas) {
  // helper function that returns the closest element of a required target
  const is = (event, closest = null) => {
    if (!closest) {
      return event.target;
    }
    return event.target.closest(`[data-${closest}]`) || null;
  };

  const { shape, anchor_connector, connector, anchor_resize, anchor_path, text } = Ids;

  let clickTimer = 0;

  canvas.diagram.addEventListener("mousedown", (e) => {
    if (!IsEnabled()) return;

    const { x, y } = getMouse(canvas, e);
    let t = null;
    let t2 = null;

    // turn off text edit in the next click
    if ((t = object()) && t.state.textedit) {
      t.setTextEditOn(false);
    }

    // when user creates new shape
    if (plotStart(x, y)) return;

    // grabbing connector points
    if (
      (t = is(e, anchor_path)) &&
      // storing the parent to get the intended connector class
      (t2 = is(e, connector)) &&
      grabConnector(t.dataset[anchor_path])
    )
      return;

    // pathing from shape handler
    if (
      // first connector point
      (t = is(e, anchor_connector)) &&
      // is a shape port
      isSource(t.parentElement.dataset[shape], t.dataset[anchor_connector])
    )
      return;

    // connector mode is on
    // or clicking on a connector
    if (
      connectorMode() ||
      ((t = is(e, connector)) &&
        // dragging on the connector itself
        ((focusOnConnector(t.dataset[connector], true) &&
          // drag start
          startDrag(x, y)) ||
          // plainly clicked on the line body
          !is(e, anchor_path)))
    )
      return;

    // remove focus from active connector(s)
    leaveConnectors();

    // resizing
    if ((t = is(e, anchor_resize)) && resizeStart(t.dataset[anchor_resize])) return;

    // clicks on a shape
    // with active object
    if ((t = is(e, shape)) && object()) {
      return object().id === t.id // checks if the targeted shape is the active one
        ? grabObj(x, y) // prepare for dragging
        : // reset active to the currently selected shape
          // simulate dragging directly
          object(t.id) && grabObj(x, y);
    }

    // clicks on a shape
    // assumes no current active shape is selected
    // if a valid shape, simulate grab
    if ((t = is(e, shape)) && object(t.id) && grabObj(x, y)) return;

    // no shape is selected
    // deactive active object if any
    if (!is(e, shape) && object(null)) return;
  });

  canvas.diagram.addEventListener("mousemove", (e) => {
    if (!IsEnabled()) return;

    const { x, y } = getMouse(canvas, e);

    if (
      // while plotting
      dragConnector(x, y) ||
      connect(x, y) ||
      plot(x, y) ||
      resize(x, y) ||
      dragObj(x, y)
    ) {
      // console.log("dragging ");
    }
  });

  canvas.diagram.addEventListener("mouseup", (e) => {
    if (!IsEnabled()) return;

    const { x, y } = getMouse(canvas, e);
    let t = null;

    if ((t = is(e, text))) {
      const time = new Date().getTime();
      if (time - clickTimer <= maxClickTimer) {
        t = object(is(e, shape).id);
        // t.reset();
        t.setTextEditOn(true);
        return;
      }
      clickTimer = time;
    }

    if (dropConnector(x, y) || (connectorMode() && createConnector(x, y))) return;

    if ((t = is(e, connector)) && focusOnConnector(t.dataset[connector]) && object(null)) return;

    if (
      // terminating connectors
      ((t = is(e, anchor_connector)) &&
        // stop at object port
        (reroute(t.parentElement.dataset[shape], t.dataset[anchor_connector]) ||
          isDestination(t.parentElement.dataset[shape], t.dataset[anchor_connector]))) ||
      // stop at anywhere
      endConnection(x, y, true)
    )
      return;

    if (plotEnd(x, y) || resizeEnd(x, y) || dropObj(x, y)) {
      // console.log("click released");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!IsEnabled()) return;
    // console.log(e.key);
  });
}
