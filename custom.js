import { IsEnabled, canvas } from "./diagram/canvas.js";
import Connector, { connectorMode } from "./objects/connector.js";
import { object } from "./objects/object.js";
import Shape from "./objects/shape.js";
import Text from "./objects/text.js";

Shape.prototype.processStep = function (value = true) {
  let ps = this.nodes.textBody.querySelector("[data-step]") || null;
  if (value === true) {
    // return the value
    if (ps) {
      window.ProcessSteps[this.id] = {
        step: ps.dataset.step,
        label: this.nodes.textNode.textContent,
      };
    }
    return ps ? ps.dataset.step : null;
  } else if (value === false || value === null) {
    if (window.ProcessSteps[this.id]) delete window.ProcessSteps[this.id];
    ps && ps.remove();
  } else {
    if (!ps) {
      ps = document.createElement("span");
      ps.style.maxWidth = "4rem";
      this.nodes.textBody.insertBefore(ps, this.nodes.textNode);
      this.nodes.textNode.style.maxWidth = "60%";
    }
    ps.setAttribute("data-step", value);
    ps.innerHTML = value + ")";
    ps.style.marginRight = "1rem";

    window.ProcessSteps[this.id] = {
      step: value,
      label: this.nodes.textNode.textContent,
    };
  }
};

const objectMenu = {
  box: document.getElementById("objectSettingsMenu"),
  processStepCheckbox: document.getElementById("isProcessStepCheckbox"),
  processStepInput: document.getElementById("isProcessStepInput"),
  textEditor: document.getElementById("omTextInput"),
  outlineBtns: Array.from(document.querySelectorAll("#omOutlineBtnGrp .btn[data-value]") || []),
  bgColorInput: document.getElementById("bgColorInput"),
  textColorInput: document.getElementById("textColorInput"),
  outlineColorInput: document.getElementById("outlineColorInput"),
  outline: function (value = null) {
    if (value != null) {
      // setting new mode
      this.outlineBtns.forEach((e) => {
        if (e.dataset.value == value) {
          e.classList.remove("btn-default");
          e.classList.add("grey");
        } else {
          e.classList.add("btn-default");
          e.classList.remove("grey");
        }
      });
      if (this.instance) {
        switch (value) {
          case "solid":
            this.instance.outline = "solid";
            this.instance.setAppearance({ strokeDashArray: null });
            break;
          case "dot":
            this.instance.outline = "dot";
            this.instance.setAppearance({ strokeDashArray: "2,6" });
            break;
          case "dash":
            this.instance.outline = "dash";
            this.instance.setAppearance({ strokeDashArray: "7,6" });
            break;
        }
      }
    } else {
      let isActive = document.querySelector("#omOutlineBtnGrp .btn-primary") || null;
      return isActive ? isActive.dataset.value : null;
    }
  },
  show: function (mode = true) {
    if (mode && this.instance instanceof Shape) {
      if (connectorMode()) return;
      lineMenu.box.classList.add("hide");
      this.box.classList.remove("hide");
    } else {
      this.instance = null;
      this.box.classList.add("hide");
      this.processStepCheckbox.checked = false;
      this.processStepInput.value = "";
      this.textEditor.value = "";
      this.outline("none");
    }
  },
  hide: function () {
    this.box.classList.add("hide");
  },
  setColor: function (id, value) {
    if (this.instance instanceof Shape) {
      if (id == "bgColorInput") {
        this.instance.setAppearance({ fill: value });
      } else if (id == "outlineColorInput") {
        this.instance.setAppearance({ stroke: value }, true);
      } else if (id == "textColorInput") {
        this.instance.nodes.textNode.style.color = value;
      }
    }
  },
};

