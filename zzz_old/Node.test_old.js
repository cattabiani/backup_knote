import { describe, it, expect } from "vitest";
import Node from "../src/models/Node.js";

describe("Node.moveChild", () => {
  it("moves child nodes within parent correctly", () => {
    const parent = Node.make("parent");
    const childA = Node.make("A");
    const childB = Node.make("B");
    const childC = Node.make("C");

    // add children
    Node.addChild(parent, childA.id);
    Node.addChild(parent, childB.id);
    Node.addChild(parent, childC.id);

    expect(parent.children).toEqual([childA.id, childB.id, childC.id]);

    // move B to index 0
    Node.moveChild(parent, childB.id, 0);
    expect(parent.children).toEqual([childB.id, childA.id, childC.id]);

    // move C to index 10 (beyond length → goes to end)
    Node.moveChild(parent, childC.id, 10);
    expect(parent.children).toEqual([childB.id, childA.id, childC.id]);

    // move A to index 1 (same index → no change)
    Node.moveChild(parent, childA.id, 1);
    expect(parent.children).toEqual([childB.id, childA.id, childC.id]);

    // move B to middle index
    Node.moveChild(parent, childB.id, 2);
    expect(parent.children).toEqual([childA.id, childC.id, childB.id]);
  });

  it("returns false if child not found", () => {
    const parent = Node.make("parent");
    const res = Node.moveChild(parent, "nonexistent", 1);
    expect(res).toBe(false);
  });
});
