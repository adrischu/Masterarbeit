<template>
 <TabelleTemplate
  :objectlist="Gelenkliste"
  :createNewObject="newGelenk"
 />
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"
 import Gelenk from "@/typescript/classes/Gelenk"
 import TabelleTemplate from "./TabelleTemplate.vue"

 const systemStore = useSystemStore()

 const Gelenkliste = systemStore.system.Gelenkliste

 const newGelenk = function (index: number) {
  return new Gelenk(index)
 }
</script>
