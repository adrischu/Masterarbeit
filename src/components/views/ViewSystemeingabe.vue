<template>
  <p>Hier sollen Systemdaten eingegeben werden.</p>
  <TabelleKnoten></TabelleKnoten>

  <h2>Ausgabe der Knotenliste (unabhängig)</h2>
  <v-table>
    <thead>
      <tr>
        <th>Nummer</th>
        <th>x-Koordinate</th>
        <th>z-Koordinate</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="Knoten in systemStore.system.Knoten" :key="Knoten.Nummer.valueOf">
        <td>{{ Knoten.Nummer }}</td>
        <td>{{ Knoten.Koordinaten.x }}</td>
        <td>{{ Knoten.Koordinaten.z }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import { useSystemStore } from '@/stores/SystemStore'
import TabelleKnoten from '../tabellen/TabelleKnoten.vue'
import TabelleStäbe from '../tabellen/TabelleStäbe.vue'

const systemStore = useSystemStore()
</script>
<style scoped></style>
