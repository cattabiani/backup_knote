import { defineStore } from "pinia";
import Node from "src/models/node";

export const useStore = defineStore("mainStore", {
  state: () => ({
    currentPath: [],
    data: { base: Node.make("base", "base") },
    counter: 0,
  }),

  getters: {
    currentPathString() {
      if (!this.currentPath.length) return "/";
      const parts = this.currentPath.map((id) => this.data[id]?.title ?? "?");
      return "/" + parts.join("/");
    },
    currentFolder() {
      if (!this.currentPath.length) return this.data["base"];
      const currentId = this.currentPath[this.currentPath.length - 1];
      return this.data[currentId];
    },
  },

  actions: {
    addNode() {
      let title = `New Node ${this.counter++}`;
      const newNode = Node.make(title);
      this.data[newNode.id] = newNode;
      Node.addChild(this.currentFolder, newNode.id);
      return newNode.id;
    },
    removeNode(nodeId, removeFromParent = true) {
      if (nodeId === "base") return; // cannot remove base node
      const node = this.data[nodeId];
      if (!node) return;

      // recursively remove children
      for (const childId of node.children) {
        this.removeNode(childId, false);
      }

      delete this.data[nodeId];

      if (removeFromParent) {
        Node.removeChild(this.currentFolder, nodeId);
      }
    },
    goBack() {
      if (this.currentPath.length === 0) return false;
      this.currentPath.pop();
      return true;
    },
    goTo(nodeId) {
      if (!this.data[nodeId]) return false;
      this.currentPath.push(nodeId);
      return true;
    },
  },

  persist: {
    key: "sessionDataKnote",
    pick: [
      // 'currentPath',
      // 'data',
      // 'counter',
    ],
  },
});
