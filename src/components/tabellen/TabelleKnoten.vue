<template>
 <h1>Knoteneingabe normal</h1>
 <TabelleTemplate
  :objectlist="Knotenliste"
  :createNewObject="newKnoten"
 />
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"
 import Knoten from "@/typescript/classes/Knoten"
 import TabelleTemplate from "./TabelleTemplate.vue"

 const systemStore = useSystemStore()

 const Knotenliste = systemStore.system.Knotenliste

 const newKnoten = function (index: number) {
  return new Knoten(index)
 }
</script>
