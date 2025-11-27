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
    <q-list bordered separator class="rounded-borders">
      <q-item
        clickable
        v-ripple
        v-for="(child, i) in childrenList"
        :key="child.id"
        :class="i % 2 === 0 ? 'bg-white' : 'bg-grey-2'"
        class="q-py-md"
        @dblclick="store.goTo(child.id)"
      >
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
              @blur="commitTitle(child)"
              @keyup.enter="commitTitle(child)"
            />
          </q-item-label>
        </q-item-section>
        <q-btn dense icon="drag_handle" class="drag-handle" />
      </q-item>
    </q-list>
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

const $q = useQuasar();
const router = useRouter();
const store = useStore();

const goBack = () => {
  if (!store.goBack()) {
    router.replace({ name: "LandingPage" });
  }
};

const childrenList = computed(() =>
  store.currentChildren.map((c) => ({
    title: c.title,
    id: c.id,
    isFolder: c.children.length > 0,
  })),
);

const commitTitle = (child) => {
  store.editNodeTitle(child.title, child.id);
};

const onDragEnd = ({ oldIndex, newIndex }) => {
  console.log("AAA", oldIndex, newIndex);
};
</script>
