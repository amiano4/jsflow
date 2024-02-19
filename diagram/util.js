export const maxClickTimer = 500;
export const lineOffset = 16;

export const Sizes = {
  perNode: 16,
  subGrid: 5,
  gridNodes: 500,
  minPlotSize: 50,
  maxPlotSize: 1000,
  anchor: 16 * 0.65,
};

export const Ids = {
  shape: "jsfs",
  text: "jsft",
  connector: "jsfcon",
  anchor_resize: "jsfar",
  anchor_connector: "jsfac",
  anchor_path: "jsfap",
  shape_container: "jsfsc",
};

export const Colors = {
  black: "#000",
  darkblue: "#006da8",
  lightblue: "#00a5ff",
  lightblue_alpha: "#00a5ff7d",
  dimblue: "#1c9ce2",
  dimblue_alpha: "#1c9ce23d",
  alpha100: "#ffffff00",
};

export const AnchorKeys = {
  center: ["n", "e", "w", "s"],
  corner: ["nw", "ne", "sw", "se"],
};

export function uniqid(pre = "jsf") {
  window.el_count = window.el_count ? window.el_count + 1 : 1;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  const id = pre + el_count + "_" + result;
  return id;
}

export function getMouse(canvas, evt) {
  const { x: rx, y: ry } = canvas.diagram.getBoundingClientRect();
  const mouse = {
    // cursor position relative to viewport
    x: evt.clientX - rx,
    y: evt.clientY - ry,
  };
  const svgMatrix = canvas.wrapper.transform.baseVal.consolidate().matrix;
  mouse.scale = svgMatrix.a;
  mouse.offset = {
    x: svgMatrix.e,
    y: svgMatrix.f,
  };

  mouse.x -= mouse.offset.x;
  mouse.y -= mouse.offset.y;
  mouse.x /= mouse.scale;
  mouse.y /= mouse.scale;
  // relative to grid
  mouse.toGrid = {
    x: Math.floor((mouse.x + (Sizes.gridNodes * Sizes.perNode) / 2) / Sizes.perNode),
    y: Math.floor((mouse.y + (Sizes.gridNodes * Sizes.perNode) / 2) / Sizes.perNode),
  };
  return mouse;
}
