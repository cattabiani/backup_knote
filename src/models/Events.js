const Events = {
  makeAddNewNode(title, parentId) {
    return { type: "addNewNode", title, parentId };
  },

  makeRemoveNode(nodeId) {
    return { type: "removeNode", nodeId };
  },

  makeEditTitle(newTitle, nodeId) {
    return { type: "editTitle", newTitle, nodeId };
  },

  makeToggleDelete(nodeId) {
    return { type: "toggleDeleted", nodeId };
  },

  makeMoveNode(nodeId, newParentId, newIndex) {
    return { type: "moveNode", nodeId, newParentId, newIndex };
  },

  makeRestoreNodes(nodes, rootIndex) {
    return { type: "restoreNodes", nodes, rootIndex };
  },
};

export default Events;
