<template>
 <TabelleErgebnis
  :kopf="[{ titel: 'Typ' }, { titel: 'Beschreibung' }]"
  :zeilen="systemStore.system.Fehlerliste.map((f) => [f.Typ, f.Nachricht])"
 />
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"
 import TabelleErgebnis from "./TabelleErgebnis.vue"

 const systemStore = useSystemStore()
</script>
