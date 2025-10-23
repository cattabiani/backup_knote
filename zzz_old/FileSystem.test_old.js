import { describe, it, expect } from "vitest";
import FileSystem from "../src/models/FileSystem.js";
import Events from "../src/models/Events.js";

describe("FileSystem basic operations", () => {
  it("creates nodes, navigates, and maintains consistency", () => {
    const fs = FileSystem.make();

    // root node
    expect(fs.currentPath).toHaveLength(0);
    expect(fs.data.root).toBeDefined();
    expect(fs.data.root.title).toBe("root");

    // add first level nodes
    const nodeA = FileSystem.addNewNode(fs, "A");
    const nodeB = FileSystem.addNewNode(fs, "B");

    expect(fs.data[nodeA.id]).toBeDefined();
    expect(fs.data[nodeB.id]).toBeDefined();
    expect(FileSystem.getCurrentFolder(fs).children).toContain(nodeA.id);
    expect(FileSystem.getCurrentFolder(fs).children).toContain(nodeB.id);

    // navigate to nodeA and add nested nodes
    FileSystem.goTo(fs, nodeA.id);
    const nodeA1 = FileSystem.addNewNode(fs, "A1");
    const nodeA2 = FileSystem.addNewNode(fs, "A2");

    expect(FileSystem.getCurrentFolder(fs).children).toContain(nodeA1.id);
    expect(FileSystem.getCurrentFolder(fs).children).toContain(nodeA2.id);

    // go back to root
    FileSystem.goBack(fs);
    expect(FileSystem.getCurrentFolder(fs).id).toBe("root");

    // add a node explicitly under nodeB without navigating
    const nodeB1 = FileSystem.addNewNode(fs, "B1", nodeB.id);
    expect(fs.data[nodeB1.id]).toBeDefined();
    expect(fs.data[nodeB.id].children).toContain(nodeB1.id);

    // final consistency check
    FileSystem.check(fs);
  });
});

describe("FileSystem removeNode", () => {
  it("removes simple and nested nodes anywhere", () => {
    const fs = FileSystem.make();

    const nodeA = FileSystem.addNewNode(fs, "A");

    const nodeB = FileSystem.addNewNode(fs, "B");
    const nodeC = FileSystem.addNewNode(fs, "C");

    // add nested nodes
    const nodeA1 = FileSystem.addNewNode(fs, "A1", nodeA.id);

    const nodeA2 = FileSystem.addNewNode(fs, "A2", nodeA.id);
    const nodeB1 = FileSystem.addNewNode(fs, "B1", nodeB.id);

    // remove a simple node anywhere (nodeC)
    FileSystem.removeNode(fs, nodeC.id, "root");
    expect(fs.data[nodeC.id]).toBeUndefined();
    expect(FileSystem.getCurrentFolder(fs).children).not.toContain(nodeC.id);

    // remove nested node under nodeA
    FileSystem.removeNode(fs, nodeA1.id, nodeA.id);
    expect(fs.data[nodeA1.id]).toBeUndefined();
    expect(fs.data[nodeA.id].children).not.toContain(nodeA1.id);

    // remove nested node under nodeB using explicit parentId
    FileSystem.removeNode(fs, nodeB1.id, nodeB.id);
    expect(fs.data[nodeB1.id]).toBeUndefined();
    expect(fs.data[nodeB.id].children).not.toContain(nodeB1.id);

    FileSystem.check(fs);
  });

  it("removes deeply nested nodes and keeps siblings intact", () => {
    const fs = FileSystem.make();

    const nodeA = FileSystem.addNewNode(fs, "A");
    const nodeB = FileSystem.addNewNode(fs, "B");

    const nodeA1 = FileSystem.addNewNode(fs, "A1", nodeA.id);
    const nodeA2 = FileSystem.addNewNode(fs, "A2", nodeA.id); // sibling
    const nodeA1a = FileSystem.addNewNode(fs, "A1a", nodeA1.id);
    const nodeA1b = FileSystem.addNewNode(fs, "A1b", nodeA1.id); // sibling

    // remove nodeA1 with all descendants
    FileSystem.removeNode(fs, nodeA1.id, nodeA.id);

    // check removal
    expect(fs.data[nodeA1.id]).toBeUndefined();
    expect(fs.data[nodeA1a.id]).toBeUndefined();
    expect(fs.data[nodeA1b.id]).toBeUndefined();

    // siblings remain
    expect(fs.data[nodeA.id].children).toContain(nodeA2.id);
    expect(fs.data[nodeA.id].children).not.toContain(nodeA1.id);

    FileSystem.check(fs);
  });

  it("removes deeply nested nodes where current path is", () => {
    const fs = FileSystem.make();

    const nodeA = FileSystem.addNewNode(fs, "A");
    FileSystem.goTo(fs, nodeA.id);
    const nodeA1 = FileSystem.addNewNode(fs, "A1");
    FileSystem.goTo(fs, nodeA1.id);
    const nodeA1a = FileSystem.addNewNode(fs, "A1a");
    FileSystem.goTo(fs, nodeA1a.id);
    const nodeA1a1 = FileSystem.addNewNode(fs, "A1a1");
    FileSystem.goTo(fs, nodeA1a1.id);

    // remove nodeA1 with all descendants
    FileSystem.removeNode(fs, nodeA1.id, nodeA.id);

    // check removal
    expect(fs.data[nodeA1.id]).toBeUndefined();
    expect(fs.data[nodeA1a.id]).toBeUndefined();
    expect(fs.data[nodeA1a1.id]).toBeUndefined();

    // current path adjusted
    expect(fs.currentPath).toEqual([nodeA.id]);

    FileSystem.check(fs);
  });
});

