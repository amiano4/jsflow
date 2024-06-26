/**
 * This variable will store all canvas objects (shapes, lines, elements).
 */
export const canvas = {};

export const Pixels = {
  SIZE: 16,
  MINI_GRID: 4,
  GRID: 1000,
};

Pixels.ANCHOR_POINT = Pixels.SIZE * 0.65;

export const DataNames = {
  SHAPE_OBJECT: "so",
  TEXT_NODE: "tn",
  CONNECTOR: "con",
  RESIZE_ANCHOR: "ra",
  CONNECTOR_ANCHOR: "ca",
  PATH_ANCHOR: "pa",
  SHAPE_CONTAINER: "sc",
};

export const Colors = {
  black: "#000",
  white: "#fff",
  darkblue: "#006da8",
  lightblue: "#00a5ff",
  lightblue_alpha: "#00a5ff7d",
  dimblue: "#1c9ce2",
  dimblue_alpha: "#1c9ce23d",
  alpha100: "#ffffff00",
};

export const BorderDashArrays = {
  dotted: "2,6",
  dashed: "7,6",
  plot: "5,5",
};

export const customUserEvents = {};
