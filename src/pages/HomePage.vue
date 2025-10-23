<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar>
      <q-btn
        flat
        icon="arrow_back"
        @click="goBack"
        aria-label="Go Back"
        class="bg-white text-primary"
      />
      <q-toolbar-title>
        {{ store.currentPathString }}
      </q-toolbar-title>
      <q-space />
      <q-btn
        flat
        icon="add"
        @click="store.addNode()"
        aria-label="New Node"
        class="bg-white text-primary"
      />
    </q-toolbar>
  </q-header>

  <q-page class="flex flex-center column q-pa-md">
    <q-list bordered separator>
      <q-item v-for="childId in store.currentFolder.children" :key="childId">
        <q-item-section>
          {{ store.data[childId].title || "Untitled" }}
        </q-item-section>
        <q-item-section side>
          <q-btn
            dense
            flat
            icon="delete"
            color="negative"
            @click="store.removeNode(childId)"
            aria-label="Erase"
          />
          <q-btn
            dense
            flat
            icon="arrow_forward"
            @click="store.goTo(childId)"
            aria-label="Go To"
          />
        </q-item-section>
      </q-item>
    </q-list>
    {{ Object.keys(store.data) }}
  </q-page>
</template>

<script setup>
defineOptions({
  name: "HomePage",
});

import { useRouter } from "vue-router";
import { useStore } from "src/stores/store";
import { useQuasar } from "quasar";

const $q = useQuasar();
const router = useRouter();
const store = useStore();

const goBack = () => {
  if (!store.goBack()) {
    router.replace({ name: "LoadingPage" });
  }
};
</script>
