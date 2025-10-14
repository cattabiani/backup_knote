<template>
  <div class="q-pa-md">
    <h1>Hello World</h1>
    <p>Pinia value: {{ store.val }}</p>
    <q-input v-model="store.val" label="Edit val" />
  </div>
</template>

<script setup>
import { useStore } from 'src/stores/store'
const store = useStore()
</script>