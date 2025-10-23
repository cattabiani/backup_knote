import { v4 as uuidv4 } from "uuid";

const Node = {
  make(title = "", id = "") {
    if (!id) {
      id = uuidv4();
    }
    let done = false;
    let children = [];
    return { id, title, done, children };
  },

  addChild(parentNode, id) {
    parentNode.children.push(id);
  },

  removeChild(parentNode, id) {
    const index = parentNode.children.findIndex((c) => c === id);
    if (index === -1) {
      throw new Error(
        `Node ${id} not found in parent ${parentNode.id}'s children`
      );
    }
    parentNode.children.splice(index, 1);
  },

  moveChild(parentNode, id, newIndex) {
    const index = parentNode.children.findIndex((c) => c === id);
    if (index === -1) return false;

    // remove from current position
    parentNode.children.splice(index, 1);

    // clamp newIndex
    if (newIndex < 0) newIndex = 0;
    if (newIndex > parentNode.children.length)
      newIndex = parentNode.children.length;

    // insert at new position
    parentNode.children.splice(newIndex, 0, id);
    return true;
  },

  isChild(node, childId) {
    return node.children.includes(childId);
  },
};

export default Node;
