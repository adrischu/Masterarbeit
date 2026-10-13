<template>
 <v-dialog
  v-model="dialog"
  max-width="900"
  :fullscreen="mobile"
  scrollable
 >
  <template v-slot:activator="{ props: activatorProps }">
   <v-list-item
    v-bind="activatorProps"
    prepend-icon="mdi-chart-bell-curve-cumulative"
    title="Laststeigerung"
   />
  </template>
  <v-card>
   <v-toolbar
    density="compact"
    color="green-lighten-4"
   >
    <v-toolbar-title>Last-Verformungs-Kurve LF{{ lastfall.Nummer }}</v-toolbar-title>
    <v-spacer />
    <v-btn
     icon="mdi-close"
     @click="dialog = false"
    />
   </v-toolbar>
   <v-card-text class="text-left">
    <v-row dense>
     <v-col
      cols="4"
      sm="2"
      ><v-text-field
       v-model.number="von"
       type="number"
       label="Faktor von"
       density="compact"
       hide-details
     /></v-col>
     <v-col
      cols="4"
      sm="2"
      ><v-text-field
       v-model.number="bis"
       type="number"
       label="bis"
       density="compact"
       hide-details
     /></v-col>
     <v-col
      cols="4"
      sm="2"
      ><v-text-field
       v-model.number="schritte"
       type="number"
       label="Schritte"
       density="compact"
       hide-details
     /></v-col>
     <v-col
      cols="6"
      sm="3"
      ><v-select
       v-model="knotennummer"
       :items="knotenAuswahl"
       label="Knoten"
       density="compact"
       hide-details
     /></v-col>
     <v-col
      cols="6"
      sm="3"
      ><v-select
       v-model="richtung"
       :items="richtungen"
       label="Verformung"
       density="compact"
       hide-details
     /></v-col>
    </v-row>
    <div class="theorien">
     <v-checkbox
      v-for="(t, i) in alleTheorien"
      :key="t"
      v-model="theorien"
      :value="t"
      :label="kurzname[i]"
      :color="farben[i]"
      hide-details
      density="compact"
     />
    </div>
    <div class="knöpfe">
     <v-btn
      color="green"
      prepend-icon="mdi-play"
      :loading="rechnet"
      @click="berechnen"
      >Berechnen</v-btn
     >
     <v-btn
      prepend-icon="mdi-file-delimited-outline"
      :disabled="!ergebnis"
      @click="csvExport"
      >CSV</v-btn
     >
    </div>
    <p
     v-if="lastfall.Stabilität?.alphaCr"
     class="hinweis"
    >
     &alpha;<sub>cr</sub> = {{ myRound(lastfall.Stabilität.alphaCr, 4) }} wird als Asymptote
     angezeigt.
    </p>
    <p
     v-else
     class="hinweis"
    >
     Tipp: Über „Stabilität (α_cr)“ berechnen, um die Verzweigungslast als Asymptote anzuzeigen.
    </p>

    <!-- Diagramm -->
    <svg
     v-if="ergebnis"
     class="diagramm"
     :viewBox="`0 0 ${B} ${H}`"
     preserveAspectRatio="xMidYMid meet"
    >
     <rect
      :x="R.l"
      :y="R.o"
      :width="B - R.l - R.r"
      :height="H - R.o - R.u"
      fill="white"
      stroke="#999"
     />
     <!-- Gitter und Achsen -->
     <g
      v-for="t in xTicks"
      :key="`x${t}`"
     >
      <line
       :x1="px(t)"
       :x2="px(t)"
       :y1="R.o"
       :y2="H - R.u"
       stroke="#eee"
      />
      <text
       :x="px(t)"
       :y="H - R.u + 16"
       text-anchor="middle"
       font-size="12"
      >
       {{ zahl(t) }}
      </text>
     </g>
     <g
      v-for="t in yTicks"
      :key="`y${t}`"
     >
      <line
       :x1="R.l"
       :x2="B - R.r"
       :y1="py(t)"
       :y2="py(t)"
       stroke="#eee"
      />
      <text
       :x="R.l - 6"
       :y="py(t) + 4"
       text-anchor="end"
       font-size="12"
      >
       {{ zahl(t) }}
      </text>
     </g>
     <text
      :x="(B + R.l - R.r) / 2"
      :y="H - 4"
      text-anchor="middle"
      font-size="13"
      v-html="achsentitel"
     ></text>
     <text
      :x="14"
      :y="(H + R.o - R.u) / 2"
      text-anchor="middle"
      font-size="13"
      :transform="`rotate(-90 14 ${(H + R.o - R.u) / 2})`"
     >
      Lastfaktor
     </text>
     <!-- Asymptote -->
     <g v-if="alphaCr !== null && alphaCr <= yMax">
      <line
       :x1="R.l"
       :x2="B - R.r"
       :y1="py(alphaCr)"
       :y2="py(alphaCr)"
       stroke="rgb(230,120,0)"
       stroke-dasharray="6,4"
      />
      <text
       :x="B - R.r - 4"
       :y="py(alphaCr) - 4"
       text-anchor="end"
       font-size="12"
       fill="rgb(230,120,0)"
      >
       α_cr = {{ myRound(alphaCr, 3) }}
      </text>
     </g>
     <!-- Kurven -->
     <polyline
      v-for="kurve in ergebnis.kurven"
      :key="kurve.theorie"
      :points="punkte(kurve.werte)"
      fill="none"
      :stroke="farbe(kurve.theorie)"
      stroke-width="2"
     />
     <!-- Legende -->
     <g
      v-for="(kurve, i) in ergebnis.kurven"
      :key="`l${kurve.theorie}`"
     >
      <line
       :x1="R.l + 10"
       :x2="R.l + 30"
       :y1="R.o + 14 + 16 * i"
       :y2="R.o + 14 + 16 * i"
       :stroke="farbe(kurve.theorie)"
       stroke-width="3"
      />
      <text
       :x="R.l + 36"
       :y="R.o + 18 + 16 * i"
       font-size="12"
      >
       {{ kurzname[alleTheorien.indexOf(kurve.theorie)] }}
      </text>
     </g>
    </svg>
    <div
     v-for="kurve in ergebnis?.kurven.filter((k) => k.meldung)"
     :key="`m${kurve.theorie}`"
     class="hinweis"
    >
     {{ kurzname[alleTheorien.indexOf(kurve.theorie)] }}: {{ kurve.meldung }}
    </div>
   </v-card-text>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
 import { computed, ref, toRaw, watch } from "vue"
 import { useDisplay } from "vuetify"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import { useSystemStore } from "@/stores/SystemStore"
 import { useSettingsStore } from "@/stores/SettingsStore"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import { Theorie } from "@/typescript/enumerations"
 import {
  laststeigerung,
  laststeigerungCSV,
  type Laststeigerungsergebnis,
 } from "@/typescript/laststeigerung"
 import { myRound } from "@/typescript/util"
 import { textDateiSpeichern } from "@/typescript/DateiFunktionen"

 const props = defineProps<{ lastfall: Lastfall }>()
 const { mobile } = useDisplay()
 const systemStore = useSystemStore()
 const graphicSettings = useGraphicSettingsStore()

 const dialog = ref(false)
 const rechnet = ref(false)
 const von = ref(0)
 const bis = ref(1)
 const schritte = ref(20)
 const alleTheorien = Object.values(Theorie)
 const kurzname = ["Th. I", "Th. II trig.", "Th. II kubisch", "Th. II P-Δ"]
 const farben = ["rgb(80,80,80)", "rgb(0,0,220)", "rgb(0,150,0)", "rgb(200,0,0)"]
 const theorien = ref<Theorie[]>([...alleTheorien])
 const knotennummer = ref<number | null>(null)
 const richtung = ref(0)
 const richtungen = [
  { title: "u (global x)", value: 0 },
  { title: "w (global z)", value: 1 },
  { title: "φ", value: 2 },
 ]
 const ergebnis = ref<Laststeigerungsergebnis | null>(null)

 const knotenAuswahl = computed(() =>
  systemStore.system.Knotenliste.map((k) => ({ title: `Knoten ${k.Nummer}`, value: k.Nummer })),
 )
 watch(
  [dialog, knotenAuswahl],
  () => {
   if (!knotenAuswahl.value.some((k) => k.value === knotennummer.value)) {
    const liste = knotenAuswahl.value
    knotennummer.value = liste.length ? liste[liste.length - 1].value : null
   }
  },
  { immediate: true },
 )

 const alphaCr = computed(() => props.lastfall.Stabilität?.alphaCr ?? null)

 const einheit = computed(() =>
  richtung.value === 2
   ? graphicSettings.EINHEIT_ERGEBNIS_WINKEL
   : graphicSettings.EINHEIT_ERGEBNIS_LÄNGE,
 )
 const achsentitel = computed(
  () => `${["u", "w", "φ"][richtung.value]} Knoten ${knotennummer.value} [${einheit.value.text}]`,
 )

 function farbe(t: Theorie) {
  return farben[alleTheorien.indexOf(t)]
 }

 function berechnen() {
  if (knotennummer.value === null) return
  rechnet.value = true
  setTimeout(() => {
   try {
    const roh = toRaw(systemStore.system)
    const lf = roh.Lastfallliste.find((l) => l.Nummer === props.lastfall.Nummer)!
    ergebnis.value = laststeigerung(
     roh,
     lf,
     {
      von: Number(von.value),
      bis: Number(bis.value),
      schritte: Number(schritte.value),
      theorien: alleTheorien.filter((t) => theorien.value.includes(t)),
      knotennummer: knotennummer.value!,
      richtung: richtung.value,
     },
     useSettingsStore().rechenoptionen,
    )
    systemStore.system.Fehlerliste = roh.Fehlerliste.slice()
   } finally {
    rechnet.value = false
   }
  }, 20)
 }

 function csvExport() {
  if (!ergebnis.value) return
  textDateiSpeichern(
   laststeigerungCSV(ergebnis.value, einheit.value, alphaCr.value),
   `laststeigerung-LF${props.lastfall.Nummer}.csv`,
   "text/csv",
  )
 }

 //Diagramm
 const B = 640
 const H = 380
 const R = { l: 60, r: 16, o: 12, u: 40 }

 const werteX = computed(() => {
  const w: number[] = []
  ergebnis.value?.kurven.forEach((k) =>
   k.werte.forEach((v) => v !== null && w.push(v * einheit.value.vonSI)),
  )
  return w
 })
 const xMin = computed(() => Math.min(0, ...werteX.value))
 const xMax = computed(() => {
  const m = Math.max(0, ...werteX.value)
  return m === xMin.value ? xMin.value + 1 : m
 })
 const yMin = computed(() => Math.min(0, ...(ergebnis.value?.faktoren ?? [0])))
 const yMax = computed(() => {
  const m = Math.max(
   ...(ergebnis.value?.faktoren ?? [1]),
   alphaCr.value !== null ? alphaCr.value * 1.05 : 0,
  )
  return m === yMin.value ? yMin.value + 1 : m
 })

 function px(x: number) {
  return R.l + ((x - xMin.value) / (xMax.value - xMin.value)) * (B - R.l - R.r)
 }
 function py(y: number) {
  return H - R.u - ((y - yMin.value) / (yMax.value - yMin.value)) * (H - R.o - R.u)
 }
 function punkte(werte: (number | null)[]) {
  const f = ergebnis.value!.faktoren
  return werte
   .map((w, i) => (w === null ? null : `${px(w * einheit.value.vonSI)},${py(f[i])}`))
   .filter((p) => p !== null)
   .join(" ")
 }

 /** "schöne" Achsenteilung */
 function ticks(min: number, max: number, anzahl = 6): number[] {
  const roh = (max - min) / anzahl
  const p = Math.pow(10, Math.floor(Math.log10(roh)))
  const schritt = [1, 2, 2.5, 5, 10].map((f) => f * p).find((s) => s >= roh) ?? roh
  const liste: number[] = []
  for (let t = Math.ceil(min / schritt) * schritt; t <= max + 1e-9 * schritt; t += schritt) {
   liste.push(Math.abs(t) < 1e-12 * schritt ? 0 : t)
  }
  return liste
 }
 const xTicks = computed(() => ticks(xMin.value, xMax.value))
 const yTicks = computed(() => ticks(yMin.value, yMax.value))
 function zahl(v: number) {
  return myRound(v, 4).toLocaleString("de-DE")
 }
</script>

<style scoped>
 .theorien {
  display: flex;
  flex-wrap: wrap;
  gap: 0 12px;
 }
 .knöpfe {
  display: flex;
  gap: 8px;
  margin: 8px 0;
 }
 .diagramm {
  width: 100%;
  height: auto;
  max-height: 60vh;
 }
 .hinweis {
  color: #555;
  font-size: 0.9em;
 }
</style>
