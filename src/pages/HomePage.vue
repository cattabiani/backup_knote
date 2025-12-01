<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar>
      <q-btn
        flat
        icon="arrow_back"
        @click="goBack"
        aria-label="Go Back"
        class="bg-white text-primary q-mr-md"
      />
      {{ store.currentPath }}
      <q-space />
      <q-btn
        flat
        icon="undo"
        @click="store.undo()"
        class="q-ml-md bg-white text-primary"
      >
      </q-btn>
      <q-btn
        flat
        icon="redo"
        @click="store.redo()"
        class="q-ml-md bg-white text-primary"
      >
      </q-btn>
      <q-btn
        flat
        :icon="nestMode ? 'folder_open' : 'folder'"
        @click="nestMode = !nestMode"
        class="q-ml-md bg-white text-primary"
      >
      </q-btn>
      <q-btn
        flat
        icon="add"
        @click="store.addNode()"
        class="q-ml-md bg-white text-primary"
      >
      </q-btn>
    </q-toolbar>
  </q-header>

  <q-page class="column q-pa-md">
    <q-input
      v-if="store.currentNode.id !== `root`"
      outlined
      label="Title"
      v-model="store.currentNode.title"
      class="q-mb-sm"
    ></q-input>

    <draggable
      :list="childrenList.slice()"
      item-key="id"
      handle=".drag-handle"
      animation="200"
      :ghost-class="nestMode ? 'hidden-ghost' : ''"
      @change="onChange"
    >
      <template #item="{ element: child, index: i }">
        <q-item
          clickable
          v-ripple
          :class="
            child.isMoveUpItem
              ? 'bg-grey-4'
              : i % 2 === 0
                ? 'bg-white'
                : 'bg-grey-2'
          "
          class="q-py-md"
          @dblclick="store.goTo(child.id)"
          v-show="!(child.isMoveUpItem && store.currentNode.id === 'root')"
        >
          <q-icon
            v-if="child.isMoveUpItem"
            name="arrow_upward"
            class="q-mr-sm self-center"
          />
          <q-icon
            v-if="child.isFolder"
            name="folder_open"
            class="q-mr-sm self-center"
          />

          <q-item-section>
            <q-item-label class="text-subtitle1">
              <q-input
                dense
                borderless
                v-model="child.title"
                placeholder="(untitled)"
                :disable="child.isMoveUpItem"
                @blur="!child.isMoveUpItem && editNodeTitle(child)"
                @keyup.enter="!child.isMoveUpItem && editNodeTitle(child)"
              />
            </q-item-label>
          </q-item-section>

          <q-btn
            v-if="!child.isMoveUpItem"
            dense
            icon="drag_handle"
            class="drag-handle"
          />
        </q-item>
      </template>
    </draggable>
  </q-page>
</template>

<script setup>
defineOptions({
  name: "HomePage",
});

import { useRouter } from "vue-router";
import { useStore } from "src/stores/store";
import { useQuasar } from "quasar";
import { ref, computed } from "vue";
import draggable from "vuedraggable";

const $q = useQuasar();
const router = useRouter();
const store = useStore();

const nestMode = ref(false);

const goBack = () => {
  if (!store.goBack()) {
    router.replace({ name: "LandingPage" });
  }
};

const childrenList = computed(() => {
  const baseList = store.currentChildren.map((c) => ({
    title: c.title,
    id: c.id,
    isFolder: c.children.length > 0,
  }));

  if (nestMode.value) {
    // Add the "Move to parent" item at the start
    return [
      {
        id: store.currentNode.parentId,
        title: "Move to parent",
        isMoveUpItem: true,
      },
      ...baseList,
    ];
  }

  return baseList;
});

const editNodeTitle = (child) => {
  store.editNodeTitle(child.title, child.id);
};

const onChange = (evt) => {
  if (evt.moved) {
    if (nestMode.value) {
      const nodeId = childrenList.value[evt.moved.oldIndex].id;
      const parentId = childrenList.value[evt.moved.newIndex].id;
      store.moveNode(nodeId, parentId);
    } else {
      store.swapChildren(evt.moved.oldIndex, evt.moved.newIndex);
    }
  }
};
</script>

<style scoped>
.hidden-ghost {
  display: none;
}
</style>
