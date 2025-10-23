import Node from "./Node.js";
import Events from "./Events.js";

const FileSystem = {
  make() {
    const root = Node.make("root", "root");
    const currentPath = [];
    const data = { root };

    return { currentPath, data };
  },

  getCurrentFolder(fs) {
    const { currentPath, data } = fs;
    if (currentPath.length === 0) return data.root;
    return data[currentPath[currentPath.length - 1]];
  },

  goTo(fs, id) {
    fs.currentPath.push(id);
  },

  goBack(fs) {
    fs.currentPath.pop();
  },

  addNewNode(fs, title, parentId = null) {
    const parent = parentId ? fs.data[parentId] : this.getCurrentFolder(fs);
    if (!parent)
      throw new Error(`Parent node not found: ${parentId || "current folder"}`);

    const node = Node.make(title);
    return this.addNode(fs, node, parent.id);
  },

  addNode(fs, node, parentId) {
    const parent = fs.data[parentId];
    if (!parent) throw new Error(`Parent node not found: ${parentId}`);
    Node.addChild(parent, node.id);
    fs.data[node.id] = node;
    return node;
  },

  // post-order traversal for safe deletion
  *walk(fs, nodeId, parentId) {
    const node = fs.data[nodeId];
    if (!node) return;
    for (let i = node.children.length - 1; i >= 0; i--) {
      yield* this.walk(fs, node.children[i], node.id);
    }
    yield { node, parentId };
  },

  removeNode(fs, nodeId, parentId) {
    const parent = fs.data[parentId];
    if (!parent) throw new Error(`Parent node not found: ${parentId}`);

    // remove from parent's children (throws if missing)
    Node.removeChild(parent, nodeId);

    // collect all nodes in post-order
    const removedNodes = Array.from(this.walk(fs, nodeId, parentId));

    // delete all nodes
    for (const { node } of removedNodes) {
      node.children = [];
      delete fs.data[node.id];
      if (node.id === fs.currentPath[fs.currentPath.length - 1]) {
        this.goBack(fs);
      }
    }

    return removedNodes;
  },

  applyEvent(fs, event) {
    switch (event.type) {
      case "addNode": {
        this.addNode(fs, event.node, event.parentId);
        return Events.makeRemoveNode(event.id, event.parentId);
      }
      case "removeNode": {
        const nodes = this.removeNode(fs, event.id, event.parentId);
        return Events.makeRestoreNodes(nodes);
      }
      case "restoreNodes": {
        if (!event.events || event.events.length === 0) return;

        // peek the last event without removing
        const lastEvent = event.events[event.events.length - 1];
        const removeEvent = Events.makeRemoveNode(
          lastEvent.node.id,
          lastEvent.parentId
        );

        // pop all events and apply each
        while (event.events.length > 0) {
          const e = Events.popFromCluster(event);
          this.applyEvent(fs, e);
        }

        // return the removeNode for undo
        return removeEvent;
      }
      default:
        throw new Error(`Unknown event type: ${event.type}`);
    }
  },

  check(fs) {
    const visited = new Set();
    const root = fs.data.root;
    if (!root) throw new Error("Root node missing");

    // mark all descendants (post-order walk)
    for (const { node } of this.walk(fs, root.id, null)) {
      if (visited.has(node.id))
        throw new Error(`Node visited twice: ${node.id}`);
      if (!fs.data[node.id])
        throw new Error(`Missing node in data: ${node.id}`);
      visited.add(node.id);
    }

    // ensure all nodes are reachable from root
    for (const id of Object.keys(fs.data)) {
      if (!visited.has(id)) throw new Error(`Unlinked node: ${id}`);
    }

    // verify that currentPath is valid
    let current = root;
    for (const stepId of fs.currentPath) {
      const nextNode = fs.data[stepId];
      if (!nextNode) throw new Error(`currentPath node not found: ${stepId}`);
      if (!Node.isChild(current, stepId)) {
        throw new Error(
          `currentPath invalid: node ${stepId} is not a child of ${current.id}`
        );
      }
      current = nextNode;
    }
  },
};

export default FileSystem;
