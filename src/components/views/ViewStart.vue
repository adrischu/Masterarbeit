<template>
 <p><v-btn @click="systemStore.system.berechnen()">Rechnen</v-btn></p>
 <p>Hier ist der Startbildschirm.</p>
</template>
<!-- ----------------------------------------------------------------------------------- -->
<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"

 const systemStore = useSystemStore()
</script>

<!-- ----------------------------------------------------------------------------------- -->
<style></style>
