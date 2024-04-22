<template>
 <p>Hier sollen Lasten eingegeben werden.</p>
 <h1>Lastfalleingabe</h1>
 <TabelleLastfall />

 <div
  v-for="lastfall in system.Lastfallliste"
  :key="lastfall.Nummer"
 >
  <h1>Knotenlasten Lastfall {{ lastfall.Nummer }}</h1>
  <TabelleKnotenlast :lastfall="lastfall" />
  <h1>Streckenlasten Lastfall {{ lastfall.Nummer }}</h1>
  <TabelleStablastStreckenlast :lastfall="lastfall" />
  <h1>Vorverformungen Lastfall {{ lastfall.Nummer }}</h1>
  <TabelleStablastVorverformung :lastfall="lastfall" />
 </div>
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
