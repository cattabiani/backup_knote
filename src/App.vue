<template>
  <router-view />
</template>

<script setup>
import { useStore } from "src/stores/store";
const store = useStore(); // store works immediately; persistence is automatic
</script>
