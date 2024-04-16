import Icons from "./icons";
import { DataNames, Pixels, Colors } from "./variables";

export function createElementId(counter) {
  return () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return "jsflow_" + ++counter + result;
  };
}

export const uniqid = createElementId(0);

export function createElement(elementType, dataAttr = {}, ns = "http://www.w3.org/2000/svg") {
  const element = document.createElementNS(ns, elementType);
  element.id = uniqid();

  if (typeof dataAttr == "object" && dataAttr != null)
    Object.entries(dataAttr || {}).forEach(([k, v]) => element.setAttribute(k, v === null ? "" : v));

  return element;
}

export function createDefElement() {
  const { SIZE, MINI_GRID } = Pixels;
  const { SHAPE_OBJECT, TEXT_NODE, RESIZE_ANCHOR, CONNECTOR_ANCHOR, PATH_ANCHOR } = DataNames;
  const subGrid = SIZE * MINI_GRID;
  const defs = createElement("defs");

  defs.innerHTML = `
    <pattern id="singleGrid" width="${SIZE}" height="${SIZE}" patternUnits="userSpaceOnUse">
      <path fill="none" stroke="#ccc" stroke-width="0.5" d="M ${SIZE} 0 L 0 0 0 ${SIZE}"></path>
    </pattern>
    <pattern id="gridGroup" width="${subGrid}" height="${subGrid}" patternUnits="userSpaceOnUse">
      <rect width="${subGrid}" height="${subGrid}" fill="url(#singleGrid)"></rect>
      <path d="M ${subGrid} 0 L 0 0 0 ${subGrid}" fill="none" stroke="#ccc" stroke-width="1"></path>
    </pattern>
    <style type="text/css">
      [data-${PATH_ANCHOR}] { cursor: crosshair; }
      [data-${SHAPE_OBJECT}] { cursor: pointer; }
      [data-${RESIZE_ANCHOR}]:hover, [data-${PATH_ANCHOR}]:hover, [data-${CONNECTOR_ANCHOR}]:hover { 
        fill: ${Colors.darkblue}; 
        stroke-width: 0;
      }
      [data-${CONNECTOR_ANCHOR}][data-external]:hover { cursor: pointer; stroke: ${Colors.dimblue_alpha}; } 
      circle[data-${CONNECTOR_ANCHOR}]:hover { cursor:  crosshair; } 
      [data-${RESIZE_ANCHOR}=nw]:hover { cursor: nw-resize; }
      [data-${RESIZE_ANCHOR}=n]:hover { cursor: n-resize; }
      [data-${RESIZE_ANCHOR}=ne]:hover { cursor: ne-resize; }
      [data-${RESIZE_ANCHOR}=e]:hover { cursor: e-resize; }
      [data-${RESIZE_ANCHOR}=se]:hover { cursor: se-resize; }
      [data-${RESIZE_ANCHOR}=s]:hover { cursor: s-resize; }
      [data-${RESIZE_ANCHOR}=sw]:hover { cursor: sw-resize; }
      [data-${RESIZE_ANCHOR}=w]:hover { cursor: w-resize; }

      foreignObject div {
        font-size: 12px;
        font-family: Arial, Helvetica, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      foreignObject [data-${TEXT_NODE}] { 
        border: none !important;
        outline: none !important; 
        overflow-wrap: break-word;
        text-align: center;
        white-space: normal;
        max-width: 80%;
        /* background-color: lightblue; */
        display: inline-block;
      }

      span[data-step] { 
        overflow-wrap: break-word;
        white-space: normal;
        max-width: 80%;
        display: inline-block;
        font-weight: bold;
      }

      span[data-ccp] {
        position:absolute;
        bottom: 10px;
        right: 10px;
        font-weight: bold;
        color: red;
      }

      foreignObject [contenteditable] { cursor: text; }
    </style>
  `;

  return defs;
}

