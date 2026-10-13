<template>
 <div class="header">
  <v-toolbar
   density="compact"
   :class="['werkzeugleiste', { schmal }]"
   color="green-lighten-4"
   elevation="4"
  >
   <!-- Datei öffnen -->
   <v-btn
    :density="schmal ? 'compact' : 'default'"
    icon="mdi-folder-open-outline"
    title="System öffnen"
    @click="fileInput?.click()"
   ></v-btn>
   <input
    type="file"
    ref="fileInput"
    accept=".json,application/json"
    style="display: none"
    @change="clickFileUpload"
   />

   <!-- Speichern -->
   <v-btn
    :density="schmal ? 'compact' : 'default'"
    v-if="!schmal"
    @click="speichern"
    icon="mdi-content-save-outline"
    title="System speichern"
   ></v-btn>

   <!-- Rückgängig / Wiederholen -->
   <v-btn
    :density="schmal ? 'compact' : 'default'"
    icon="mdi-undo"
    title="Rückgängig (Strg+Z)"
    :disabled="!systemStore.kannRückgängig"
    @click="systemStore.rückgängig()"
   ></v-btn>
   <v-btn
    :density="schmal ? 'compact' : 'default'"
    v-if="!schmal"
    icon="mdi-redo"
    title="Wiederholen (Strg+Y)"
    :disabled="!systemStore.kannWiederholen"
    @click="systemStore.wiederholen()"
   ></v-btn>

   <v-divider
    class="divider"
    vertical
   />

   <!-- Rechenbutton -->
   <v-btn
    :density="schmal ? 'compact' : 'default'"
    icon="mdi-calculator"
    title="Berechnen"
    color="green-darken-3"
    @click="handleStartBerechnung()"
   ></v-btn>

   <!-- Sichtbarkeiten -->
   <v-menu :close-on-content-click="false">
    <template v-slot:activator="{ props }">
     <v-btn
      :density="schmal ? 'compact' : 'default'"
      icon="mdi-eye-outline"
      title="Sichtbarkeit"
      v-bind="props"
     />
    </template>
    <v-list density="compact">
     <v-list-item
      v-for="eintrag in sichtbarkeiten"
      :key="eintrag.schlüssel"
     >
      <v-checkbox-btn
       :label="eintrag.titel"
       v-model="(graphicSettings as any)[eintrag.schlüssel]"
      ></v-checkbox-btn>
     </v-list-item>
    </v-list>
   </v-menu>

   <!-- Lastfallauswahl -->
   <!-- item-value="Nummer" sorgt dafür dass nicht das komplette Objekt verglichen wird, was zu "max stack size exceeded" führen kann -->
   <v-select
    class="auswahl"
    v-model="lastfallnummer"
    :items="systemStore.system.Lastfallliste"
    :item-props="lastfallProps"
    item-value="Nummer"
    hide-details
    density="compact"
    variant="plain"
   ></v-select>

   <!-- Ergebnisgröße Auswahl -->
   <v-select
    class="auswahl auswahl-klein"
    hide-details
    density="compact"
    variant="plain"
    v-model="ergebnisgroesse"
    :items="ergebnisgroessenAuswahl"
    :disabled="!lastfall?.istBerechnet"
    ><template #selection="{ item }">
     <span v-html="item.raw.title"></span>
    </template>
    <template #item="{ item, props }">
     <v-list-item v-bind="props">
      <template #title>
       <span v-html="item.raw.title"></span>
      </template>
     </v-list-item>
    </template>
   </v-select>

   <v-spacer></v-spacer>

   <!-- "Mehr-Menü" (auf schmalen Bildschirmen auch Speichern, Wiederholen, Löschen) -->
   <v-menu>
    <template v-slot:activator="{ props }">
     <v-btn
      icon="mdi-dots-vertical"
      title="Weitere Funktionen"
      v-bind="props"
     />
    </template>
    <v-list density="compact">
     <v-list-item
      v-if="schmal"
      prepend-icon="mdi-content-save-outline"
      title="System speichern"
      @click="speichern"
     />
     <v-list-item
      v-if="schmal"
      prepend-icon="mdi-redo"
      title="Wiederholen"
      :disabled="!systemStore.kannWiederholen"
      @click="systemStore.wiederholen()"
     />
     <v-list-item
      prepend-icon="mdi-trash-can-outline"
      title="Neues System (alles löschen)"
      @click="offen.löschen = true"
     />
     <v-list-item
      prepend-icon="mdi-shape-outline"
      title="Beispielsysteme"
      @click="beispielDialog = true"
     />
     <v-divider />
     <v-list-item
      prepend-icon="mdi-arrow-collapse-vertical"
      title="Stabilität (α_cr)"
      @click="offen.stabilität = true"
     />
     <v-list-item
      prepend-icon="mdi-chart-bell-curve-cumulative"
      title="Laststeigerung"
      @click="offen.laststeigerung = true"
     />
     <v-divider />
     <v-list-item
      prepend-icon="mdi-svg"
      title="Grafik als SVG speichern"
      @click="alsSVGSpeichern"
     />
     <v-list-item
      prepend-icon="mdi-file-image-outline"
      title="Grafik als PNG speichern"
      @click="pngSpeichern"
     />
     <v-divider />
     <v-list-item
      prepend-icon="mdi-book-open-variant"
      title="Handbuch"
      @click="offen.handbuch = true"
     />
     <v-list-item
      prepend-icon="mdi-cog-outline"
      title="Einstellungen"
      @click="offen.einstellungen = true"
     />
    </v-list>
   </v-menu>
  </v-toolbar>
 </div>

 <div
  class="main-content"
  ref="hauptbereich"
 >
  <!-- Div für Grafikfenster -->
  <div
   id="grafik-fenster"
   class="svg-container"
   :style="{ height: graphicSettings.HÖHE_GRAFIK + '%' }"
  >
   <FensterGrafik
    v-if="lastfall"
    :lastfall="lastfall"
    :ergebnisgroesse="ergebnisgroesse"
   />
  </div>

  <!-- Div für Tabelle -->
  <div
   class="table-container"
   :style="{ height: graphicSettings.HÖHE_TABELLE + '%' }"
  >
   <!-- Halbkreis zum Ändern der Höhe von Grafik und Tabelle (Maus, Touch und Stift) -->
   <div
    class="resize-griff"
    title="Ziehen, um Grafik und Tabelle zu vergrößern bzw. zu verkleinern"
    @pointerdown="startResizing"
    @pointermove="resizePanels"
    @pointerup="stopResizing"
    @pointercancel="stopResizing"
    @dblclick="höheZurücksetzen()"
   >
    <div class="resize-halbkreis">
     <v-icon
      size="22"
      icon="mdi-drag-horizontal"
     />
    </div>
   </div>
   <div class="table-scroll">
    <TabelleVariabel
     v-if="lastfall"
     :lastfall="lastfall"
    />
   </div>
  </div>
 </div>
 <!-- Div für Fußzeile -->
 <div class="footer">
  &copy; Adrian Schubert - {{ new Date().getFullYear() }} - v1.1.0
  <span
   v-if="systemStore.ungespeichert"
   class="ungespeichert"
   title="Änderungen seit dem letzten Speichern. Das System wird automatisch im Browser gesichert."
   >·
   {{
    schmal ? "ungespeichert" : "ungespeicherte Änderungen (automatisch im Browser gesichert)"
   }}</span
  >
 </div>

 <!-- Dialoge (außerhalb des Menüs, damit sie beim Schließen des Menüs erhalten bleiben) -->
 <DialogDeleteSystem
  v-model="offen.löschen"
  @accept-delete="
   () => {
    systemStore.vorÄnderung()
    preloadSystem(0)
   }
  "
 />
 <DialogStabilitaet
  v-if="lastfall"
  v-model="offen.stabilität"
  :lastfall="lastfall"
 />
 <DialogLaststeigerung
  v-if="lastfall"
  v-model="offen.laststeigerung"
  :lastfall="lastfall"
 />
 <DialogHandbuch v-model="offen.handbuch" />
 <DialogEinstellungen v-model="offen.einstellungen" />

 <DialogFehler
  v-if="fehlerDialog"
  @afterLeave="toggleFehlerDialog()"
 />

 <!-- Beispielsysteme -->
 <v-dialog
  v-model="beispielDialog"
  max-width="480"
 >
  <v-card title="Beispielsysteme">
   <v-list>
    <v-list-item
     v-for="b in beispiele"
     :key="b.nr"
     :title="b.titel"
     :subtitle="b.text"
     @click="beispielLaden(b.nr)"
    />
   </v-list>
  </v-card>
 </v-dialog>

 <v-snackbar
  v-model="meldungAnzeigen"
  timeout="6000"
  :color="meldungFarbe"
 >
  {{ meldung }}
 </v-snackbar>
