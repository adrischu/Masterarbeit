<template>
 <v-dialog
  v-model="dialog"
  max-width="560"
  :fullscreen="mobile"
  scrollable
 >
  <template v-slot:activator="{ props: activatorProps }">
   <v-list-item
    v-bind="activatorProps"
    prepend-icon="mdi-arrow-collapse-vertical"
    title="Stabilität (α_cr)"
   />
  </template>
  <v-card>
   <v-toolbar
    density="compact"
    color="green-lighten-4"
   >
    <v-toolbar-title>Verzweigungslastfaktor LF{{ lastfall.Nummer }}</v-toolbar-title>
    <v-spacer />
    <v-btn
     icon="mdi-close"
     @click="dialog = false"
    />
   </v-toolbar>
   <v-card-text class="text-left">
    <p>
     Gesucht ist der Faktor &alpha;<sub>cr</sub>, mit dem alle Lasten des Lastfalls gesteigert
     werden können, bis das System ausknickt (Verzweigung). Gerechnet wird mit dem Ansatz
     <b>{{ ansatz }}</b
     >.
    </p>
    <v-radio-group
     v-model="normalkraft"
     hide-details
     density="compact"
    >
     <v-radio
      value="Th1"
      label="Normalkräfte nach Th. I, proportional gesteigert (lineare Verzweigungsanalyse, Standard)"
     />
     <v-radio
      value="Th2"
      label="Normalkräfte nach Th. II beim jeweiligen Lastfaktor (Laststeigerung, erfasst Umlagerungen)"
     />
    </v-radio-group>
    <v-btn
     class="mt-3"
     color="green"
     prepend-icon="mdi-calculator"
     :loading="rechnet"
     @click="berechnen"
     >Berechnen</v-btn
    >

    <div
     v-if="ergebnis"
     class="mt-4"
    >
     <div
      v-if="ergebnis.alphaCr !== null"
      class="ergebnis"
     >
      &alpha;<sub>cr</sub> = <b>{{ myRound(ergebnis.alphaCr, 4) }}</b>
     </div>
     <p
      v-if="ergebnis.Hinweis"
      class="hinweis"
     >
      {{ ergebnis.Hinweis }}
     </p>
     <v-checkbox
      v-if="ergebnis.Eigenform.length"
      v-model="graphicSettings.SICHTBARKEIT_EIGENFORM"
      label="Eigenform in der Grafik anzeigen (orange, gestrichelt)"
      hide-details
      density="compact"
     />
    </div>
    <p class="hinweis mt-4">
     Verfahren: Bisektion über den Lastfaktor mit Zählung der Eigenwerte nach Wittrick–Williams
     (negative Pivots der LDL<sup>T</sup>-Zerlegung + Knickeigenwerte der beidseitig eingespannten
     Elemente beim trigonometrischen Ansatz). Beim kubischen Ansatz und P-&Delta; entspricht dies
     dem linearen Eigenwertproblem (K<sub>el</sub> + &alpha;·K<sub>geo</sub>)·&phi; = 0.
    </p>
   </v-card-text>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
 import { computed, ref } from "vue"
 import { useDisplay } from "vuetify"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import { useSystemStore } from "@/stores/SystemStore"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import { stabilitätsansatz } from "@/typescript/stabilitaet"
 import { myRound } from "@/typescript/util"

 const props = defineProps<{ lastfall: Lastfall }>()
 const { mobile } = useDisplay()
 const systemStore = useSystemStore()
 const graphicSettings = useGraphicSettingsStore()
 const dialog = ref(false)
 const rechnet = ref(false)
 const normalkraft = ref<"Th1" | "Th2">("Th1")

 const ansatz = computed(() => stabilitätsansatz(props.lastfall))
 const ergebnis = computed(() => props.lastfall.Stabilität)

 function berechnen() {
  rechnet.value = true
  //kurz warten, damit die Ladeanzeige erscheint
  setTimeout(() => {
   try {
    const erg = systemStore.stabilitätBerechnen(props.lastfall.Nummer, normalkraft.value)
    graphicSettings.SICHTBARKEIT_EIGENFORM = !!erg && erg.Eigenform.length > 0
   } finally {
    rechnet.value = false
   }
  }, 20)
 }
</script>

<style scoped>
 .ergebnis {
  font-size: 1.4em;
 }
 .hinweis {
  color: #555;
  font-size: 0.9em;
 }
</style>
