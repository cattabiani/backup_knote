import { v4 as uuidv4 } from "uuid";

const Node = {
  make(title = "", id = "") {
    if (!id) {
      id = uuidv4();
    }
    let deleted = false;
    let children = [];
    let parentId = null;
    return { id, parentId, title, deleted, children };
  },

  addChild(parent, child, index = -1) {
    if (index < 0 || index > parent.children.length) {
      parent.children.push(child.id);
    } else {
      parent.children.splice(index, 0, child.id);
    }
    child.parentId = parent.id;
  },

  removeChild(parent, child, removeParent = true) {
    const index = parent.children.findIndex((c) => c === child.id);
    if (index === -1) {
      throw new Error(
        `Node ${child.id} not found in parent ${parent.id}'s children`,
      );
    }
    parent.children.splice(index, 1);
    if (removeParent) {
      // remove parent reference from child
      child.parentId = null;
    }

    return index;
  },

  moveChild(parent, child, newIndex) {
    const index = parent.children.findIndex((c) => c === child.id);
    if (index === -1) return -1;

    parent.children.splice(index, 1);

    if (newIndex < 0) newIndex = 0;
    if (newIndex > parent.children.length) newIndex = parent.children.length;

    parent.children.splice(newIndex, 0, child.id);
    return index;
  },

  flipDeleted(node) {
    const old = node.deleted;
    node.deleted = !node.deleted;
    return old;
  },

  editTitle(node, newTitle) {
    const oldTitle = node.title;
    node.title = newTitle;
    return oldTitle;
  },
};

export default Node;
