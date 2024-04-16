import { spz } from "../svgpanzoom";

const keydown = {
  enableWheelie: function (e) {
    if (e.ctrlKey) {
      spz.enableMouseWheelZoom();
    }
  },
};

export default keydown;
