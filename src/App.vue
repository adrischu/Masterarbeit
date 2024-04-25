<template>
 <WindowMain
  :key="componentKey"
  @forceRerender="forceRerender()"
 />
</template>

<script setup lang="ts">
 import WindowMain from "./components/WindowMain.vue"
 import { ref } from "vue"

 /**Zwingt die Vue Komponenten zu einem Rerender.
  * Wird verwendet, nachdem ein neues System aus einer Datei eingelesen wurde.
  * Vue hat die Änderung nicht immer erkannt und somit seine Komponenten nicht geupdatet.
  * Diese Art des "forcedRerenders" ist die von Vue empfohlene.
  */
 const componentKey = ref(0)
 const forceRerender = () => {
  componentKey.value += 1
 }
</script>

<style scoped></style>
