// Events.js
const Events = {
  makeAddNode(node, parentId) {
    return { type: "addNode", node, parentId };
  },

  makeRemoveNode(id, parentId) {
    return { type: "removeNode", id, parentId };
  },

  makeRestoreNodes(nodesWithParents) {
    // nodesWithParents: array of { node, parentId }
    const events = nodesWithParents.map(({ node, parentId }) =>
      this.makeAddNode(node, parentId)
    );
    return { type: "restoreNodes", events };
  },

  pushToCluster(clusterEvent, newEvent) {
    if (newEvent && Array.isArray(newEvent.events)) {
      // flatten any event-like object with a list of subevents
      clusterEvent.events.push(...newEvent.events);
    } else {
      clusterEvent.events.push(newEvent);
    }
  },

  popFromCluster(clusterEvent) {
    return clusterEvent.events.pop();
  },
};

export default Events;