</template>

<script setup lang="ts">
 import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
 import { useDisplay } from "vuetify"
 import { useSystemStore } from "@/stores/SystemStore"
 import TabelleVariabel from "./tabellen/TabelleVariabel.vue"
 import FensterGrafik from "./FensterGrafik.vue"
 import DialogEinstellungen from "./dialoge/DialogEinstellungen.vue"
 import DialogHandbuch from "./dialoge/DialogHandbuch.vue"
 import DialogFehler from "./dialoge/DialogFehler.vue"
 import DialogDeleteSystem from "./dialoge/DialogDeleteSystem.vue"
 import DialogStabilitaet from "./dialoge/DialogStabilitaet.vue"
 import DialogLaststeigerung from "./dialoge/DialogLaststeigerung.vue"
 import {
  saveSystemToFile,
  systemAusDateiLaden,
  alsSVGSpeichern,
  alsPNGSpeichern,
 } from "@/typescript/DateiFunktionen"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import { preloadSystem } from "@/typescript/SystemPreload"
 import type Lastfall from "@/typescript/classes/Lastfall"

 const systemStore = useSystemStore()
 const graphicSettings = useGraphicSettingsStore()
 const { width } = useDisplay()
 /** Schmale Bildschirme (Smartphone hochkant): selten genutzte Knöpfe ins Menü verschieben */
 const schmal = computed(() => width.value < 600)

 const fileInput = ref<HTMLInputElement | null>(null)
 /** Geöffnete Dialoge */
 const offen = reactive({
  löschen: false,
  stabilität: false,
  laststeigerung: false,
  handbuch: false,
  einstellungen: false,
 })
 const hauptbereich = ref<HTMLElement | null>(null)

 //Lastfallauswahl über die Nummer (bleibt gültig, wenn das System ersetzt wird, z. B. bei Rückgängig)
 const lastfallnummer = ref<number>(systemStore.system.Lastfallliste[0]?.Nummer ?? 1)
 const lastfall = computed<Lastfall | undefined>(
  () =>
   systemStore.system.Lastfallliste.find((lf) => lf.Nummer === lastfallnummer.value) ??
   systemStore.system.Lastfallliste[0],
 )
 watch(lastfall, (lf) => {
  if (lf && lf.Nummer !== lastfallnummer.value) lastfallnummer.value = lf.Nummer
 })

 let ergebnisgroesse = ref(2)
 const ergebnisgroessenAuswahl = computed(() => [
  { title: `N [${graphicSettings.EINHEIT_ERGEBNIS_KRAFT.text}]`, value: 0 },
  { title: `V [${graphicSettings.EINHEIT_ERGEBNIS_KRAFT.text}]`, value: 1 },
  { title: `M [${graphicSettings.EINHEIT_ERGEBNIS_MOMENT.text}]`, value: 2 },
  { title: `u [${graphicSettings.EINHEIT_ERGEBNIS_LÄNGE.text}]`, value: 3 },
  { title: `w [${graphicSettings.EINHEIT_ERGEBNIS_LÄNGE.text}]`, value: 4 },
  { title: `φ [${graphicSettings.EINHEIT_ERGEBNIS_WINKEL.text}]`, value: 5 },
 ])
 let lastfallProps = function (lastfall: Lastfall) {
  return { title: `LF ${lastfall.Nummer}`, subtitle: lastfall.Name }
 }

 const sichtbarkeiten = [
  { titel: "Werte", schlüssel: "SICHTBARKEIT_WERTE" },
  { titel: "alle Werte (sonst nur Extremwerte)", schlüssel: "SICHTBARKEIT_ALLEWERTE" },
  { titel: "Lasten", schlüssel: "SICHTBARKEIT_LASTEN" },
  { titel: "Schnittgrößen", schlüssel: "SICHTBARKEIT_SCHNITTGROESSEN" },
  { titel: "Verformung", schlüssel: "SICHTBARKEIT_VERFORMUNG" },
  { titel: "Lagerkräfte", schlüssel: "SICHTBARKEIT_LAGERKRAEFTE" },
  { titel: "Eigenform (Stabilität)", schlüssel: "SICHTBARKEIT_EIGENFORM" },
 ]

 //
 //Größenänderung Grafik/Tabelle (Pointer Events: Maus, Touch, Stift)
 //
 let isResizing = false
 const MIN_HÖHE = 10 //%
 const MAX_HÖHE = 92 //%

 function startResizing(e: PointerEvent) {
  e.preventDefault()
  isResizing = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
 }

 function resizePanels(e: PointerEvent) {
  if (!isResizing || !hauptbereich.value) return
  const rect = hauptbereich.value.getBoundingClientRect()
  const anteil = ((e.clientY - rect.top) / rect.height) * 100
  const grafik = Math.min(MAX_HÖHE, Math.max(MIN_HÖHE, anteil))
  graphicSettings.HÖHE_GRAFIK = grafik
  graphicSettings.HÖHE_TABELLE = 100 - grafik
 }

 function stopResizing(e: PointerEvent) {
  isResizing = false
  ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
 }

 function höheZurücksetzen() {
  graphicSettings.HÖHE_GRAFIK = 60
  graphicSettings.HÖHE_TABELLE = 40
 }

 //
 //Berechnung
 //
 function handleStartBerechnung(): void {
  //Der Fehlerdialog wird geöffnet, wenn vor der Berechnung noch Fehler vorhanden sind,
  //oder wenn nach der Berechnung Fehler vorhanden sind.
  if (!systemStore.berechnen() || systemStore.system.Fehlerliste.length) {
   toggleFehlerDialog()
  }
 }

 const fehlerDialog = ref(false)
 function toggleFehlerDialog(): void {
  fehlerDialog.value = !fehlerDialog.value
 }

 //
 //Dateien
 //
 const meldung = ref("")
 const meldungFarbe = ref("green-darken-2")
 const meldungAnzeigen = ref(false)
 function zeigeMeldung(text: string, fehler = false) {
  meldung.value = text
  meldungFarbe.value = fehler ? "red-darken-2" : "green-darken-2"
  meldungAnzeigen.value = true
 }

 async function clickFileUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
   await systemAusDateiLaden(file)
   zeigeMeldung(`"${file.name}" wurde geöffnet.`)
  } catch (fehler) {
   zeigeMeldung((fehler as Error).message, true)
  } finally {
   input.value = ""
  }
 }

 function speichern() {
  saveSystemToFile()
 }

 async function pngSpeichern() {
  try {
   await alsPNGSpeichern()
  } catch (fehler) {
   zeigeMeldung((fehler as Error).message, true)
  }
 }

 //
 //Beispielsysteme
 //
 const beispielDialog = ref(false)
 const beispiele = [
  { nr: 7, titel: "Startsystem", text: "Kragarm, LF2 kopiert LF1 und rechnet nach Th. II" },
  { nr: 1, titel: "RSTAB-Vergleich (Arbeit Tab. 2)", text: "Rahmen mit Gelenk, Vorverformung" },
  { nr: 2, titel: "Kragarm mit 10 Stäben (Arbeit Tab. 3)", text: "Vergleich der Näherungen" },
  { nr: 3, titel: "Parameterstudie System 1", text: "Kragarm 1 Element, alle Theorien" },
  { nr: 5, titel: "System 2 (verschieblicher Rahmen)", text: "Stabilität: α_cr" },
 ]
 function beispielLaden(nr: number) {
  systemStore.vorÄnderung()
  preloadSystem(nr)
  beispielDialog.value = false
 }

 //
 //Tastaturkürzel
 //
 function tastatur(e: KeyboardEvent) {
  const ziel = e.target as HTMLElement
  if (ziel && (ziel.tagName === "INPUT" || ziel.tagName === "SELECT")) return
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
   e.preventDefault()
   systemStore.rückgängig()
  } else if (
   (e.ctrlKey || e.metaKey) &&
   (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))
  ) {
   e.preventDefault()
   systemStore.wiederholen()
  }
 }
 onMounted(() => window.addEventListener("keydown", tastatur))
 onBeforeUnmount(() => window.removeEventListener("keydown", tastatur))
