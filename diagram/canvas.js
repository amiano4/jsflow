import { getSPZ } from "./spz.js";
import { Ids, Sizes, uniqid, Colors } from "./util.js";

let isEnabled = false;
const { perNode, subGrid, gridNodes } = Sizes;
const sub = perNode * subGrid;

const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
defs.innerHTML = `
  <pattern id="singleGrid" width="${perNode}" height="${perNode}" patternUnits="userSpaceOnUse">
    <path fill="none" stroke="#ccc" stroke-width="0.5" d="M ${perNode} 0 L 0 0 0 ${perNode}"></path>
  </pattern>
  <pattern id="gridGroup" width="${sub}" height="${sub}" patternUnits="userSpaceOnUse">
    <rect width="${sub}" height="${sub}" fill="url(#singleGrid)"></rect>
    <path d="M ${sub} 0 L 0 0 0 ${sub}" fill="none" stroke="#ccc" stroke-width="1"></path>
  </pattern>
`;

const css = `
  [data-${Ids.anchor_path}] { cursor: crosshair; }
  [data-${Ids.shape}] { cursor: pointer; }
  [data-${Ids.anchor_resize}]:hover, [data-${Ids.anchor_path}]:hover, [data-${Ids.anchor_connector}]:hover { 
    fill: ${Colors.darkblue}; 
    stroke-width: 0;
  }
  [data-${Ids.connector}][data-external]:hover { cursor: pointer; stroke: ${Colors.dimblue_alpha}; } 
  circle[data-${Ids.anchor_connector}]:hover { cursor:  crosshair; } 
  [data-${Ids.anchor_resize}=nw]:hover { cursor: nw-resize; }
  [data-${Ids.anchor_resize}=n]:hover { cursor: n-resize; }
  [data-${Ids.anchor_resize}=ne]:hover { cursor: ne-resize; }
  [data-${Ids.anchor_resize}=e]:hover { cursor: e-resize; }
  [data-${Ids.anchor_resize}=se]:hover { cursor: se-resize; }
  [data-${Ids.anchor_resize}=s]:hover { cursor: s-resize; }
  [data-${Ids.anchor_resize}=sw]:hover { cursor: sw-resize; }
  [data-${Ids.anchor_resize}=w]:hover { cursor: w-resize; }

  foreignObject div {
    font-size: 12px;
    font-family: 'Arial', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  foreignObject [data-${Ids.text}] { 
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
`;

SVGElement.prototype.custom = function (attrName, value = true) {
  this.setAttribute("data-" + attrName, value);
};

HTMLElement.prototype.custom = function (attrName, value = true) {
  this.setAttribute("data-" + attrName, value);
};

const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "g");
const texts = document.createElementNS("http://www.w3.org/2000/svg", "g");

// first level container of objects/shapes
const containment = document.createElementNS("http://www.w3.org/2000/svg", "g");
const palette = document.createElementNS("http://www.w3.org/2000/svg", "g");
const connects = document.createElementNS("http://www.w3.org/2000/svg", "g");

export function diagram(element, width, height) {
  if (!(element instanceof SVGElement)) {
    console.error("Cannot accept non-SVG element.");
    return;
  }

  const style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.innerHTML = css;
  defs.appendChild(style);

  element.setAttribute("width", width);
  element.setAttribute("height", height);
  element.setAttribute("viewBox", `0 0 ${width} ${height}`);

  palette.setAttribute("id", uniqid());
  palette.custom(Ids.shape_container);
  wrapper.setAttribute("id", uniqid());

  const gridSize = gridNodes * perNode;
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("fill", "url(#gridGroup)");
  rect.setAttribute("width", gridSize);
  rect.setAttribute("height", gridSize);
  rect.setAttribute("x", 0);
  rect.setAttribute("y", 0);

  connects.custom("connectors");
  texts.custom("texts");

  containment.custom("containment");
  wrapper.appendChild(rect);
  containment.appendChild(defs);
  containment.appendChild(palette);
  containment.appendChild(texts);
  containment.appendChild(connects);
  wrapper.appendChild(containment);
  element.appendChild(wrapper);
  return element;
}

export function IsEnabled(mode = "get") {
  if (mode === "get") return isEnabled;
  else if (mode === true) {
    isEnabled = true;
    getSPZ().enablePan();
    getSPZ().enableZoom();
  } else if (mode === false) {
    isEnabled = false;
    getSPZ().disablePan();
    getSPZ().disableZoom();
  }

  console.log("JSF mode is " + mode);
}

export function createArrow(to) {
  const size = perNode * 0.5;
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");

  if (to == "head") {
    marker.innerHTML = `<polygon points="0,0 ${size},${size / 2} 0,${size}" fill="black"></polygon>`;
    marker.setAttribute("refX", size - 1);
  } else if (to == "tail") {
    marker.innerHTML = `<polygon points="${size},0 0,${size / 2} ${size},${size}" fill="black"></polygon>`;
    marker.setAttribute("refX", 1);
  }

  marker.id = uniqid("mrk");
  marker.setAttribute("markerWidth", size);
  marker.setAttribute("markerHeight", size);
  marker.setAttribute("refY", size / 2);
  marker.setAttribute("orient", "auto");
  defs.appendChild(marker);

  return {
    arrow: marker.querySelector("polygon"),
    id: marker.id,
  };
}

export const canvas = { wrapper, palette, connects, texts, containment, defs };
