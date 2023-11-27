<template>
 <h1>Materialeingabe normal</h1>
 <TabelleTemplate
  :objectlist="Materialliste"
  :createNewObject="newMaterial"
 />
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"
 import TabelleTemplate from "./TabelleTemplate.vue"
 import Material from "@/typescript/classes/Material"

 const systemStore = useSystemStore()

 const Materialliste = systemStore.system.Materialliste

 const newMaterial = function (index: number) {
  return new Material(index)
 }
</script>
