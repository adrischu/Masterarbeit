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
   <tr
    v-for="Knoten in systemStore.system.Knotenliste"
    :key="Knoten.Nummer.valueOf"
   >
    <td>{{ Knoten.Nummer }}</td>
    <td>{{ Knoten.Koordinaten.x }}</td>
    <td>{{ Knoten.Koordinaten.z }}</td>
   </tr>
  </tbody>
 </v-table>

 <h2>Stabtabelle</h2>
 <!-- <v-table>
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
  </v-table> -->

 <h2>Ergebnisse</h2>
 <v-table
  v-for="element in systemStore.system.Lastfallliste[0].Elementliste"
  :key="element.Nummer.valueOf"
 >
  <thead>
   <tr>
    <th>i</th>
    <th>x [m]</th>
    <th>eta</th>
    <th>Theorie</th>
    <th>Nmean</th>
    <th>N [kN]</th>
    <th>V [kN]</th>
    <th>M [kNm]</th>
    <th>ux [mm]</th>
    <th>uz [mm]</th>
    <th>phi [mrad]</th>
   </tr>
  </thead>
  <tbody>
   <tr
    v-for="index in element.Ausgabepunkte"
    :key="index"
   >
    <td>{{ index - 1 }}</td>
    <td>{{ ((index - 1) * element.Stab.Länge) / (element.Ausgabepunkte - 1) }}</td>
    <td>{{ element.epsilon }}</td>
    <td>{{ element.Theorie }}</td>
    <td>{{ element.Nmean }}</td>
    <td>{{ element.N[index - 1] / 1000 }}</td>
    <td>{{ element.V[index - 1] / 1000 }}</td>
    <td>{{ element.M[index - 1] / 1000 }}</td>
    <td>{{ element.ux[index - 1] * 1000 }}</td>
    <td>{{ element.uz[index - 1] * 1000 }}</td>
    <td>{{ element.phi[index - 1] * 1000 }}</td>
   </tr>
  </tbody>
 </v-table>
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"

 const systemStore = useSystemStore()
</script>
