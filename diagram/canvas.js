import { Ids, Sizes, uniqid, Colors } from "./util.js";

const { perNode, subGrid, gridNodes } = Sizes;
const sub = perNode * subGrid;
const arrowSize = perNode * 0.5;

const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
defs.innerHTML = `
  <pattern id="singleGrid" width="${perNode}" height="${perNode}" patternUnits="userSpaceOnUse">
    <path fill="none" stroke="#ccc" stroke-width="0.5" d="M ${perNode} 0 L 0 0 0 ${perNode}"></path>
  </pattern>
  <pattern id="gridGroup" width="${sub}" height="${sub}" patternUnits="userSpaceOnUse">
    <rect width="${sub}" height="${sub}" fill="url(#singleGrid)"></rect>
    <path d="M ${sub} 0 L 0 0 0 ${sub}" fill="none" stroke="#ccc" stroke-width="1"></path>
  </pattern>
  <marker id="arrowheadend"
    markerWidth="${arrowSize}" markerHeight="${arrowSize}" 
    refX="${arrowSize - 1}" refY="${arrowSize / 2}" orient="auto">
      <polygon points="0,0 ${arrowSize},${arrowSize / 2} 0,${arrowSize}" fill="black"></polygon>
  </marker>
  <marker id="arrowheadstart"
    markerWidth="${arrowSize}" markerHeight="${arrowSize}" 
    refX="1" refY="${arrowSize / 2}" orient="auto">
      <polygon points="${arrowSize},0 0,${arrowSize / 2} ${arrowSize},${arrowSize}" fill="black"></polygon>
  </marker>
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
  }

  foreignObject [data-${Ids.text}] { 
    border: none !important;
    outline: none !important; 
    overflow-wrap: break-word;
    text-align: center;
    white-space: normal;
    /* background-color: lightblue; */
    display: inline-block;
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
// const outerPalette = document.createElementNS("http://www.w3.org/2000/svg", "g");
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

  element.appendChild(defs);
  wrapper.appendChild(rect);
  wrapper.appendChild(palette);
  wrapper.appendChild(texts);
  wrapper.appendChild(connects);
  element.appendChild(wrapper);
  return element;
}

export const canvas = { wrapper, palette, connects, texts };
