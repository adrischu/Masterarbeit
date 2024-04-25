<template>
 <h1>Einstellungen</h1>
 <p>
  <v-text-field
   type="number"
   label="Nachkommastellen Lasten"
   v-model="graphicSettingsStore.NACHKOMMASTELLEN_LASTWERTE"
  />
  <v-checkbox-btn
   label="Schnittgrößen auf das verformte System beziehen (nur Th2)"
   v-model="settingsStore.schnittgrößenAufVerformtesSystemBeziehen"
   @click="ergebnisseLöschen(systemStore.system)"
  ></v-checkbox-btn>
  <v-text-field
   type="number"
   label="minimale Stabkennzahl für trigonometrischen Ansatz"
   v-model="settingsStore.minEpsilon"
  />
  <v-text-field
   type="number"
   label="maximale Anzahl an Iterationen für Th.2.Ordnung"
   v-model="settingsStore.maxIterationen"
  />
  <v-text-field
   type="number"
   label="Fehler für Abbruchkriterium bei Iteration nach Th. 2 Ordnung"
   v-model="settingsStore.maxIterationsFehler"
  />
 </p>
</template>

<script setup lang="ts">
 import { useSettingsStore } from "@/stores/SettingsStore"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import { ergebnisseLöschen } from "@/typescript/berechnungen"
 import { useSystemStore } from "@/stores/SystemStore"

 const systemStore = useSystemStore()
 const settingsStore = useSettingsStore()
 const graphicSettingsStore = useGraphicSettingsStore()
</script>
