const jsFlow = (function (svgPanZoom, aStar, PF) {
  window.JSFLOW_NAMESPACE = "http://www.w3.org/2000/svg";
  window.JSFLOW_VERTEX_SIZE = 8;
  window.JSFLOW_MIN_PLOTTER_SIZE = 50;
  window.JSFLOW_MAX_PLOTTER_SIZE = 1000;
  window.JSFLOW_FONT_SIZE = 12;
  window.JSFLOW_FONT_FACE = "Arial";
  window.JSFLOW_PLACEHOLDER_TEXT = "Text here";
  window.JSFLOW_GRID_WIDTH = 10000;
  window.JSFLOW_GRID_HEIGHT = 10000;
  window.JSFLOW_GRID_SIZE = 16;
  window.JSFLOW_GRID_GROUP_SIZE = 80;
  window.JSFLOW_GRID_COLOR = "#ccc";
  window.JSFLOW_GRID_MATRIX = JSFLOW_GRID_HEIGHT / JSFLOW_GRID_SIZE;

  const userEvents = {};

  const SHAPE_OBJECT = "[jsflow-shape-object]";
  const RESIZE_ANCHOR = "[jsflow-anchor]";
  const TEXT_CONTENT = "[jsflow-text-content]";
  const TEXT_OBJECT = "[jsflow-text-object]";
  const PATH_ANCHOR = "[jsflow-path-anchor]";

  let svgInteractive = null;
  let pendingNode = null;
  let objects = {};
  let paths = {};
  let lastClick = { time: 0 };
  let hoveredObject = null;
  let emptyClick = false;
  let node = [];
  let svgPanning = false;
  let isPathing = false;

  const diagram = createSVGElement("svg");
  const wrapper = createSVGElement("g");
  const objectsContainer = createSVGElement("g");
  const pathsContainer = createSVGElement("g");

  pathsContainer.setAttribute("jsflow-paths-container", "");
  objectsContainer.setAttribute("jsflow-objects-container", "");

  wrapper.setAttribute("x", 0);
  wrapper.setAttribute("y", 0);

  // defs or grid section
  const defs = createSVGElement("defs");

  const css = {
    "[jsflow-shape-object]": "cursor: pointer;",
    "[jsflow-anchor]:hover": "fill: #006da8;",
    "circle[jsflow-path-anchor]:hover": "cursor: crosshair;",
    "[jsflow-anchor=nw]:hover": " cursor: nw-resize;",
    "[jsflow-anchor=n]:hover": "cursor: n-resize;",
    "[jsflow-anchor=ne]:hover": "cursor: ne-resize;",
    "[jsflow-anchor=e]:hover": "cursor: e-resize;",
    "[jsflow-anchor=se]:hover": "cursor: se-resize;",
    "[jsflow-anchor=s]:hover": "cursor: s-resize;",
    "[jsflow-anchor=sw]:hover": "cursor: sw-resize;",
    "[jsflow-anchor=w]:hover": "cursor: w-resize;",
    "foreignObject div": `font-size: ${JSFLOW_FONT_SIZE}px;
                          font-family: '${JSFLOW_FONT_FACE}';
                          display: flex;
                          align-items: center;
                          justify-content: center;`,
    "foreignObject [jsflow-text-content]": `border: none !important;
                          outline: none !important;
                          overflow-wrap: break-word;
                          text-align: center;
                          white-space: normal;
                          /* background-color: lightblue; */
                          display: inline-block;`,
    "foreignObject [jsflow-text-content][contenteditable]": "cursor: text;",
  };

  const style = createSVGElement("style");
  style.setAttribute("type", "text/css");

  Object.entries(css).forEach(([k, v]) => {
    style.textContent += `#${diagram.id} ${k} { ${v.replace(/\s/g, "")} } `;
  });

  defs.appendChild(style);

  // pattern for a small square/grid
  const pattern1 = createSVGElement("pattern");
  pattern1.setAttribute("width", JSFLOW_GRID_SIZE);
  pattern1.setAttribute("height", JSFLOW_GRID_SIZE);
  pattern1.setAttribute("patternUnits", "userSpaceOnUse");

  // grid path
  const miniGrid = createSVGElement("path");
  miniGrid.setAttribute("fill", "none");
  miniGrid.setAttribute("stroke", JSFLOW_GRID_COLOR);
  miniGrid.setAttribute("stroke-width", "0.5");
  miniGrid.setAttribute("d", `M ${JSFLOW_GRID_SIZE} 0 L 0 0 0 ${JSFLOW_GRID_SIZE}`);

  pattern1.appendChild(miniGrid);

  // bigger squares (pattern)
  const pattern2 = createSVGElement("pattern");
  pattern2.setAttribute("width", JSFLOW_GRID_GROUP_SIZE);
  pattern2.setAttribute("height", JSFLOW_GRID_GROUP_SIZE);
  pattern2.setAttribute("patternUnits", "userSpaceOnUse");

  const gridRect = createSVGElement("rect");
  gridRect.setAttribute("width", JSFLOW_GRID_GROUP_SIZE);
  gridRect.setAttribute("height", JSFLOW_GRID_GROUP_SIZE);
  gridRect.setAttribute("fill", `url(#${pattern1.id})`);

  // Create the path for the second pattern
  const gridPath = createSVGElement("path");
  gridPath.setAttribute("d", `M ${JSFLOW_GRID_GROUP_SIZE} 0 L 0 0 0 ${JSFLOW_GRID_GROUP_SIZE}`);
  gridPath.setAttribute("fill", "none");
  gridPath.setAttribute("stroke", JSFLOW_GRID_COLOR);
  gridPath.setAttribute("stroke-width", "1");

  pattern2.appendChild(gridRect);
  pattern2.appendChild(gridPath);

  defs.appendChild(pattern1);
  defs.appendChild(pattern2);

  const grid = createSVGElement("rect");
  grid.setAttribute("fill", `url(#${pattern2.id})`);
  grid.setAttribute("x", -(JSFLOW_GRID_WIDTH / 2));
  grid.setAttribute("y", -(JSFLOW_GRID_HEIGHT / 2));
  grid.setAttribute("width", JSFLOW_GRID_WIDTH);
  grid.setAttribute("height", JSFLOW_GRID_HEIGHT);

  // others

  diagram.appendChild(wrapper);
  wrapper.appendChild(defs);
  wrapper.appendChild(grid);
  wrapper.appendChild(pathsContainer);
  wrapper.appendChild(objectsContainer);

  const finder = new PF.BiAStarFinder({
    allowDiagonal: false,
    dontCrossCorners: true,
    heuristic: PF.Heuristic["manhattan"],
    weight: 1,
  });

  const fSize = JSFLOW_GRID_HEIGHT / JSFLOW_GRID_SIZE;
  const fGrid = new PF.Grid(fSize, fSize);

  // prototyping
  aStar.grid = [];
  aStar.rows = 0;
  aStar.columns = 0;
  aStar.path = (source, destination) => {
    const sourceNode = new aStar.Node(source.x, source.y, true);
    const destinationNode = new aStar.Node(destination.x, destination.y, true);

    aStar.grid[source.y] = [];
    aStar.grid[destination.y] = [];
    aStar.grid[source.y][source.x] = sourceNode;
    aStar.grid[destination.y][destination.x] = destinationNode;

    const shortestPath = aStar.find(sourceNode, destinationNode, {
      grid: aStar.grid,
      rows: aStar.rows,
      cols: aStar.columns,
    });
    return shortestPath;
  };

  aStar.toNode = (object) => {
    // let { x, y } = objectsContainer.getBoundingClientRect();
    // let o = object.node.container.getBoundingClientRect();

    // x = Math.max(0, Math.floor((o.x - x) / JSFLOW_GRID_SIZE));
    // y = Math.max(0, Math.floor((o.y - y) / JSFLOW_GRID_SIZE));

    // console.log(x, y);

    return new aStar.Node(x, y, true);
  };

  Shape.prototype.register = function () {
    let { x: cx, y: cy } = objectsContainer.getBoundingClientRect();

    aStar.grid = [];
    aStar.rows = 0;
    aStar.columns = 0;

    for (let obj of Object.values(objects)) {
      let x = Math.round((obj.x + JSFLOW_GRID_WIDTH / 2) / JSFLOW_GRID_SIZE);
      let y = Math.round((obj.y + JSFLOW_GRID_HEIGHT / 2) / JSFLOW_GRID_SIZE);
      let width = Math.round(obj.width / JSFLOW_GRID_SIZE);
      let height = Math.round(obj.height / JSFLOW_GRID_SIZE);

      console.log(x, y, x + width, y + height);
      for (let row = y; row < y + height; row++) {
        // aStar.grid[row] === undefined && (aStar.grid[row] = []);
        for (let col = x; col < x + width; col++) {
          // aStar.grid[row][col] = 0;
          fGrid.setWalkableAt(row, col, false);
        }
      }

      Object.entries(obj.getPathPoints()).forEach(([k, v]) => {
        obj.ports[k] = {
          x: Math.round((v.x + obj.x + JSFLOW_GRID_WIDTH / 2) / JSFLOW_GRID_SIZE),
          y: Math.round((v.y + obj.y + JSFLOW_GRID_HEIGHT / 2) / JSFLOW_GRID_SIZE),
        };

        const b = obj.ports[k].x;
        const a = obj.ports[k].y;

        aStar.grid[a] === undefined && (aStar.grid[a] = []);
        aStar.grid[a][b] = 1;
        fGrid.setWalkableAt(b, a, false);
      });
      console.log(obj.ports);
    }

    // for (let obj of Object.values(objects)) {
    //   let o = obj.node.container.getBoundingClientRect();
    //   let x = o.x - cx;
    //   let y = o.y - cy;

    //   const gridX = Math.round(x / JSFLOW_GRID_SIZE);
    //   const gridY = Math.round(y / JSFLOW_GRID_SIZE);
    //   const gridWidth = Math.round(obj.width / JSFLOW_GRID_SIZE);
    //   const gridHeight = Math.round(obj.height / JSFLOW_GRID_SIZE);

    //   Object.entries(obj.getPathPoints()).forEach(([k, v]) => {
    //     obj.ports[k] = {
    //       x: Math.round(v.x / JSFLOW_GRID_SIZE + gridX),
    //       y: Math.round(v.y / JSFLOW_GRID_SIZE + gridY),
    //     };
    //   });

    //   const dx = gridWidth + gridX;
    //   const dy = gridHeight + gridY;

    //   aStar.rows = Math.max(aStar.rows, dy + 5);
    //   aStar.columns = Math.max(aStar.columns, dx + 5);

    //   for (let j = gridY; j < dy + 5; j++) {
    //     !aStar.grid[j + 5] && (aStar.grid[j + 5] = []);
    //     for (let i = gridX; i < dx + 5; i++) {
    //       if (j < dy && i < dx) {
    //         aStar.grid[j + 5][i + 5] = 1;
    //       }
    //     }
    //   }
    // }
  };

  aStar.drawGrid = function () {
    let rowString = "";
    for (let i = 0; i < aStar.grid.length; i++) {
      let y = aStar.grid[i];
      !y && (aStar.grid[i] = []);
      for (let j = 0; j < aStar.grid[i].length; j++) {
        // Display '+' if true, '-' if false
        rowString += aStar.grid[i][j] === 1 || aStar.grid[i][j] === undefined ? "-" : "+";
      }
      rowString += "\n";
    }
    console.log(rowString);
  };

  // beginning of mouse events
  const svgInteractiveEvents = {
    haltEventListeners: ["touchstart", "touchend", "touchmove", "touchleave", "touchcancel"],
    init: function (options) {
      var instance = options.instance,
        initialScale = 1,
        pannedX = 0,
        pannedY = 0;

      // Init Hammer
      // Listen only for pointer and touch events
      this.hammer = Hammer(options.svgElement, {
        inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput,
      });

      // Enable pinch
      this.hammer.get("pinch").set({ enable: true });

      // Handle double tap
      this.hammer.on("doubletap", function (ev) {
        instance.zoomIn();
      });

      // Handle pan
      this.hammer.on("panstart panmove", function (ev) {
        if (pendingNode !== null) return;
        // On pan start reset panned variables
        if (ev.type === "panstart") {
          pannedX = 0;
          pannedY = 0;
        }

        // Pan only the difference
        instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY });
        pannedX = ev.deltaX;
        pannedY = ev.deltaY;
      });

      // Handle pinch
      this.hammer.on("pinchstart pinchmove", function (ev) {
        // On pinch start remember initial zoom
        if (ev.type === "pinchstart") {
          initialScale = instance.getZoom();
          instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y });
        }

        instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y });
      });

      // Prevent moving the page on some devices when panning over SVG
      options.svgElement.addEventListener("touchmove", function (e) {
        e.preventDefault();
      });
    },

    destroy: function () {
      this.hammer.destroy();
    },
  };

  const log = (...args) => console.log(...args);

  const mouseDown = function (event, isTouch = false) {
    if (isTouch) {
      if (event.touches.length > 1) return;
      event = event.touches[0];
    }

    svgPanning = true;
    let target = event.target;
    const selected = (el) => event.target.closest(el);

    if (!selected(`#${diagram.id}`)) return;
    const mouse = getMouse(event);

    if (
      /**
       * DETECT DOUBLE CLICK FOR EDITING
       */
      selected(TEXT_OBJECT)
    ) {
      const time = new Date().getTime();
      target = selected(SHAPE_OBJECT);

      if (
        /**
         * TOGGLE EDITING INTO OBJECT
         */
        time - lastClick.time < 500 &&
        lastClick.id === target.id &&
        node[0] instanceof Shape
      ) {
        node[0].startEditing();
        // is double click
      }

      lastClick.id = target.id;
      lastClick.time = time;
    }

    if (
      /**
       * PLOTTING A NEW OBJECT
       */
      node[0] instanceof Plotter
    ) {
      node[0].update({ x: mouse.x, y: mouse.y, width: 0, height: 0 }, true);
      node[0].dragging = true;
      node[0].dragOrigin = { x: mouse.x, y: mouse.y };
      svgInteractive.disablePan();
      wrapper.appendChild(node[0].node);
    } else if (
      /**
       * RESIZING
       */
      (target = selected(RESIZE_ANCHOR)) &&
      node[0] instanceof Shape &&
      node[0].handler.toolMode === "transform"
    ) {
      node[0].transforming = target.getAttribute("jsflow-anchor");
      node[0].transformOrigin = node[0].lastState;
      svgInteractive.disablePan();
    } else if (
      /**
       * BEGIN PATHING
       */
      (target = selected(SHAPE_OBJECT)) &&
      selected(PATH_ANCHOR) &&
      objects.hasOwnProperty(target.id)
    ) {
      if (
        /**
         * REMOVE FOCUS FROM ACTIVE OBJECT
         */
        node[0] instanceof Shape &&
        node[0].active()
      ) {
        node[0].handler.off();
      }

      node[0] = objects[target.id];
      node[0].pathing = selected(PATH_ANCHOR).getAttribute("jsflow-path-anchor");
      svgInteractive.disablePan();
      enablePathing();
      log("pathing started...");
    } else if (
      /**
       * AN OBJECT IS SELECTED
       */
      (target = selected(SHAPE_OBJECT))
    ) {
      // proof an object is selected
      emptyClick = false;
      if (
        /**
         * DRAGGING STARTED
         */
        node[0] instanceof Shape &&
        selected(`#${node[0].id}`) &&
        node[0].active() &&
        node[0].handler.toolMode === "transform"
      ) {
        node[0].dragging = true;
        node[0].dragOrigin = { x: mouse.x, y: mouse.y };
        svgInteractive.disablePan();
      } else if (
        /**
         * SELECTING INACTIVE SHAPE
         */
        node[0] instanceof Shape &&
        !selected(`#${node[0].id}`)
      ) {
        node[0].editing && node[0].stopEditing();
        node[0].handler.off();
        node[0] = target.id;
      } else if (
        /**
         * SELECTING FROM EMPTY CLICK
         */
        node[0] === undefined
      ) {
        node[0] = target.id;
      }
    } else if (
      /**
       * LEAVING THE SELECTED OBJECT
       */
      node[0] instanceof Shape
    ) {
      node[0].editing && node[0].stopEditing();
      node[0].active() && node[0].handler.off();
      delete node[0];
      svgInteractive.enablePan();
    } else {
      emptyClick = node[0] instanceof Plotter ? false : true;
      log("no shape is clicked emptyClick is " + emptyClick);
    }
  };

  const mouseMove = function (event, isTouch = false) {
    if (isTouch) {
      if (event.touches.length > 1) return;
      event = event.touches[0];
    }

    let target = event.target;
    const selected = (el) => event.target.closest(el);

    if (!selected(`#${diagram.id}`)) return;
    const mouse = getMouse(event);

    if (
      /**
       * PLOTTING
       */
      node[0] instanceof Plotter &&
      node[0].dragging === true
    ) {
      const x1 = node[0].x;
      const y1 = node[0].y;
      const width = node[0].dragOrigin.x - mouse.x;
      const height = node[0].dragOrigin.y - mouse.y;
      const options = {
        x: width > 0 ? mouse.x : x1,
        y: height > 0 ? mouse.y : y1,
        width,
        height,
      };
      node[0].update(options, true);
      return;
    } else if (
      /**
       * HAS ACTIVE OBJECT
       */
      node[0] instanceof Shape
    ) {
      if (
        /**
         * DRAGGING
         */
        node[0].dragging === true
      ) {
        const deltaX = mouse.x - node[0].dragOrigin.x;
        const deltaY = mouse.y - node[0].dragOrigin.y;
        node[0].update({ x: node[0].x + deltaX, y: node[0].y + deltaY });
        return;
      } else if (
        /**
         * RESIZING
         */
        node[0].transforming !== false
      ) {
        node[0].transform({ x: mouse.x, y: mouse.y });
        return;
      } else if (
        /**
         * PATHING
         */
        node[0].pathing !== false
      ) {
        log("currently pathing...");
        return;
      }
    } else if (
      /**
       * FALSE SELECT (PANNING OVER)
       */
      typeof node[0] === "string"
    ) {
      delete node[0];
    }

    if (
      /**
       * HOVER ON OBJECT
       */
      (target = selected(SHAPE_OBJECT)) &&
      !(node[0] instanceof Plotter)
    ) {
      if (svgPanning === true) {
        if (hoveredObject instanceof Shape) {
          hoveredObject.handler.off();
          hoveredObject = null;
        }
        return;
      }

      if (
        /**
         * PREVIOUS OBJECT
         */
        hoveredObject instanceof Shape &&
        hoveredObject.id !== target.id
      ) {
        if (!(node[0] instanceof Shape && node[0].id === hoveredObject.id)) {
          hoveredObject.handler.off();
        }
        hoveredObject = null;
      }

      if (
        /**
         * HAS ACTIVE OBJECT
         */
        node[0] instanceof Shape &&
        node[0].id !== target.id &&
        objects.hasOwnProperty(target.id)
      ) {
        hoveredObject = objects[target.id];
        hoveredObject.handler.usePathTool();
        hoveredObject.highlight();
      } else if (
        /**
         * HOVER
         */
        node[0] === undefined &&
        objects.hasOwnProperty(target.id)
      ) {
        hoveredObject = objects[target.id];
        hoveredObject.handler.usePathTool();
        hoveredObject.highlight();
      }
    } else if (
      /**
       * UNHOVERS
       */
      !selected(SHAPE_OBJECT) &&
      hoveredObject instanceof Shape
    ) {
      if (node[0] instanceof Shape && node[0].id === hoveredObject.id) {
        hoveredObject = null;
        return;
      }

      hoveredObject.handler.off();
      hoveredObject = null;
    }
  };

  const mouseUp = function (event, isTouch = false) {
    if (isTouch) {
      if (event.touches.length > 1) return;
      event = event.touches[0];
    }

    svgPanning = false;
    let target = event.target;
    const selected = (el) => event.target.closest(el);

    if (!selected(`#${diagram.id}`)) return;
    const mouse = getMouse(event);

    if (
      /**
       * PLOTTING COMPLETE
       */
      node[0] instanceof Plotter &&
      node[0].dragging === true
    ) {
      node[0].dragging = false;
      const x = node[0].x;
      const y = node[0].y;
      const width = node[0].width;
      const height = node[0].height;
      const shapeType = node[0].toShape();
      const snapped = { x, y, width, height };
      let obj = false;

      node[0].node.remove();
      switch (shapeType) {
        case "Rectangle":
          obj = new Rectangle(snapped);
          break;
        case "Ellipse":
          obj = new Ellipse(snapped);
          break;
        case "Circle":
          obj = new Circle(snapped);
          break;
        case "Diamond":
          obj = new Diamond(snapped);
          break;
      }

      if (obj !== false) {
        node[0] = obj;
        obj.highlight();

        // save to array
        objects[obj.id] = obj;
        objectsContainer.appendChild(obj.node.container);
        obj.register();
      } else {
        delete node[0];
        svgInteractive.enablePan();
      }
    } else if (
      /**
       * DRAGGING COMPLETE
       */
      node[0] instanceof Shape &&
      node[0].dragging === true
    ) {
      node[0].dragging = false;
      node[0].update(node[0].lastState, true);
      node[0].register();
      svgInteractive.enablePan();
    } else if (
      /**
       * NEW OBJECT SELECTED
       */
      typeof node[0] === "string" &&
      objects.hasOwnProperty(node[0])
    ) {
      node[0] = objects[node[0]];
      node[0].handler.useTransformTool();
      node[0].highlight();
      objectsContainer.removeChild(node[0].node.container);
      objectsContainer.appendChild(node[0].node.container);
    } else if (
      /**
       * RESIZING COMPLETE
       */
      node[0] instanceof Shape &&
      node[0].transforming !== false
    ) {
      node[0].transforming = false;
      node[0].update(node[0].lastState, true);
      node[0].register();
      svgInteractive.enablePan();
    } else if (
      /**
       * PATHING CLOSED
       */
      node[0] instanceof Shape &&
      node[0].pathing !== false
    ) {
      log("pathing closed...", node[0].pathing);

      let des = null;
      if (
        /**
         * DESTINATION SET
         */
        (target = selected(SHAPE_OBJECT)) &&
        (des = selected(PATH_ANCHOR)) &&
        node[0].id !== target.id &&
        objects.hasOwnProperty(target.id)
      ) {
        let source = node[0].ports[node[0].pathing];
        let destination = objects[target.id].ports[des.getAttribute("jsflow-path-anchor")];

        const src = source; //[source.x, source.y];
        const dest = destination; // [destination.x, destination.y];

        const s = JSFLOW_GRID_WIDTH / JSFLOW_GRID_SIZE;

        // aStarSearch(aStar.grid, src, dest, s, s);
        console.log(src, dest);

        const p = finder.findPath(src.x, src.y, dest.x, dest.y, fGrid);

        const line = createSVGElement("path");
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", "1");

        let d = ``;
        console.log(p);

        p[0];
        // source = new aStar.Node(source.x, source.y, true);
        // destination = new aStar.Node(destination.x, destination.y, true);

        // aStar.grid[source.y][source.x] = source;
        // aStar.grid[destination.y][destination.x] = destination;

        // console.log(aStar.grid[source.y][source.x], aStar.grid[destination.y][destination.x]);

        // const p = aStar.path(source, destination);

        // // console.log(source, destination);
        // console.log(p);
        // const path = aStar.path(s, d);

        // let { x, y } = objectsContainer.getBoundingClientRect();

        // let x1 = Math.max(0, Math.floor((s.x - x) / JSFLOW_GRID_SIZE));
        // let y1 = Math.max(0, Math.floor((s.y - y) / JSFLOW_GRID_SIZE));
        // let x2 = Math.max(0, Math.floor((d.x - x) / JSFLOW_GRID_SIZE));
        // let y2 = Math.max(0, Math.floor((d.y - y) / JSFLOW_GRID_SIZE));

        // console.log(`(${x1}, ${y1}) -> (${x2}, ${y2})`);

        // aStarSearch(aStar.grid, [source.x, source.y], [destination.x, destination.y], aStar.rows, aStar.columns);

        // console.log(path);
      }

      node[0].pathing = false;
      delete node[0];
      svgInteractive.enablePan();
    }
  };

  document.addEventListener("mousedown", (e) => mouseDown(e));
  document.addEventListener("mousemove", (e) => mouseMove(e));
  document.addEventListener("mouseup", (e) => mouseUp(e));

  document.addEventListener("touchstart", (e) => mouseDown(e, true));
  document.addEventListener("touchmove", (e) => mouseMove(e, true));
  document.addEventListener("touchend", (e) => mouseUp(e, true));
  // end of mouse events

  // regular functions
  function createSVGElement(element, hasId = true) {
    window.JSFLOW_ELEMENT_COUNT = window.JSFLOW_ELEMENT_COUNT ? window.JSFLOW_ELEMENT_COUNT + 1 : 1;
    const newEl = document.createElementNS(JSFLOW_NAMESPACE, element);
    hasId && newEl.setAttribute("id", randomStr(8, "jsflow-obj" + window.JSFLOW_ELEMENT_COUNT));
    return newEl;
  }

  function randomStr(length, pre = "jsflow-id") {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return pre + "-" + result;
  }

  function updateDiagram(props = {}) {
    diagram.setAttribute("width", props.width);
    diagram.setAttribute("height", props.height);
    diagram.setAttribute("viewBox", `0 0 ${props.width} ${props.height}`);
  }

  function triggerUserEvent(eventName, event) {
    if (userEvents.hasOwnProperty(eventName)) {
      userEvents[event](event);
    }
  }

  function getMouse(evt) {
    const { x: rx, y: ry } = diagram.getBoundingClientRect();
    const mouse = {
      // cursor position relative to viewport
      x: evt.clientX - rx,
      y: evt.clientY - ry,
    };

    const svgMatrix = wrapper.transform.baseVal.consolidate().matrix;

    mouse.scale = svgMatrix.a;
    mouse.offset = {
      x: svgMatrix.e,
      y: svgMatrix.f,
    };

    mouse.x -= mouse.offset.x;
    mouse.y -= mouse.offset.y;
    mouse.x /= mouse.scale;
    mouse.y /= mouse.scale;
    return mouse;
  }

  function enablePathing() {
    Object.entries(objects).forEach(([id, obj]) => {
      if (node[0] instanceof Shape && node[0].id !== id) {
        obj.handler.usePathTool();
        obj.highlight();
      }
    });
    isPathing = true;
  }

  function disablePathing() {
    Object.entries(objects).forEach(([id, obj]) => {
      if (node[0] instanceof Shape && node[0].id !== id && obj.active()) {
        obj.handler.off();
      }
    });
    isPathing = false;
  }

  // variable functions
  const init = function (element) {
    const width = element.clientWidth;
    const height = element.clientHeight;

    updateDiagram({ width, height });
    element.appendChild(diagram);

    svgInteractive = svgPanZoom(diagram, {
      zoomEnabled: true,
      controlIconsEnabled: true,
      fit: true,
      center: true,
      customEventsHandler: svgInteractiveEvents,
      dblClickZoomEnabled: false,
    });

    svgInteractive.setOnPan(function () {
      svgPanning = true;
    });
  };

  const on = function (event, callback) {
    userEvents[event] = callback;
  };

  const addObject = function (objectType) {
    if (
      // disable active object
      node[0] &&
      node[0] instanceof Shape
    ) {
      if (node[0] instanceof Plotter) node[0].cancel();
      else if (node[0].active()) {
        node[0].handler.off();
        node[0].leave();
      }
    }

    node[0] = new Plotter(objectType);
    svgInteractive.disablePan();
  };

  return {
    svgInteractive,
    shapes: objects,
    uniqid: randomStr,
    init,
    on,
    addObject,
  };
})(svgPanZoom, aStar, PF);
