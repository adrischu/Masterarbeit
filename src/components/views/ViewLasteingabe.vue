<template>
 <p>Hier sollen Lasten eingegeben werden.</p>
 <TabelleLastfall />

 <TabelleKnotenlast
  v-for="lastfall in systemStore.system.Lastfallliste"
  :key="lastfall.Nummer"
  :lastfall="lastfall"
 />
</template>

<script setup lang="ts">
 import TabelleLastfall from "../tabellen/TabelleLastfall.vue"
 import TabelleKnotenlast from "../tabellen/TabelleKnotenlast.vue"
 import { useSystemStore } from "@/stores/SystemStore"

 const systemStore = useSystemStore()
</script>
