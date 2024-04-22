<template>
 <TabelleTemplate
  :objectlist="StablastListeVorverformung"
  :createNewObject="newStablastVorverformung"
  :lastfallnummer="lastfall.Nummer"
  :tableHeight="tableHeight"
 />
</template>

<script setup lang="ts">
 import TabelleTemplate from "./TabelleTemplate.vue"
 import Lastfall from "@/typescript/classes/Lastfall"
 import StablastVorverformung from "@/typescript/classes/StablastVorverformung"

 const props = defineProps<{
  lastfall: Lastfall
  tableHeight: number
 }>()

 const StablastListeVorverformung = props.lastfall.StablastListeVorverformung

 const newStablastVorverformung = function (index: number) {
  return new StablastVorverformung(index)
 }
</script>
