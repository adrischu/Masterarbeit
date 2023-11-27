<template>
 <h1>Lastfalleingabe normal</h1>
 <TabelleTemplate
  :objectlist="Lastfallliste"
  :createNewObject="newLastfall"
 />
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"
 import TabelleTemplate from "./TabelleTemplate.vue"
 import Lastfall from "@/typescript/classes/Lastfall"

 const systemStore = useSystemStore()

 const Lastfallliste = systemStore.system.Lastfallliste

 const newLastfall = function (index: number) {
  return new Lastfall(index)
 }
</script>
