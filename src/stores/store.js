import { defineStore } from "pinia";
import Data from "src/models/data";
import History from "src/models/history";
import Events from "src/models/events";

export const useStore = defineStore("mainStore", {
  state: () => ({
    data: Data.make(),
    currentPathId: "root",
    history: History.make(50),
  }),

  getters: {
    currentNode() {
      return Data.getNode(this.data, this.currentPathId);
    },
    currentChildren() {
      const node = this.currentNode;
      if (!node) return [];
      return node.children.map((id) => this.getNode(id)).filter(Boolean);
    },
    currentPath() {
      return Data.currentPath(this.data, this.currentPathId);
    },
  },

  actions: {
    addNode(title = "") {
      const event = Events.makeAddNewNode(title, this.currentPathId);
      History.push(this.history, event, this.data);
    },
    editNodeTitle(newTitle, nodeId) {
      const event = Events.makeEditTitle(newTitle, nodeId);
      History.push(this.history, event, this.data);
    },
    getNode(id) {
      return Data.getNode(this.data, id);
    },
    undo() {
      History.undo(this.history, this.data);
    },
    redo() {
      History.redo(this.history, this.data);
    },
    goTo(id) {
      if (!Data.has(this.data, id)) return false;
      this.currentPathId = id;
      return true;
    },
    goBack() {
      return this.goTo(this.currentNode.parentId);
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
