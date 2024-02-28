<template>
 <p>Hier sollen Lasten eingegeben werden.</p>
 <TabelleLastfall />

 <TabelleKnotenlast
  v-for="lastfall in system.Lastfallliste"
  :key="lastfall.Nummer"
  :lastfall="lastfall"
 />

 <TabelleStablastStreckenlast
  v-for="lastfall in system.Lastfallliste"
  :key="lastfall.Nummer"
  :lastfall="lastfall"
 />
 <TabelleStablastVorverformung
  v-for="lastfall in system.Lastfallliste"
  :key="lastfall.Nummer"
  :lastfall="lastfall"
 />
</template>

<script setup lang="ts">
 import type System from "@/typescript/classes/System"
 import TabelleLastfall from "../tabellen/TabelleLastfall.vue"
 import TabelleKnotenlast from "../tabellen/TabelleKnotenlast.vue"
 import TabelleStablastStreckenlast from "../tabellen/TabelleStablastStreckenlast.vue"
 import TabelleStablastVorverformung from "../tabellen/TabelleStablastVorverformung.vue"
 import { useSystemStore } from "@/stores/SystemStore"

 const systemStore = useSystemStore()
 const system: System = systemStore.system
</script>
