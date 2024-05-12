<template>
 <WindowMain
  :key="componentKey"
  @forceRerender="forceRerender()"
 />
</template>

<script setup lang="ts">
 import WindowMain from "./components/WindowMain.vue"
 import { ref } from "vue"
 import { preloadSystem } from "./typescript/SystemPreload"

 /**Zwingt die Vue Komponenten zu einem Rerender.
  * Wird verwendet, nachdem ein neues System aus einer Datei eingelesen wurde.
  * Vue hat die Änderung nicht immer erkannt und somit seine Komponenten nicht geupdatet.
  * Diese Art des "forcedRerenders" ist die von Vue empfohlene.
  */
 const componentKey = ref(0)

 //  Beim Start des Programms wird ein System vorgeladen
 preloadSystem(3)

 const forceRerender = () => {
  componentKey.value += 1
  console.log("Full Rerender")
 }
</script>

<style scoped></style>
