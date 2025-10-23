import Data from "./Data.js";
const History = {
  make() {
    const index = 0;
    const stack = [];
    return { index, stack };
  },

  push(history, event) {
    // discard any "redo" events
    history.stack = history.stack.slice(0, history.index);
    history.stack.push(event);
    this.redo(history);
  },

  redo(history, data) {
    if (history.index >= 0 && history.index < history.stack.length) {
      try {
        history.stack[history.index] = Data.applyEvent(
          data,
          history.stack[history.index]
        );
        history.index++;
      } catch (e) {
        history.stack.splice(history.index, 1);
        throw e;
      }
    }
  },

  undo(history, data) {
    if (history.index > 0 && history.index <= history.stack.length) {
      history.index--;

      try {
        history.stack[history.index] = Data.applyEvent(
          data,
          history.stack[history.index]
        );
      } catch (e) {
        history.stack.splice(history.index, 1);
        throw e;
      }
    }
  },
};

export default History;
