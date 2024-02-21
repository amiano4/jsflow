window.EnableDebugging = true;

const Logger = console.log;

/**
 * Custom function console logging
 * @param  {...any} args
 */
console.log = function (...args) {
  if (EnableDebugging) {
    const error = new Error();
    const stackLine = error.stack.split("\n")[2];
    const match = /(?:at\s)?.*?(http.*?\/([^/]+)):(\d+)\)/.exec(stackLine);
    if (match) {
      const fileName = match[1];
      // const lineNumber = match[2];
      Logger(...args, `\n\n ${fileName}`);
    } else {
      Logger(...args, "\n\n Could not determine caller location");
    }
  }
};
