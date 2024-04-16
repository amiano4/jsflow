import { spz } from "../svgpanzoom";

const keyup = {
  disableWheelie: function (e) {
    console.log(e);
    if (e.key === "Control") {
      spz.disableMouseWheelZoom();
      console.log("ke");
    }
  },
};

export default keyup;