export function jfMarkup() {
  const jfContainer = document.createElement("div");
  jfContainer.classList.add("jfContainer");
  jfContainer.innerHTML = `
    <div class="jfToolbar">
      <ul class="jfToolbarMenu">
        <li title="Undo">
          <button type="button"><i class="ri-arrow-left-line"></i></button>
        </li>
        <li title="Redo">
          <button type="button"><i class="ri-arrow-right-line"></i></button>
        </li>
        <li class="separator"></li>
        <li title="Zoom">
          <select>
            <option value="100">50%</option>
            <option value="100" selected>100%</option>
          </select>
        </li>
        <li class="separator"></li>
        <li title="Zoom in">
          <button type="button"><i class="ri-zoom-in-line"></i></button>
        </li>
        <li title="Zoom out">
          <button type="button"><i class="ri-zoom-out-line"></i></button>
        </li>
        <li class="separator"></li>
        <li title="Copy">
          <button type="button"><i class="ri-file-copy-line"></i></button>
        </li>
        <li title="Delete">
          <button type="button"><i class="ri-delete-bin-line"></i></button>
        </li>
        <li class="separator"></li>
        <li title="To front">
          <button type="button"><i class="ri-bring-to-front"></i></button>
        </li>
        <li title="To back">
          <button type="button"><i class="ri-send-to-back"></i></button>
        </li>
        <li class="separator"></li>
        <li title="Toggle mode">
          <label class="jfModeMenu" role="button">
            <input type="checkbox" class="jfModeToggle" checked />
            <i class="ri-eye-line mode_view"></i>
            <span class="mode_view"> View mode</span>
            <i class="ri-edit-line mode_edit"></i>
            <span class="mode_edit"> Edit mode</span>
          </label>
        </li>
      </ul>
      <ul class="jfToolbarMenu">
        <li title="Right Panel">
          <label role="button">
            <i class="ri-layout-right-line"></i>
            <input type="checkbox" class="jfRightPanelToggle" />
          </label>
        </li>
      </ul>
    </div>
    <div class="jfContent">
      <aside class="jfContentLeftPanel">
        <div class="jfContentToggleMenu">
          <label>
            <strong class="menu-button"> Shapes <i class="ri-arrow-down-s-fill"></i> </strong>
            <input type="checkbox" class="menu-toggle" />
          </label>
          <ul class="jfContentLeftPanelMenu">
            <li title="Rectangle">
              <button type="button">${Icons.rectangle}Rectangle</button>
            </li>
            <li title="Circle">
              <button type="button">${Icons.circle}Circle</button>
            </li>
            <li title="Ellipse">
              <button type="button">${Icons.ellipse}Ellipse</button>
            </li>
            <li title="Diamond">
              <button type="button">${Icons.diamond}Diamond</button>
            </li>
            <li title="Text">
              <button type="button">${Icons.text}Text Box</button>
            </li>
          </ul>
        </div>
        <div class="jfContentToggleMenu">
          <label>
            <strong class="menu-button"> Lines <i class="ri-arrow-down-s-fill"></i> </strong>
            <input type="checkbox" class="menu-toggle" />
          </label>
          <ul class="jfContentLeftPanelMenu">
            <li title="Line">
              <button type="button">${Icons.line}Line</button>
            </li>
            <li title="Arrow Line">
              <button type="button">${Icons.arrowLine}Arrow</button>
            </li>
            <li title="Double Arrow Line">
              <button type="button">${Icons.doubleArrow}Double Arrow</button>
            </li>
            <li title="Elbow-type Line">
              <button type="button">${Icons.elbow}Line (elbow)</button>
            </li>
            <li title="Elbow-type Arrow line">
              <button type="button">${Icons.arrowElbow}Arrow (elbow)</button>
            </li>
            <li title="Elbow-type Double Arrow Line">
              <button type="button">
                ${Icons.doubleArrowElbow}Double Arrow (elbow)
              </button>
            </li>
          </ul>
        </div>
      </aside>
      <div class="jfContentDiagram">
        <div class="jfContentDiagramWrap"></div>
      </div>
      <div class="jfContentRightPanel"></div>
    </div>
  `;
  return jfContainer;
}

export function createStyle() {
  const style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.innerHTML = `
  
  
  `;
  return style;
}