describe("FileSystem applyEvent", () => {
  it("applies addNode event and returns removeNode event", () => {
    const fs = FileSystem.make();
    const event = Events.makeAddNode("NewNode", "root");

    const undoEvent = FileSystem.applyEvent(fs, event);

    // Node is added
    expect(fs.data[event.node.id]).toBeDefined();
    expect(fs.data.root.children).toContain(event.node.id);

    // Returned undo event is removeNode
    expect(undoEvent.type).toBe("removeNode");
    expect(undoEvent.id).toBe(event.node.id);
    expect(undoEvent.parentId).toBe("root");
  });

  it("applies removeNode event and returns restoreNodes event", () => {
    const fs = FileSystem.make();
    const node = FileSystem.addNewNode(fs, "ToRemove");

    const event = Events.makeRemoveNode(node.id, "root");
    const undoEvent = FileSystem.applyEvent(fs, event);

    // Node is removed
    expect(fs.data[node.id]).toBeUndefined();
    expect(fs.data.root.children).not.toContain(node.id);

    // Returned undo event is restoreNodes
    expect(undoEvent.type).toBe("restoreNodes");
    expect(undoEvent.events).toHaveLength(1);
    expect(undoEvent.events[0].node.id).toBe(node.id);
  });

  it("throws on unknown event type", () => {
    const fs = FileSystem.make();
    const badEvent = { type: "unknown", id: "x" };
    expect(() => FileSystem.applyEvent(fs, badEvent)).toThrow(
      /Unknown event type/
    );
  });

  it("applies restoreNodes event and reapplies all nodes, returns removeNode of last node", () => {
    const fs = FileSystem.make();

    const nodeA = FileSystem.addNewNode(fs, "A");
    const nodeA1 = FileSystem.addNewNode(fs, "A1", nodeA.id);
    const nodeA2 = FileSystem.addNewNode(fs, "A2", nodeA.id);
    const nodeA1a = FileSystem.addNewNode(fs, "A1a", nodeA1.id);
    const nodeA1b = FileSystem.addNewNode(fs, "A1b", nodeA1.id);
    const nodeA1a1 = FileSystem.addNewNode(fs, "A1a1", nodeA1a.id);

    const nodeB = FileSystem.addNewNode(fs, "B");
    const nodeB1 = FileSystem.addNewNode(fs, "B1", nodeB.id);

    const removeA1event = Events.makeRemoveNode(nodeA1.id, nodeA.id);
    const restoreA1Event = FileSystem.applyEvent(fs, removeA1event);
    const removeA1event2 = FileSystem.applyEvent(fs, restoreA1Event);

    console.log(fs.data);

    // console.dir(restoreNodesEvent, { depth: null })
  });
});
