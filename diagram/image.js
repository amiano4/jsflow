import Connector, { connectorMode } from "../objects/connector.js";
import { object } from "../objects/object.js";
import Shape from "../objects/shape.js";
import { Sizes, uniqid } from "./util.js";

export function exportDiagram(canvas, callback) {
  object(null);
  connectorMode(false);
  const objs = { ...canvas };

  // delete unwanted properties
  delete objs.diagram;
  delete objs.wrapper;
  delete objs.palette;
  delete objs.containment;
  delete objs.texts;
  delete objs.connects;
  delete objs.defs;

  const shapes = [];
  const lines = [];

  let left = Sizes.gridNodes * Sizes.perNode;
  let top = Sizes.gridNodes * Sizes.perNode;
  let right = 0,
    bottom = 0;

  Object.entries(objs).forEach(([id, obj]) => {
    if (obj instanceof Shape) {
      // to find where the diagram should begin
      left = obj.x < left ? obj.x : left;
      top = obj.y < top ? obj.y : top;

      right = obj.x + obj.width > right ? obj.x + obj.width : right;
      bottom = obj.y + obj.height > bottom ? obj.y + obj.height : bottom;

      shapes.push(obj);
    } else if (obj instanceof Connector) {
      const [headX, headY] = obj.coords[obj.coords.length - 1];
      const [tailX, tailY] = obj.coords[0];

      left = tailX < left ? tailX : left;
      top = tailY < top ? tailY : top;
      left = headX < left ? headX : left;
      top = headY < top ? headY : top;

      right = tailX > right ? tailX : right;
      bottom = tailY > bottom ? tailY : bottom;
      right = headX > right ? headX : right;
      bottom = headY > bottom ? headY : bottom;

      lines.push(obj);
    }
  });

  const padding = 25;
  let width = right - left;
  let height = bottom - top;
  width += padding * 2;
  height += padding * 2;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const defsClone = canvas.defs.cloneNode(true);
  svg.id = uniqid();
  svg.appendChild(defsClone);

  for (let i in shapes) {
    const obj = shapes[i];
    const newX = obj.x - left;
    const newY = obj.y - top;
    svg.appendChild(obj.transpose(newX + padding, newY + padding));
  }

  for (let i in lines) {
    const obj = lines[i];
    svg.appendChild(obj.transpose(left - padding, top - padding));
  }

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("height", height);
  svg.setAttribute("width", width);

  // Serialize SVG to string
  const svgString = new XMLSerializer().serializeToString(svg);

  // Clean up
  canvas = null; // Remove reference to the canvas object
  shapes.length = 0; // Clear the shapes array
  lines.length = 0; // Clear the lines array
  defsClone.remove(); // Remove the cloned defs node
  svg.remove(); // Remove the SVG element from the DOM

  // Create a new canvas and draw the image on it
  const newCanvas = document.createElement("canvas");
  const ctx = newCanvas.getContext("2d");
  const img = new Image();

  img.onload = function () {
    newCanvas.width = img.width;
    newCanvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Get the data URI
    const dataUri = newCanvas.toDataURL("image/png");

    // Call the callback function with the data URI
    callback(dataUri);
  };

  // Set image source to the SVG string
  img.src = "data:image/svg+xml;base64," + btoa(svgString);
}
