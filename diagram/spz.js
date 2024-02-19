let spzInstance = null;

export function Init(element) {
  spzInstance = svgPanZoom(element, {
    zoomEnabled: true,
    controlIconsEnabled: false,
    fit: true,
    center: true,
    dblClickZoomEnabled: false,
    customEventsHandler: {
      haltEventListeners: ["touchstart", "touchend", "touchmove", "touchleave", "touchcancel"],
      init: function (options) {
        var instance = options.instance,
          initialScale = 1,
          pannedX = 0,
          pannedY = 0;

        // Init Hammer
        // Listen only for pointer and touch events
        this.hammer = Hammer(options.svgElement, {
          inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput,
        });

        // Enable pinch
        this.hammer.get("pinch").set({ enable: true });

        // Handle double tap
        this.hammer.on("doubletap", function (ev) {
          instance.zoomIn();
        });

        // Handle pan
        this.hammer.on("panstart panmove", function (ev) {
          if (pendingNode !== null) return;
          // On pan start reset panned variables
          if (ev.type === "panstart") {
            pannedX = 0;
            pannedY = 0;
          }

          // Pan only the difference
          instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY });
          pannedX = ev.deltaX;
          pannedY = ev.deltaY;
        });

        // Handle pinch
        this.hammer.on("pinchstart pinchmove", function (ev) {
          // On pinch start remember initial zoom
          if (ev.type === "pinchstart") {
            initialScale = instance.getZoom();
            instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y });
          }

          instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y });
        });

        // Prevent moving the page on some devices when panning over SVG
        options.svgElement.addEventListener("touchmove", function (e) {
          e.preventDefault();
        });
      },

      destroy: function () {
        this.hammer.destroy();
      },
    },
    // beforePan: function (oldPan, newPan) {
    //   const width = JSF.nodeElements.mainSVG.clientWidth;
    //   const height = JSF.nodeElements.mainSVG.clientHeight;
    //   console.log(width);
    //   var stopHorizontal = false,
    //     stopVertical = false,
    //     gutterWidth = 100,
    //     gutterHeight = 100,
    //     // Computed variables
    //     sizes = this.getSizes(),
    //     leftLimit = -((sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom) + gutterWidth,
    //     rightLimit = sizes.width - gutterWidth - sizes.viewBox.x * sizes.realZoom,
    //     topLimit = -((sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom) + gutterHeight,
    //     bottomLimit = sizes.height - gutterHeight - sizes.viewBox.y * sizes.realZoom;

    //   customPan = {};
    //   customPan.x = Math.max(leftLimit, Math.min(rightLimit, newPan.x));
    //   customPan.y = Math.max(topLimit, Math.min(bottomLimit, newPan.y));

    //   return customPan;
    // },
  });
}

export function getSPZ() {
  if (!spzInstance) {
    throw new Error("SVG Pan Zoom instance has not been initialized.");
  }
  return spzInstance;
}