const lineMenu = {
  box: document.getElementById("lineSettingsMenu"),
  typeBtns: Array.from(document.querySelectorAll("#lmTypeBtnGrp .btn[data-value]") || []),
  lineColorInput: document.getElementById("lineColorInput"),
  type: function (value = null) {
    if (value != null) {
      // setting new mode
      this.typeBtns.forEach((e) => {
        if (e.dataset.value == value) {
          e.classList.remove("btn-default");
          e.classList.add("grey");
        } else {
          e.classList.add("btn-default");
          e.classList.remove("grey");
        }
      });
      if (this.instance) {
        switch (value) {
          case "solid":
            this.instance.lineType = "solid";
            this.instance.setAppearance({ strokeDashArray: null });
            break;
          case "dot":
            this.instance.lineType = "dot";
            this.instance.setAppearance({ strokeDashArray: "2,6" });
            break;
          case "dash":
            this.instance.lineType = "dash";
            this.instance.setAppearance({ strokeDashArray: "7,6" });
            break;
        }
      }
    } else {
      value = document.querySelector("#omOutlineBtnGrp .btn-primary") || null;
      return value ? value.dataset.value : null;
    }
  },
  show: function (mode = true) {
    if (mode && this.instance instanceof Connector) {
      objectMenu.box.classList.add("hide");
      this.box.classList.remove("hide");
    } else {
      this.instance = null;
      this.box.classList.add("hide");
      this.type("none");
    }
  },
  hide: function () {
    this.box.classList.add("hide");
  },
  setColor: function (id, value) {
    if (this.instance instanceof Connector) {
      if (id == "lineColorInput") {
        this.instance.setAppearance({ stroke: value }, true);
      }
    }
  },
};

const processStepInputChange = function (e) {
  if (this.value.trim() != "" && objectMenu.processStepCheckbox.checked && objectMenu.instance instanceof Shape) {
    let value = this.value.replace(/[\x00-\x1F\x7F-\x9F]/g, " ");
    objectMenu.instance.processStep(value);
  }
};

function rgbToHex(rgb) {
  // Separate the RGB components
  var rgbArray = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!rgbArray) return rgb;

  // Convert each component to hexadecimal and concatenate
  function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(rgbArray[1]) + hex(rgbArray[2]) + hex(rgbArray[3]);
}

export function Customize(listener) {
  listener.onshapefocus = function (obj) {
    lineMenu.instance = null;
    objectMenu.textEditor.value = obj.nodes.textNode.textContent;

    if (obj instanceof Text) {
      document.getElementById("omSmallNote").innerHTML = "Text color";
      document.getElementById("omProcessSection").style.display = "none";
      document.getElementById("omOutlineSection").style.display = "none";
      objectMenu.bgColorInput.closest("div.border").style.display = "none";
      objectMenu.outlineColorInput.closest("div.border").style.display = "none";
    } else {
      document.getElementById("omSmallNote").innerHTML = `Colors
              <small class="text-muted">(Background | Outline | Text)</small>`;
      document.getElementById("omProcessSection").style.display = "block";
      document.getElementById("omOutlineSection").style.display = "block";
      objectMenu.bgColorInput.closest("div.border").style.display = "block";
      objectMenu.outlineColorInput.closest("div.border").style.display = "block";

      objectMenu.outline(obj.outline || "solid");
      $(objectMenu.bgColorInput).minicolors("value", obj.appearance.fill);
      $(objectMenu.outlineColorInput).minicolors("value", obj.appearance.stroke);
    }
    $(objectMenu.textColorInput).minicolors("value", rgbToHex(obj.nodes.textNode.style.color) || "#000000");

    objectMenu.instance = obj;

    let ps = obj.processStep();
    if (ps) {
      objectMenu.processStepCheckbox.checked = true;
      objectMenu.processStepInput.value = ps;
    }
    objectMenu.show();
  };

  listener.onshapeblur = function (obj) {
    objectMenu.show(false);
  };

  listener.onconnectorfocus = function (obj) {
    objectMenu.instance = null;
    lineMenu.instance = obj;
    lineMenu.type(obj.lineType || "solid");
    $(lineMenu.lineColorInput).minicolors("value", obj.appearance.stroke);
    lineMenu.show();
  };

  listener.onconnectorblur = function (obj) {
    lineMenu.show(false);
  };

  listener.onbusy = function () {
    lineMenu.hide();
    objectMenu.hide();
  };

  listener.onstandby = function () {
    lineMenu.show();
    objectMenu.show();
  };
}

objectMenu.outlineBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    if (!IsEnabled()) return;
    objectMenu.outline(this.dataset.value);
  });
});

objectMenu.textEditor.addEventListener("keyup", function () {
  if (objectMenu.hasOwnProperty("instance") && objectMenu.instance instanceof Shape) {
    if (!IsEnabled()) return;
    const obj = objectMenu.instance;
    obj.nodes.textNode.innerText = this.value;
    objectMenu.instance.processStep();
  }
});

