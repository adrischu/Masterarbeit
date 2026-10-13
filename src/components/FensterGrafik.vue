<template>
 <div
  ref="container"
  class="grafik-container"
 >
  <svg
   version="1.1"
   id="svg-komponente"
   class="svg-content"
   :width="breite"
   :height="höhe"
   @wheel="wheel"
   @pointerdown="hintergrundPointerDown"
   @pointermove="pointerMove"
   @pointerup="hintergrundPointerUp"
   @pointercancel="pointerUp"
   @dblclick="zurücksetzen()"
  >
   <GrafikDefs />

   <!-- Ergebnisgrößen -->
   <g v-if="lastfall && lastfall.Ergebnis && graphicSettings.SICHTBARKEIT_SCHNITTGROESSEN">
    <ErgebnisKomponente
     v-for="erg in lastfall.Ergebnis.Stabergebnisse"
     :key="erg.Stab.Nummer"
     :ergebnis="erg"
     :werte="ergebnisliste(erg)"
     :transform="ansicht"
     :scaleSchnittgroesse="scaleSchnittgroesse"
     :einheit="getEinheit"
    />
   </g>

   <!-- Stäbe -->
   <g
    v-for="stab in system.Stabliste"
    :key="stab.Nummer"
   >
    <StabKomponente
     v-if="stab.istZeichenbar"
     :stab="stab"
     :transform="ansicht"
     @zeiger="stabZeiger"
     @verlassen="stabVerlassen"
    />
   </g>
   <!-- Lager -->
   <g
    v-for="knoten in system.Knotenliste"
    :key="knoten.Nummer"
   >
    <LagerKomponente
     v-if="knoten.Lager"
     :knoten="knoten"
     :transform="ansicht"
    />
   </g>

   <!-- Knoten -->
   <KnotenKomponente
    v-for="knoten in system.Knotenliste"
    :key="knoten.Nummer"
    :knoten="knoten"
    :transform="ansicht"
   />

   <!-- Lasten -->
   <g v-if="lastfall && graphicSettings.SICHTBARKEIT_LASTEN">
    <!-- Stablasten -->
    <g v-if="stablasten.length">
     <g
      v-for="stab in system.Stabliste"
      :key="stab.Nummer"
     >
      <StablastKomponente
       v-if="stab.istZeichenbar"
       :stab="stab"
       :lasten="stablasten.filter((stablast) => stablast.Stab === stab)"
       :transform="ansicht"
       :scaleLasten="scaleStablasten"
       :scaleVorverformungen="scaleVorverformungen"
      />
     </g>
    </g>

    <!-- Knotenlasten -->
    <g v-if="knotenlasten.length">
     <KnotenlastKomponente
      v-for="knoten in system.Knotenliste"
      :key="knoten.Nummer"
      :knoten="knoten"
      :lasten="knotenlasten.filter((knotenlast) => knotenlast.Knoten === knoten)"
      :transform="ansicht"
      :scaleLasten="scaleKnotenlasten"
     />
    </g>
   </g>

   <g v-if="lastfall && lastfall.Ergebnis">
    <!-- Lagerkräfte -->
    <g v-if="graphicSettings.SICHTBARKEIT_LAGERKRAEFTE">
     <LagerkraefteKomponente
      v-for="knoten in system.Knotenliste"
      :key="knoten.Nummer"
      :knoten="knoten"
      :transform="ansicht"
      :lagerreaktionen="lastfall.Ergebnis.Lagerkräfte"
     />
    </g>
    <!-- Verformtes System -->
    <g v-if="graphicSettings.SICHTBARKEIT_VERFORMUNG">
     <VerformungKomponente
      v-for="erg in lastfall.Ergebnis.Stabergebnisse"
      :key="erg.Stab.Nummer"
      :ergebnis="erg"
      :transform="ansicht"
      :scaleVerformung="scaleVerformung"
     />
    </g>
   </g>

   <!-- Eigenform der Stabilitätsuntersuchung -->
   <g v-if="lastfall && lastfall.Stabilität && graphicSettings.SICHTBARKEIT_EIGENFORM">
    <VerformungKomponente
     v-for="erg in lastfall.Stabilität.Eigenform"
     :key="erg.Stab.Nummer"
     :ergebnis="erg"
     :transform="ansicht"
     :scaleVerformung="80 * graphicSettings.SKALIERUNG_VERFORMUNGEN"
     farbe="rgb(230,120,0)"
     gestrichelt
    />
   </g>

   <!-- Wert an der Zeigerposition -->
   <g
    v-if="anzeige"
    data-kein-export
    style="pointer-events: none"
   >
    <circle
     :cx="anzeige.punkt.x"
     :cy="anzeige.punkt.z"
     r="5"
     fill="none"
     stroke="rgb(230,120,0)"
     stroke-width="2"
    />
   </g>
  </svg>

  <!-- Werteanzeige -->
  <div
   v-if="anzeige"
   class="werteanzeige"
   data-kein-export
  >
   <div class="werteanzeige-titel">Stab {{ anzeige.stab }} · x = {{ myRound(anzeige.x, 3) }} m</div>
   <table>
    <tr
     v-for="zeile in anzeige.zeilen"
     :key="zeile.name"
    >
     <td v-html="zeile.name"></td>
     <td class="zahl">{{ zeile.wert }}</td>
     <td v-html="zeile.einheit"></td>
    </tr>
   </table>
  </div>

  <!-- Ansicht zurücksetzen -->
  <v-btn
   class="ansicht-knopf"
   icon="mdi-fit-to-screen-outline"
   size="small"
   density="comfortable"
   title="Ansicht einpassen (Doppelklick)"
   @click="zurücksetzen()"
  />
 </div>
