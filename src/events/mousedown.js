import { getMouse } from "../utils/functions";

const mousedown = {
  initPlot: function (event) {
    const client = getMouse(event);
    // console.log(client);
    return true;
  },
};

export default mousedown;
