<template>
 <v-dialog
  v-model="dialog"
  transition="dialog-bottom-transition"
  fullscreen
 >
  <template v-slot:activator="{ props: activatorProps }">
   <v-btn
    v-bind="activatorProps"
    prepend-icon="mdi-table-large"
    variant="text"
    size="small"
    >Zwischenergebnisse</v-btn
   >
  </template>

  <v-card>
   <v-toolbar
    density="compact"
    color="green-lighten-4"
    elevation="4"
   >
    <v-toolbar-title>Zwischenergebnisse LF{{ lastfall.Nummer }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items>
     <v-btn
      icon="mdi-close"
      @click="dialog = false"
     ></v-btn>
    </v-toolbar-items>
   </v-toolbar>
   <div
    v-if="element && ergebnis"
    class="inhalt"
   >
    <v-card-item>
     <h2>Elementergebnisse</h2>
     <v-select
      v-model="elementIndex"
      :items="elementAuswahl"
      label="Element"
      hide-details
      density="compact"
      style="max-width: 360px"
     ></v-select>

     <h3>Schnittgrößen an der Stelle x</h3>
     <v-slider
      v-model="slider"
      :max="element.L"
      :min="0"
      :step="element.L / 100"
      class="align-center"
      hide-details
     >
      <template v-slot:append>
       <v-text-field
        v-model.number="slider"
        density="compact"
        style="width: 90px"
        type="number"
        hide-details
        single-line
       ></v-text-field>
      </template>
     </v-slider>

     <div class="scroll-x">
      <v-table density="compact">
       <thead>
        <tr>
         <th
          v-for="headerItem in header"
          :key="headerItem.title"
         >
          <span v-html="headerItem.title"></span>
          <span v-html="` [${headerItem.unit.text}]`"></span>
         </th>
        </tr>
       </thead>
       <tbody>
        <tr>
         <td
          v-for="(dataObject, index) in data"
          :key="index"
         >
          {{ dataObject }}
         </td>
        </tr>
       </tbody>
      </v-table>
     </div>

     <h3>Stabkennzahl und Ansatz</h3>
     <div>
      &epsilon; = {{ myRound(element.epsilon, 6) }} &nbsp; (N<sub>m</sub> =
      {{ myRound(element.Nmean / 1000, 4) }} kN, L<sub>Element</sub> =
      {{ myRound(element.L, 4) }} m) &nbsp; Ansatz: {{ element.Theorie }}
     </div>
     <div v-if="element.istExakt && element.Theorie !== Theorie.Theorie_1">
      Kindmann-Parameter: &alpha; = {{ kindmann[0] }}, &beta; = {{ kindmann[1] }}, &gamma; =
      {{ kindmann[2] }}, &delta; = {{ kindmann[3] }}
     </div>

     <h3>Elementsteifigkeitsmatrix (lokal)</h3>
     <TabelleMatrix
      :name="matrixName"
      :matrix="element.k_lok()"
      :nachkommastellen="0"
      :upper-header="k_upperHeader"
      :right-header="k_rightHeader"
     />
     <div v-if="!element.istExakt">
      <h4>elastischer Anteil</h4>
      <TabelleMatrix
       :name="`<u>k</u><sub>el,${element.Nummer}</sub>`"
       :matrix="element.k_el_lok()"
       :nachkommastellen="0"
       :upper-header="k_upperHeader"
       :right-header="k_rightHeader"
      />
      <h4>geometrischer Anteil</h4>
      <TabelleMatrix
       :name="`<u>k</u><sub>geo,${element.Nummer}</sub>`"
       :matrix="element.k_geo_lok()"
       :nachkommastellen="0"
       :upper-header="k_upperHeader"
       :right-header="k_rightHeader"
      />
     </div>

     <h3>Starreinspannkräfte (lokal)</h3>
     <TabelleMatrix
      :name="`<u>f</u><sub>0,${element.Nummer}</sub>`"
      :matrix="matTrans(element.starreinspannkräfte())"
      :nachkommastellen="3"
      :right-header="k_rightHeader"
     />

     <h3>Transformationsmatrix</h3>
     <p class="erklärung">
      Ordnet die Elementfreiheitsgrade (Spalten, globale Nummern) den lokalen Stabendverformungen
      zu. Ohne gedrehte Lager und Gelenke ist dies die Matrix <u>T</u> (Gl. 5/6).
     </p>
     <TabelleMatrix
      :name="`<u>T</u><sub>${element.Nummer}</sub>`"
      :matrix="element.A"
      :nachkommastellen="3"
      :upper-header="element.Inzidenzen.map((i) => ergebnis!.Freiheitsgrade_name[i])"
      :right-header="k_upperHeader"
     />

     <v-divider></v-divider>

     <h2>Systemergebnisse</h2>
     <p class="erklärung">Iterationen: {{ ergebnis.Iterationen }}</p>
     <h3>Gesamtsteifigkeitsmatrix (ohne gestrichene Spalten und Zeilen)</h3>
     <TabelleMatrix
      :name="`<u>K</u><sub>ges</sub>`"
      :matrix="ergebnis.M_K_lang"
      :nachkommastellen="0"
      :upper-header="ergebnis.Freiheitsgrade_name"
     />

     <h3>Gleichungssystem</h3>
     <div style="display: flex; flex-direction: row; overflow-x: auto">
      <TabelleMatrix
       :name="`<u>K</u><sub>ges,red</sub> * <u>U</u> = <u>F</u>`"
       :matrix="ergebnis.M_K_kurz"
       :nachkommastellen="0"
       :upper-header="kondensiertHeader"
       style="flex: none"
      />
      <div class="text-vertical-centered">
       <span>*</span>
      </div>
      <TabelleMatrix
       :matrix="matTrans(ergebnis.Verformungsvektor_kurz)"
       :nachkommastellen="5"
       :upper-header="[`<u>U</u>`]"
       style="flex: none"
      />
      <div class="text-vertical-centered">
       <span>=</span>
      </div>
      <TabelleMatrix
       :matrix="matTrans(ergebnis.Lastvektor)"
       :nachkommastellen="2"
       :upper-header="[`<u>F</u>`]"
       style="flex: none"
      />
     </div>
    </v-card-item>
   </div>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
 import { computed, ref, watch } from "vue"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import TabelleMatrix from "../tabellen/TabelleMatrix.vue"
 import { Theorie } from "@/typescript/enumerations"
 import { matTrans } from "@/typescript/matrix"
 import { EINHEITEN } from "@/typescript/einheiten"
 import { myRound } from "@/typescript/util"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"

 const graphicSettings = useGraphicSettingsStore()

 let dialog = ref(false)

 const props = defineProps<{
  lastfall: Lastfall
 }>()

 const ergebnis = computed(() => props.lastfall.Ergebnis)
 const elementIndex = ref(0)
 const elementAuswahl = computed(() =>
  (ergebnis.value?.Balkenelementliste ?? []).map((e, i) => ({
   title: `Element ${e.Nummer} (${e.Bezeichnung})`,
   value: i,
  })),
 )
 const element = computed(() => ergebnis.value?.Balkenelementliste[elementIndex.value] ?? null)
 watch(ergebnis, () => (elementIndex.value = 0))

 const k_upperHeader = [
  `u<sub>i</sub>`,
  `w<sub>i</sub>`,
  `&phi;<sub>i</sub>`,
  `u<sub>k</sub>`,
  `w<sub>k</sub>`,
  `&phi;<sub>k</sub>`,
 ]

 const k_rightHeader = [
  `F<sub>x,i</sub>`,
  `F<sub>z,i</sub>`,
  `M<sub>i</sub>`,
  `F<sub>x,k</sub>`,
  `F<sub>z,k</sub>`,
  `M<sub>k</sub>`,
 ]

 const slider = ref(0)

 const kondensiertHeader = computed(() => {
  const erg = ergebnis.value!
  return erg.Verformungsinzidenzen.map((i) => erg.Freiheitsgrade_name[i])
 })

 const matrixName = computed(() => {
  if (element.value!.Theorie === Theorie.Theorie_1) {
   return `<u>k</u><sub>I,${element.value!.Nummer}</sub>`
  } else {
   return `<u>k</u><sub>II,${element.value!.Nummer}</sub>`
  }
 })

 const kindmann = computed(() => element.value!.kindmannParameter.map((v) => myRound(v, 6)))

 const header = [
  { title: "x", unit: EINHEITEN.m },
  { title: "N", unit: EINHEITEN.kN },
  { title: "V", unit: EINHEITEN.kN },
  { title: "M", unit: EINHEITEN.kNm },
  { title: "u<sub>x</sub>", unit: EINHEITEN.mm },
  { title: "u<sub>z</sub>", unit: EINHEITEN.mm },
  { title: "&phi;", unit: EINHEITEN.mrad },
 ]

 const data = computed(() => {
  const x = Math.min(Math.max(Number(slider.value) || 0, 0), element.value!.L)
  return [x]
   .concat(element.value!.Ausgabepunkt(x))
   .map((val, i) =>
    myRound(val * header[i].unit.vonSI, graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN),
   )
 })
</script>

<style scoped>
 .inhalt {
  overflow-y: auto;
  text-align: left;
 }
 .scroll-x {
  overflow-x: auto;
 }
 .erklärung {
  color: #555;
  font-size: 0.9em;
 }
 .text-vertical-centered {
  margin-bottom: auto;
  margin-top: auto;
  padding: 10px;
 }
 h2,
 h3,
 h4 {
  margin-top: 12px;
 }
</style>