</template>

<script setup lang="ts">
 import { computed, ref } from "vue"
 import { useSystemStore } from "@/stores/SystemStore"
 import StabKomponente from "./grafikkomponenten/StabKomponente.vue"
 import StablastKomponente from "./grafikkomponenten/StablastKomponente.vue"
 import KnotenlastKomponente from "./grafikkomponenten/KnotenlastKomponente.vue"
 import KnotenKomponente from "./grafikkomponenten/KnotenKomponente.vue"
 import LagerkraefteKomponente from "./grafikkomponenten/LagerkraefteKomponente.vue"
 import LagerKomponente from "./grafikkomponenten/LagerKomponente.vue"
 import ErgebnisKomponente from "./grafikkomponenten/ErgebnisKomponente.vue"
 import VerformungKomponente from "./grafikkomponenten/VerformungKomponente.vue"
 import GrafikDefs from "./grafikkomponenten/GrafikDefs.vue"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import type Stab from "@/typescript/classes/Stab"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type { isStablast } from "@/typescript/classes/InterfaceStablast"
 import type { Stabergebnis } from "@/typescript/classes/Ergebnis"
 import { useViewport, bildpunkt } from "@/composables/useViewport"
 import { myRound } from "@/typescript/util"
 import type Vector from "@/typescript/classes/Vector"

 const props = defineProps<{
  lastfall: Lastfall
  ergebnisgroesse: number
 }>()

 const graphicSettings = useGraphicSettingsStore()
 const systemStore = useSystemStore()
 const system = computed(() => systemStore.system)
 const container = ref<HTMLElement | null>(null)

 const {
  breite,
  höhe,
  ansicht,
  zurücksetzen,
  pointerDown,
  pointerMove,
  pointerUp,
  wheel,
  warVerschiebung,
 } = useViewport(
  container,
  () => system.value.Knotenliste.map((k) => k.Koordinaten),
  () => graphicSettings.ABSTAND_GRAFIKRAND,
 )

 const stablasten = computed(() => props.lastfall.Lastquelle.Stablastliste as isStablast[])
 const knotenlasten = computed(() => props.lastfall.Lastquelle.Knotenlastliste)

 const getEinheit = computed(() => {
  switch (props.ergebnisgroesse) {
   case 0:
   case 1:
    return graphicSettings.EINHEIT_ERGEBNIS_KRAFT
   case 2:
    return graphicSettings.EINHEIT_ERGEBNIS_MOMENT
   case 3:
   case 4:
    return graphicSettings.EINHEIT_ERGEBNIS_LÄNGE
   default:
    return graphicSettings.EINHEIT_ERGEBNIS_WINKEL
  }
 })

 const GRÖSSEN = ["N", "V", "M", "ux", "uz", "phi"] as const
 function ergebnisliste(erg: Stabergebnis): number[] {
  return erg[GRÖSSEN[props.ergebnisgroesse] ?? "M"]
 }

 const scaleSchnittgroesse = computed(() => {
  let absMax = 0
  props.lastfall.Ergebnis?.Stabergebnisse.forEach((erg) => {
   ergebnisliste(erg).forEach((w) => (absMax = Math.max(absMax, Math.abs(w))))
  })
  return absMax === 0 ? 0 : (graphicSettings.SKALIERUNG_SCHNITTGROESSEN * 100) / absMax
 })

 const scaleVerformung = computed(() => {
  let max: number = 0
  props.lastfall.Ergebnis?.Stabergebnisse.forEach((erg) => {
   erg.ux.forEach((ux, i) => (max = Math.max(max, Math.hypot(ux, erg.uz[i]))))
  })
  return max === 0 ? 0 : (graphicSettings.SKALIERUNG_VERFORMUNGEN * 100) / max
 })

 const scaleStablasten = computed(() => {
  let max = 0
  props.lastfall.Lastquelle.StablastListeStreckenlast.forEach((last) => {
   max = Math.max(max, Math.abs(last.pl), Math.abs(last.pr))
  })
  return max === 0 ? 0 : (graphicSettings.SKALIERUNG_STABLASTEN * 60) / max
 })

 const scaleVorverformungen = computed(() => {
  let max = 0
  props.lastfall.Lastquelle.StablastListeVorverformung.forEach((last) => {
   if (!last.Stab || !last.Stab.Anfangsknoten || !last.Stab.Endknoten) return
   const L = last.Stab.Länge
   max = Math.max(max, Math.abs(last.phi0 * L), Math.abs(last.w0zuL * L))
  })
  return max === 0 ? 0 : (graphicSettings.SKALIERUNG_STABLASTEN * 60) / max
 })

 const scaleKnotenlasten = computed(() => {
  let max = 0
  props.lastfall.Lastquelle.Knotenlastliste.forEach((knotenlast) => {
   max = Math.max(max, ...knotenlast.Lastvektor.map(Math.abs))
  })
  return max === 0 ? 0 : (graphicSettings.SKALIERUNG_KNOTENLASTEN * 60) / max
 })

 //
 //Werte an beliebiger Stelle eines Stabes (Maus: Überfahren, Touch: Antippen)
 //
 const zeigerauswahl = ref<{ stab: Stab; x: number } | null>(null)
 let auswahlFest = false

 function stabZeiger(stab: Stab, e: PointerEvent) {
  if (e.type === "pointermove" && (e.pointerType !== "mouse" || e.buttons !== 0)) return
  const r = container.value!.getBoundingClientRect()
  const px = e.clientX - r.left
  const py = e.clientY - r.top
  const a = bildpunkt(
   ansicht.value,
   stab.Anfangsknoten!.Koordinaten.x,
   stab.Anfangsknoten!.Koordinaten.z,
  )
  const b = bildpunkt(ansicht.value, stab.Endknoten!.Koordinaten.x, stab.Endknoten!.Koordinaten.z)
  const dx = b.x - a.x
  const dz = b.z - a.z
  const t = Math.min(Math.max(((px - a.x) * dx + (py - a.z) * dz) / (dx * dx + dz * dz || 1), 0), 1)
  zeigerauswahl.value = { stab, x: t * stab.Länge }
  auswahlFest = e.type === "pointerdown" && e.pointerType !== "mouse"
 }

 function stabVerlassen() {
  if (!auswahlFest) zeigerauswahl.value = null
 }

 function hintergrundPointerDown(e: PointerEvent) {
  pointerDown(e)
 }

 function hintergrundPointerUp(e: PointerEvent) {
  pointerUp(e)
  //Tippen ins Leere schließt die Werteanzeige
  if (!warVerschiebung() && !(e.target as Element)?.classList?.contains("stab-trefferlinie")) {
   zeigerauswahl.value = null
   auswahlFest = false
  }
 }

 const einheiten = computed(() => [
  graphicSettings.EINHEIT_ERGEBNIS_KRAFT,
  graphicSettings.EINHEIT_ERGEBNIS_KRAFT,
  graphicSettings.EINHEIT_ERGEBNIS_MOMENT,
  graphicSettings.EINHEIT_ERGEBNIS_LÄNGE,
  graphicSettings.EINHEIT_ERGEBNIS_LÄNGE,
  graphicSettings.EINHEIT_ERGEBNIS_WINKEL,
 ])

 const anzeige = computed(() => {
  const auswahl = zeigerauswahl.value
  if (!auswahl || !props.lastfall.Ergebnis) return null
  const stab = auswahl.stab
  if (!system.value.Stabliste.includes(stab)) return null
  const werte = props.lastfall.stabwert(stab.Nummer, auswahl.x)
  const namen = ["N", "V", "M", "u<sub>x</sub>", "u<sub>z</sub>", "&phi;"]
  const nks = graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN
  const k = stab.Anfangsknoten!.Koordinaten
  const punkt: Vector = bildpunkt(ansicht.value, k.x, k.z).movePolar(
   auswahl.x * ansicht.value.scale,
   stab.Winkel,
  )
  return {
   stab: stab.Nummer,
   x: auswahl.x,
   punkt,
   zeilen: werte.map((w, i) => ({
    name: namen[i],
    wert: myRound(w * einheiten.value[i].vonSI, nks),
    einheit: einheiten.value[i].text,
   })),
  }
 })
</script>

<style>
 .grafik-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
 }
 .svg-content {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  user-select: none;
 }
 .werteanzeige {
  position: absolute;
  right: 8px;
  bottom: 8px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgb(230, 120, 0);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  pointer-events: none;
  text-align: left;
 }
 .werteanzeige td {
  border: none;
  width: auto;
  padding: 0 4px;
  text-align: left;
 }
 .werteanzeige td.zahl {
  text-align: right;
 }
 .werteanzeige-titel {
  font-weight: bold;
 }
 .ansicht-knopf {
  position: absolute !important;
  right: 8px;
  top: 8px;
 }
</style>
