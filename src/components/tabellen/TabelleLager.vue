<template>
 <TabelleTemplate
  :objectlist="Lagerliste"
  :createNewObject="newLager"
  :tableHeight="tableHeight"
 />
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"
 import Lager from "@/typescript/classes/Lager"
 import TabelleTemplate from "./TabelleTemplate.vue"

 defineProps<{
  tableHeight: number
 }>()

 const systemStore = useSystemStore()

 const Lagerliste = systemStore.system.Lagerliste

 const newLager = function (index: number) {
  return new Lager(index)
 }
</script>
