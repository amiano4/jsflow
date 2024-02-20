import { IsEnabled, canvas } from "./diagram/canvas.js";
import Connector, { connectorMode } from "./objects/connector.js";
import { object } from "./objects/object.js";
import Shape from "./objects/shape.js";

const objectMenu = {
  box: document.getElementById("objectSettingsMenu"),
  processStepCheckbox: document.getElementById("isProcessStepCheckbox"),
  processStepInput: document.getElementById("isProcessStepInput"),
  textEditor: document.getElementById("omTextInput"),
  outlineBtns: Array.from(document.querySelectorAll("#omOutlineBtnGrp .btn[data-value]") || []),
  bgColorInput: document.getElementById("bgColorInput"),
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
            this.instance.setAppearance({ strokeDashArray: null });
            break;
          case "dot":
            this.instance.setAppearance({ strokeDashArray: "2,6" });
            break;
          case "dash":
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
            this.instance.setAppearance({ strokeDashArray: null });
            break;
          case "dot":
            this.instance.setAppearance({ strokeDashArray: "2,6" });
            break;
          case "dash":
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

export function Customize(listener) {
  listener.onshapefocus = function (obj) {
    lineMenu.instance = null;
    objectMenu.instance = obj;
    objectMenu.textEditor.value = obj.nodes.textNode.textContent;
    $(objectMenu.bgColorInput).minicolors("value", obj.appearance.fill);
    $(objectMenu.outlineColorInput).minicolors("value", obj.appearance.stroke);
    objectMenu.show();
  };

  listener.onshapeblur = function (obj) {
    objectMenu.show(false);
  };

  listener.onconnectorfocus = function (obj) {
    objectMenu.instance = null;
    lineMenu.instance = obj;
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

export function onColorSelect(id, colorValue) {}

objectMenu.outlineBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    if (!IsEnabled()) return;
    objectMenu.outline(this.dataset.value);
  });
});

objectMenu.textEditor.addEventListener("keyup", function () {
  if (objectMenu.hasOwnProperty("instance")) {
    if (!IsEnabled()) return;
    const obj = objectMenu.instance;
    obj.nodes.textNode.innerText = this.value;
  }
});

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
    console.log(dragFrom);
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
      objectMenu.instance.remove();
      objectMenu.show(false);
      console.log("Object has been removed.");
    } else if (panel == "lineMenu") {
      //
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
    position: "bottom left",
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