objectMenu.processStepCheckbox.addEventListener("change", function () {
  if (!this.checked) {
    objectMenu.processStepInput.value = "";
    if (objectMenu.instance instanceof Shape) {
      objectMenu.instance.processStep(false);
    }
  }
});

objectMenu.processStepInput.addEventListener("keyup", processStepInputChange);
objectMenu.processStepInput.addEventListener("change", processStepInputChange);

lineMenu.typeBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    if (!IsEnabled()) return;
    lineMenu.type(this.dataset.value);
  });
});

let dragFrom = null;
const container = document.getElementById("jsfDiagramContainment");
const jsfMenu = document.querySelector(".jsf-menu");
const jsfToolbar = document.getElementById("jsf-toolbar");

/* dragging  the settings panel */
container.addEventListener("mousedown", function (e) {
  if (!IsEnabled()) return;
  if (e.target.closest(".jsfboxdraggable")) {
    const parentRect = container.getBoundingClientRect();
    dragFrom = {
      x: e.clientX - parentRect.left - jsfMenu.offsetLeft,
      y: e.clientY - parentRect.top - jsfMenu.offsetTop,
      box: e.target.closest(".jsf-menu-box"),
    };
  }
});

container.addEventListener("mousemove", function (e) {
  if (!IsEnabled()) return;
  if (dragFrom) {
    const parentRect = container.getBoundingClientRect();
    const { box, x: dx, y: dy } = dragFrom;
    let x = e.clientX - parentRect.left - dx;
    let y = e.clientY - parentRect.top - dy;

    // border restrictions
    // x axis
    if (x < 0) x = 0;
    else if (x + box.clientWidth > container.clientWidth) x = container.clientWidth - box.clientWidth;
    // y axis
    if (y < jsfToolbar.clientHeight) y = jsfToolbar.clientHeight;
    else if (y + box.clientHeight > container.clientHeight) y = container.clientHeight - box.clientHeight;

    jsfMenu.style.left = x + "px";
    jsfMenu.style.top = y + "px";
  }
});

container.addEventListener("mouseup", function (e) {
  dragFrom = null;
});
/* end */

document.querySelectorAll("[data-jsfmenu-remove]").forEach((el) => {
  el.addEventListener("click", function () {
    if (!IsEnabled()) return;
    const panel = this.dataset.jsfmenuRemove;
    if (panel == "objectMenu" && objectMenu.instance) {
      objectMenu.instance.processStep(null);
      objectMenu.instance.remove();
      objectMenu.show(false);
      console.log("Object has been removed.");
    } else if (panel == "lineMenu") {
      lineMenu.instance.remove();
      lineMenu.show(false);
    }
  });
});

document.querySelectorAll("[data-jsfmenu-close]").forEach((el) => {
  el.addEventListener("click", function () {
    if (!IsEnabled()) return;
    const panel = this.dataset.jsfmenuClose;
    if (panel == "objectMenu") {
      objectMenu.show(false);
    } else if (panel == "lineMenu") {
      lineMenu.show(false);
    }
  });
});

$(".colorSelector").each(function () {
  $(this).minicolors({
    control: "hue",
    defaultValue: "",
    inline: false,
    letterCase: "lowercase",
    position: "bottom right",
    opacity: false,
    change: function (hex, opacity) {
      if (!hex) return;
      const id = this.id;
      if (objectMenu.hasOwnProperty(id)) {
        objectMenu.setColor(id, hex);
      } else if (lineMenu.hasOwnProperty(id)) {
        lineMenu.setColor(id, hex);
      }
    },
    theme: "bootstrap",
  });
});

export function setCCP(id, value) {
  if (canvas[id] instanceof Shape) {
    const obj = canvas[id];

    if (value === null) {
      if (obj.nodes.ccpLabel) {
        obj.nodes.ccpLabel.remove();
        delete obj.nodes.ccpLabel;
      }
      return;
    }

    if (!obj.nodes.ccpLabel) {
      const span = document.createElement("span");
      span.setAttribute("data-ccp", value);
      obj.nodes.textBody.appendChild(span);
      obj.nodes.ccpLabel = span;
    }

    obj.nodes.ccpLabel.innerHTML = "CCP " + value;
  }
}
