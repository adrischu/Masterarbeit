<template>
 <div class="tabellenfenster">
  <div class="tabellen-auswahl">
   <!-- Auswahl ob System, Lasten, Fehler oder Ergebnisse -->
   <v-tabs
    v-model="tabellentyp"
    density="compact"
    show-arrows
    height="36"
   >
    <v-tab value="system">System</v-tab>
    <v-tab value="lasten">Lasten</v-tab>
    <v-tab
     :disabled="systemStore.system.Fehlerliste.length === 0"
     value="fehler"
     >Fehler ({{ systemStore.system.Fehlerliste.length }})</v-tab
    >
    <v-tab
     :disabled="!lastfall.istBerechnet"
     value="ergebnisse"
     >Ergebnisse</v-tab
    >
   </v-tabs>
   <v-divider></v-divider>
   <!-- Auswahl welche Tabelle -->
   <v-tabs
    v-if="untertabs.length"
    v-model="tabellenUntertyp"
    density="compact"
    show-arrows
    height="36"
   >
    <v-tab
     v-for="tab in untertabs"
     :key="tab.wert"
     :value="tab.wert"
     :disabled="tab.gesperrt"
     >{{ tab.titel }}</v-tab
    >
    <DialogZwischenergebnisse
     v-if="tabellentyp === 'ergebnisse' && lastfall.istBerechnet"
     :lastfall="lastfall"
    ></DialogZwischenergebnisse>
   </v-tabs>
  </div>

  <div class="tabellen-inhalt">
   <div
    v-if="lastfall.istKopieVon && tabellentyp === 'lasten' && tabellenUntertyp !== 'Lastfall'"
    class="hinweis"
   >
    LF {{ lastfall.Nummer }} kopiert die Lasten von LF {{ lastfall.istKopieVonNummer }}. Bitte die
    Lasten dort bearbeiten.
   </div>
   <TabelleTemplate
    v-else-if="eingabetabelle"
    :key="`${eingabetabelle.typ}-${eingabetabelle.lastfall}`"
    :objektTyp="eingabetabelle.typ"
    :lastfallnummer="eingabetabelle.lastfall"
   />
   <TabelleFehler v-else-if="tabellentyp === 'fehler'" />
   <template v-else-if="tabellentyp === 'ergebnisse' && lastfall.istBerechnet">
    <TabelleKnotenergebnisse
     v-if="tabellenUntertyp === 'knotenergebnisse'"
     :lastfall="lastfall"
    />
    <TabelleStabergebnisse
     v-if="tabellenUntertyp === 'stabergebnisse'"
     :lastfall="lastfall"
    />
    <TabelleLagerkraefte
     v-if="tabellenUntertyp === 'lagerkraefte'"
     :lastfall="lastfall"
    />
   </template>
  </div>
 </div>
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"
 import { computed, ref, watch } from "vue"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import TabelleTemplate from "./TabelleTemplate.vue"
 import TabelleKnotenergebnisse from "./TabelleKnotenergebnisse.vue"
 import TabelleStabergebnisse from "./TabelleStabergebnisse.vue"
 import TabelleLagerkraefte from "./TabelleLagerkraefte.vue"
 import TabelleFehler from "./TabelleFehler.vue"
 import DialogZwischenergebnisse from "../dialoge/DialogZwischenergebnisse.vue"

 const props = defineProps<{
  lastfall: Lastfall
 }>()

 const systemStore = useSystemStore()
 const tabellentyp = ref<string>("system")
 const tabellenUntertyp = ref<string>("Knoten")

 const untertabs = computed(() => {
  const lf = props.lastfall.Nummer
  const kopie = props.lastfall.istKopieVon !== null
  switch (tabellentyp.value) {
   case "system":
    return [
     { wert: "Lager", titel: "Lager" },
     { wert: "Knoten", titel: "Knoten" },
     { wert: "Material", titel: "Materialien" },
     { wert: "Querschnitt", titel: "Querschnitte" },
     { wert: "Gelenk", titel: "Gelenke" },
     { wert: "Stab", titel: "Stäbe" },
    ].map((t) => ({ ...t, gesperrt: false }))
   case "lasten":
    return [
     { wert: "Lastfall", titel: "Lastfälle", gesperrt: false },
     { wert: "Knotenlast", titel: `Knotenlasten LF${lf}`, gesperrt: kopie },
     { wert: "StablastStreckenlast", titel: `Streckenlasten LF${lf}`, gesperrt: kopie },
     { wert: "StablastEinzellast", titel: `Einzellasten LF${lf}`, gesperrt: kopie },
     { wert: "StablastTemperatur", titel: `Temperatur LF${lf}`, gesperrt: kopie },
     { wert: "StablastVorverformung", titel: `Vorverformungen LF${lf}`, gesperrt: kopie },
    ]
   case "ergebnisse":
    return [
     { wert: "knotenergebnisse", titel: `Knoten LF${lf}`, gesperrt: false },
     { wert: "stabergebnisse", titel: `Stäbe LF${lf}`, gesperrt: false },
     { wert: "lagerkraefte", titel: `Lagerkräfte LF${lf}`, gesperrt: false },
    ]
   default:
    return []
  }
 })

 //Beim Wechsel des Tabellentyps die erste passende Untertabelle wählen
 watch(
  [tabellentyp, untertabs],
  () => {
   const tabs = untertabs.value
   if (tabs.length && !tabs.some((t) => t.wert === tabellenUntertyp.value && !t.gesperrt)) {
    tabellenUntertyp.value = (tabs.find((t) => !t.gesperrt) ?? tabs[0]).wert
   }
  },
  { immediate: true },
 )

 //Ergebnisse verschwinden nach Änderungen -> zurück zur Eingabe
 watch(
  () => props.lastfall.istBerechnet,
  (berechnet) => {
   if (!berechnet && tabellentyp.value === "ergebnisse") tabellentyp.value = "system"
  },
 )

 /** Eingabetabelle für die aktuelle Auswahl (oder null) */
 const eingabetabelle = computed(() => {
  if (tabellentyp.value === "system") return { typ: tabellenUntertyp.value, lastfall: 0 }
  if (tabellentyp.value === "lasten") {
   const typ = tabellenUntertyp.value
   return { typ, lastfall: typ === "Lastfall" ? 0 : props.lastfall.Nummer }
  }
  return null
 })
</script>

<style scoped>
 .tabellenfenster {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: white;
 }
 .tabellen-auswahl {
  flex: none;
  border-bottom: 1px solid #ddd;
 }
 .tabellen-inhalt {
  flex: 1;
  min-height: 0;
  overflow: hidden;
 }
 .hinweis {
  padding: 12px;
  color: #555;
 }
</style>
