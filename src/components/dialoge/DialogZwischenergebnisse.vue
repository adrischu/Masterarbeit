<template>
 <v-dialog
  v-model="dialog"
  transition="dialog-bottom-transition"
  fullscreen
 >
  <template v-slot:activator="{ props: activatorProps }">
   <v-btn
    icon="mdi-table-large"
    v-bind="activatorProps"
    density="compact"
   ></v-btn>
  </template>

  <v-card>
   <v-toolbar
    density="compact"
    class="action-fields"
    color="green-lighten-4"
    elevation="10"
    :border="true"
    style="overflow-y: hidden"
   >
    <v-toolbar-title>Zwischenergebnisse LF{{ lastfall.Nummer }}</v-toolbar-title>

    <v-toolbar-items>
     <v-btn
      icon="mdi-close"
      @click="dialog = false"
     ></v-btn>
    </v-toolbar-items>
   </v-toolbar>
   <div style="overflow-y: auto">
    <v-card-item>
     <!-- Inhalt -->
     <!-- Lastfallauswahl -->
     <h2>Elementergebnisse</h2>
     <v-card-actions>
      <v-select
       v-model="element"
       :items="lastfall.Balkenelementliste"
       :item-props="elementProps"
       return-object
       hide-details
      ></v-select
     ></v-card-actions>

     <h3>Schnittgrößen</h3>
     <v-slider
      v-model="slider"
      :max="element.Stab.Länge"
      :min="0"
      class="align-center"
      hide-details
     >
      <template v-slot:append>
       <v-text-field
        v-model="slider"
        density="compact"
        style="width: 70px"
        type="number"
        hide-details
        single-line
       ></v-text-field>
      </template>
     </v-slider>

     <v-table>
      <!--  -->
      <!-- Tabellenkopfzeile -->
      <!--  -->
      <thead>
       <tr>
        <th
         v-for="headerItem in header"
         :key="headerItem.title"
        >
         <span v-html="headerItem.title"></span>
         <span
          v-if="headerItem.unit.text"
          v-html="` [${headerItem.unit.text}]`"
         ></span>
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

     <h3>Stabkennzahl</h3>
     <div>&epsilon; = {{ element.epsilon }}</div>

     <h3>Elementsteifigkeitsmatrix</h3>
     <!-- Elementsteifigkeitsmatrix -->
     <TabelleMatrix
      :name="matrixName"
      :matrix="element.k_lok()"
      :nachkommastellen="0"
      :upper-header="k_upperHeader"
      :right-header="k_rightHeader"
     />
     <div
      v-if="
       element.Theorie === Theorie.Theorie_2_kub || element.Theorie === Theorie.Theorie_2_pDelta
      "
     >
      <!-- Falls nötig elastische Matrix -->
      <h4>elastischer Anteil</h4>
      <TabelleMatrix
       :name="`<u>k</u><sub>el,${element.Nummer}</sub>`"
       :matrix="element.k_el_lok()"
       :nachkommastellen="0"
       :upper-header="k_upperHeader"
       :right-header="k_rightHeader"
      />

      <!-- Falls nötig geometrische Matrix -->
      <h4>geometrischer Anteil</h4>
      <TabelleMatrix
       :name="`<u>k</u><sub>geo,${element.Nummer}</sub>`"
       :matrix="element.k_geo_lok()"
       :nachkommastellen="0"
       :upper-header="k_upperHeader"
       :right-header="k_rightHeader"
      />
     </div>

     <!-- Transformationsmatrix -->
     <h3>Transformationsmatrix</h3>
     <TabelleMatrix
      :name="`<u>T</u><sub>${element.Nummer}</sub>`"
      :matrix="matTrans(element.T)"
      :nachkommastellen="3"
      :upper-header="element.Inzidenzen"
      :right-header="element.Inzidenzen"
     />

     <v-divider></v-divider>

     <h2>Systemergebnisse</h2>
     <h3>Gesamtsteifigkeitsmatrix (ohne gestrichene Spalten und Zeilen)</h3>
     <TabelleMatrix
      :name="`<u>K</u><sub>ges</sub>`"
      :matrix="lastfall.M_K_lang"
      :nachkommastellen="0"
      :upper-header="gesamtSteifigkeitHeader"
     />

     <h3>Gleichungssystem</h3>
     <div style="display: flex; flex-direction: row; overflow-x: auto">
      <!-- Steifigkeitsmatrix -->
      <TabelleMatrix
       :name="`<u>K</u><sub>ges,red</sub> * <u>U</u> = <u>F</u>`"
       :matrix="lastfall.M_K_kurz"
       :nachkommastellen="0"
       :upper-header="gesamtSteifigkeitKondensiertHeader"
       style="flex: none"
      />
      <div class="text-vertical-centered">
       <span>*</span>
      </div>
      <TabelleMatrix
       :matrix="matTrans(lastfall.Verformungsvektor_kurz)"
       :nachkommastellen="5"
       :upper-header="[`<u>U</u>`]"
       style="flex: none"
      />
      <div class="text-vertical-centered">
       <span>=</span>
      </div>
      <TabelleMatrix
       :matrix="matTrans(lastfall.Lastvektor)"
       :nachkommastellen="2"
       :upper-header="[`<u>F</u>`]"
       style="flex: none"
      />
     </div>
     <v-spacer vertical></v-spacer>
    </v-card-item>
   </div>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
 import { computed, ref, type Ref } from "vue"
 import { useSystemStore } from "@/stores/SystemStore"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import type Balkenelement from "@/typescript/classes/Balkenelement"
 import TabelleMatrix from "../tabellen/TabelleMatrix.vue"
 import { Theorie } from "@/typescript/enumerations"
 import { matTrans } from "@/typescript/matrix"
 import { onBeforeUpdate } from "vue"
 import { useEinheitenStore } from "@/stores/EinheitenStore"
 import { myRound } from "@/typescript/util"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"

 const system = useSystemStore().system
 const graphicSettings = useGraphicSettingsStore()
 const einheiten = useEinheitenStore()

 let dialog: Ref<boolean> = ref(false)

 const props = defineProps<{
  lastfall: Lastfall
 }>()

 const element: Ref<Balkenelement> = ref(props.lastfall.Balkenelementliste[0])
 let elementProps = function (element: Balkenelement) {
  return { title: `Element ${element.Nummer}` }
 }

 const k_upperHeader = new Array(
  `u<sub>i</sub>`,
  `w<sub>i</sub>`,
  `&phi;<sub>i</sub>`,
  `u<sub>k</sub>`,
  `w<sub>k</sub>`,
  `&phi;<sub>k</sub>`,
 )

 const k_rightHeader = new Array(
  `F<sub>x,i</sub>`,
  `F<sub>z,i</sub>`,
  `M<sub>i</sub>`,
  `F<sub>x,k</sub>`,
  `F<sub>z,k</sub>`,
  `M<sub>k</sub>`,
 )

 const slider = ref(0)

 const gesamtSteifigkeitHeader = computed(() => {
  const res: any[] = []
  system.Knotenliste.forEach((knoten) => {
   res.push(`u<sub>${knoten.Nummer}</sub>`)
   res.push(`w<sub>${knoten.Nummer}</sub>`)
   res.push(`&phi;<sub>${knoten.Nummer}</sub>`)
  })
  system.Stabliste.forEach((stab) => {
   if (stab.Anfangsgelenknummer) {
    res.push(`u<sub>Stab${stab.Nummer},i</sub>`)
    res.push(`w<sub>Stab${stab.Nummer},i</sub>`)
    res.push(`&phi;<sub>Stab${stab.Nummer},i</sub>`)
   }
   if (stab.Endgelenknummer) {
    res.push(`u<sub>Stab${stab.Nummer},k</sub>`)
    res.push(`w<sub>Stab${stab.Nummer},k</sub>`)
    res.push(`&phi;<sub>Stab${stab.Nummer},k</sub>`)
   }
  })
  return res
 })

 const gesamtSteifigkeitKondensiertHeader = computed(() => {
  return gesamtSteifigkeitHeader.value.filter((val, index) =>
   system.Verformungsinzidenzen.includes(index),
  )
 })

 const matrixName = computed(() => {
  if (element.value.Theorie === Theorie.Theorie_1) {
   return `<u>k</u><sub>I,${element.value.Nummer}</sub>`
  } else {
   return `<u>k</u><sub>II,${element.value.Nummer}</sub>`
  }
 })

 const einheitVerformung = einheiten.mm
 const einheitVerdrehung = einheiten.mrad
 const einheitKraft = einheiten.kN
 const einheitMoment = einheiten.kNm
 const header = [
  { title: "x", unit: einheiten.m },
  { title: "N", unit: einheitKraft },
  { title: "V", unit: einheitKraft },
  { title: "M", unit: einheitMoment },
  { title: "u<sub>x</sub>", unit: einheitVerformung },
  { title: "u<sub>z</sub>", unit: einheitVerformung },
  { title: "&phi;", unit: einheitVerdrehung },
 ]

 const data = computed(() => {
  return [slider.value]
   .concat(element.value.Ausgabepunkt(slider.value))
   .map((val, i) =>
    myRound(val * header[i].unit.vonSI, graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN),
   )
 })

 onBeforeUpdate(() => {
  element.value = props.lastfall.Balkenelementliste[0]
 })
</script>

<style scoped>
 .text-vertical-centered {
  margin-bottom: auto;
  margin-top: auto;
  padding: 10px;
 }
</style>
