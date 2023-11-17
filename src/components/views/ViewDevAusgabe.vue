<template>
  <h1>Systemausgabe</h1>

  <h2>Knotentabelle</h2>
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

  <h2>Stabtabelle</h2>
  <v-table>
    <thead>
      <tr>
        <th>Nummer</th>
        <th>Anfangsknoten</th>
        <th>Endknoten</th>
        <th>Elementanzahl</th>
        <th>Länge</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="Stab in systemStore.system.Stäbe" :key="Stab.Nummer.valueOf">
        <td>{{ Stab.Nummer }}</td>
        <td>{{ Stab.Anfangsknoten.Nummer }}</td>
        <td>{{ Stab.Endknoten.Nummer }}</td>
        <td>{{ Stab.Elementabschnitte }}</td>
        <td>{{ Stab.Länge }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import { useSystemStore } from '@/stores/SystemStore'
const systemStore = useSystemStore()
</script>
