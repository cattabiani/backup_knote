import { defineStore } from 'pinia';

export const useStore = defineStore('mainStore', {
  state: () => ({
    val: null,
  }),

  getters: {

  },

  actions: {

  },

  persist: {
    key: 'sessionDataKnote',
    pick: [
      'val',
    ],
  },
});
