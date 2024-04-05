import { DataNames, Pixels, Colors } from "./variables";

function createElementId(counter) {
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

const uniqid = createElementId(0);

function createElement(elementType, dataAttr = {}, ns = "http://www.w3.org/2000/svg") {
  const element = document.createElementNS(ns, elementType);
  element.id = uniqid();

  if (typeof dataAttr == "object" && dataAttr != null)
    Object.entries(dataAttr || {}).forEach(([k, v]) => element.setAttribute(k, v === null ? "" : v));

  return element;
}

function createDefElement() {
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

export { createElement, uniqid, createDefElement };
