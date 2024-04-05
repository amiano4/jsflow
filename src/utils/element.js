function createElementId(counter) {
  return () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return "jsflow_" + ++counter + result;
  };
}

const uniqid = createElementId(0);

function createElement(elementType, ns = "http://www.w3.org/2000/svg") {
  const element = document.createElementNS(ns, elementType);
  element.id = uniqid();
  return element;
}

export { createElement, uniqid };