</script>

<style>
 .svg-container {
  position: relative;
  width: 100%;
  min-height: 0;
 }

 .table-container {
  position: relative;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #bbb;
 }

 .table-scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
 }

 .divider {
  margin-top: 7px;
  margin-bottom: 7px;
 }

 .werkzeugleiste .auswahl {
  max-width: 220px;
  min-width: 90px;
 }
 .werkzeugleiste .auswahl-klein {
  max-width: 130px;
 }
 .werkzeugleiste .v-toolbar__content {
  overflow-x: auto;
  overflow-y: hidden;
 }
 .werkzeugleiste.schmal .auswahl {
  min-width: 70px;
  max-width: 92px;
 }
 .werkzeugleiste.schmal .divider {
  display: none;
 }
 .werkzeugleiste .v-select__selection {
  white-space: nowrap;
 }

 /* Griff zum Ändern der Höhe: Halbkreis mittig über der Tabelle, Greiffläche ≥ 44 px */
 .resize-griff {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 72px;
  height: 46px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  cursor: row-resize;
  touch-action: none;
  z-index: 5;
 }
 .resize-halbkreis {
  width: 60px;
  height: 30px;
  border-radius: 30px 30px 0 0;
  background: white;
  border: 1px solid #bbb;
  border-bottom: none;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
 }
 .resize-griff:hover .resize-halbkreis {
  background: #eef7ee;
 }
 .ungespeichert {
  color: #8a5a00;
 }
</style>
