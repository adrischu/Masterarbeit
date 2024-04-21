<template>
 <h1>Systemausgabe</h1>

 <h2>Fehlerliste</h2>
 <v-table>
  <thead>
   <tr>
    <th>Typ</th>
    <th>Beschreibung</th>
   </tr>
  </thead>
  <tbody>
   <tr
    v-for="fehler in systemStore.system.Fehlerliste"
    :key="fehler.Typ"
   >
    <td>{{ fehler.Typ }}</td>
    <td>{{ fehler.Nachricht }}</td>
   </tr>
  </tbody>
 </v-table>

 <h2>Ergebnisse</h2>
 <v-table
  v-for="element in systemStore.system.Lastfallliste[0].Balkenelementliste"
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
 import type Balkenelement from "@/typescript/classes/Balkenelement"
 import type { isElement } from "@/typescript/classes/InterfaceElement"
 import { computed } from "vue"

 const systemStore = useSystemStore()
</script>
