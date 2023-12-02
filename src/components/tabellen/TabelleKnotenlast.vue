<template>
 <h1>Lastfall {{ lastfall.Nummer }} Knotenlasten normal</h1>
 <TabelleTemplate
  :objectlist="Knotenlastliste"
  :createNewObject="newKnotenlast"
  :lastfallnummer="lastfall.Nummer"
 />
</template>

<script setup lang="ts">
 import TabelleTemplate from "./TabelleTemplate.vue"
 import Lastfall from "@/typescript/classes/Lastfall"
 import Knotenlast from "@/typescript/classes/Knotenlast"

 const props = defineProps<{
  lastfall: Lastfall
 }>()

 const Knotenlastliste = props.lastfall.Knotenlastliste

 const newKnotenlast = function (index: number) {
  return new Knotenlast(index)
 }
</script>
