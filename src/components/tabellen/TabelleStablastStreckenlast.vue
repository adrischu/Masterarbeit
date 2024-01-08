<template>
 <h1>Lastfall {{ lastfall.Nummer }} Stabstreckenlast normal</h1>
 <TabelleTemplate
  :objectlist="StablastListeStreckenlast"
  :createNewObject="newStablastStreckenlast"
  :lastfallnummer="lastfall.Nummer"
 />
</template>

<script setup lang="ts">
 import TabelleTemplate from "./TabelleTemplate.vue"
 import Lastfall from "@/typescript/classes/Lastfall"
 import StablastStreckenlast from "@/typescript/classes/StablastStreckenlast"

 const props = defineProps<{
  lastfall: Lastfall
 }>()

 const StablastListeStreckenlast = props.lastfall.StablastListeStreckenlast

 const newStablastStreckenlast = function (index: number) {
  return new StablastStreckenlast(index)
 }
</script>
