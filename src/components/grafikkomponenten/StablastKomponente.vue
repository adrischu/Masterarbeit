<template>
 <defs>
  <!-- A marker to be used as an arrowhead -->
  <marker
   id="arrowVert"
   viewBox="0 0 10 10"
   refX="5"
   refY="5"
   markerWidth="15"
   markerHeight="15"
   orient="auto-start-reverse"
   stroke="none"
   :fill="graphicSettings.FARBE_STABLAST"
  >
   <path d="M 0 0 L 10 5 L 0 10 z" />
  </marker>
 </defs>

 <g
  v-for="stablast in stablasten"
  :key="stablast.trapez.k1.x"
 >
  <!-- Weißes Polygon wird unterlegt, damit Farben besser sichtbar sind -->
  <polygon
   :points="`${stablast.trapez.k1.x},${stablast.trapez.k1.z} ${stablast.trapez.k2.x},${stablast.trapez.k2.z} ${stablast.trapez.k3.x},${stablast.trapez.k3.z} ${stablast.trapez.k4.x},${stablast.trapez.k4.z}`"
   stroke="none"
   fill="white"
   :opacity="0.3"
  />
  <!-- Farbiges Polygon -->
  <polygon
   :points="`${stablast.trapez.k1.x},${stablast.trapez.k1.z} ${stablast.trapez.k2.x},${stablast.trapez.k2.z} ${stablast.trapez.k3.x},${stablast.trapez.k3.z} ${stablast.trapez.k4.x},${stablast.trapez.k4.z}`"
   :stroke="graphicSettings.FARBE_STABLAST"
   :fill="graphicSettings.FARBE_STABLAST"
   fill-opacity="0.3"
   stroke-width="1"
  />

  <!-- Lastpfeile -->
  <line
   v-for="pfeil in stablast.pfeile"
   :key="pfeil.kp1.x"
   :x1="pfeil.kp1.x"
   :y1="pfeil.kp1.z"
   :x2="pfeil.kp2.x"
   :y2="pfeil.kp2.z"
   :stroke="graphicSettings.FARBE_STABLAST"
   marker-end="url(#arrowVert)"
  />

  <!-- Lastwerte -->
  <text
   v-for="text in stablast.texts"
   :key="text.value"
   text-anchor="middle"
   dominant-baseline="middle"
   :fill="graphicSettings.FARBE_STABLAST"
   :font-size="`${graphicSettings.SCHRIFTGROESSE_STABLAST}px`"
   :x="text.point.x"
   :y="text.point.z"
  >
   {{
    Math.round((text.value + Number.EPSILON) * 10 ** graphicSettings.NACHKOMMASTELLEN_LASTWERTE) /
    10 ** graphicSettings.NACHKOMMASTELLEN_LASTWERTE
   }}
  </text>
 </g>
</template>

<script setup lang="ts">
 import Vector from "@/typescript/classes/Vector"
 import { computed, ref, type Ref } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type StablastStreckenlast from "@/typescript/classes/StablastStreckenlast"
 import type Stab from "@/typescript/classes/Stab"
 import type { isStablast } from "@/typescript/classes/InterfaceStablast"

 const graphicSettings = useGraphicSettingsStore()

 const props = defineProps<{
  lasten: isStablast[]
  stab: Stab
  transform: { x: number; y: number; scale: number }
  scaleLasten: number
 }>()

 let anfang = computed(() => {
  return new Vector(
   props.stab.Anfangsknoten!.Koordinaten.x * props.transform.scale + props.transform.x,
   props.stab.Anfangsknoten!.Koordinaten.z * props.transform.scale + props.transform.y,
  )
 })

 let ende = computed(() => {
  return new Vector(
   props.stab.Endknoten!.Koordinaten.x * props.transform.scale + props.transform.x,
   props.stab.Endknoten!.Koordinaten.z * props.transform.scale + props.transform.y,
  )
 })

 //Berechnet Polygone jeweils zwischen zwei Ausgabepunkten.
 let stablasten = computed(() => {
  let stablasten: {
   trapez: { k1: Vector; k2: Vector; k3: Vector; k4: Vector }
   pfeile: { kp1: Vector; kp2: Vector }[]
   texts: { point: Vector; value: number }[]
  }[] = []
  const angle = props.stab.Stabvektor.direction
  //   const distance = Math.sqrt(
  //    (ende.value.x - anfang.value.x) ** 2 + (ende.value.z - anfang.value.z) ** 2,
  //   )

  let trapez: { k1: Vector; k2: Vector; k3: Vector; k4: Vector }
  let pfeile: { kp1: Vector; kp2: Vector }[] = []
  let texts: { point: Vector; value: number }[] = []

  let k1: Vector
  let k2: Vector
  let k3: Vector
  let k4: Vector

  //Sich überlappende Lasten werden nach oben verschoben, daher wird immer der oberste Punkt
  //eines Lasttyps gespeichert
  let unstack = [0, 0, 0]

  props.lasten.forEach((stablast, index) => {
   if (index === 0) {
    unstack = [0, 0, 0]
   }
   const last: StablastStreckenlast = stablast as StablastStreckenlast
   let dir: number = 0
   const min = Math.min(last.pl, last.pr, 0)
   const max = Math.max(last.pl, last.pr, 0)
   const diff = max - min
   //Für Lasten in x global projeziert
   if (last.Richtung === "x" && last.Koordinatensystem === "global" && last.Projektion) {
    dir = -Math.PI
    k1 = new Vector(Math.min(anfang.value.x, ende.value.x), anfang.value.z)
    k4 = new Vector(Math.min(anfang.value.x, ende.value.x), ende.value.z)
   }
   //Für Lasten in z global
   else if (last.Richtung === "z" && last.Koordinatensystem === "global" && last.Projektion) {
    dir = -Math.PI / 2
    k1 = new Vector(anfang.value.x, Math.min(anfang.value.z, ende.value.z))
    k4 = new Vector(ende.value.x, Math.min(anfang.value.z, ende.value.z))
   }
   //Für Lasten in x global nicht projeziert
   else if (last.Richtung === "x" && last.Koordinatensystem === "global" && !last.Projektion) {
    dir = -Math.PI
    k1 = new Vector(anfang.value.x, anfang.value.z)
    k4 = new Vector(ende.value.x, ende.value.z)
   }
   //Für Lasten in z global nicht projeziert
   else if (last.Richtung === "z" && last.Koordinatensystem === "global" && !last.Projektion) {
    dir = -Math.PI / 2
    k1 = new Vector(anfang.value.x, anfang.value.z)
    k4 = new Vector(ende.value.x, ende.value.z)
   }
   //Für Lasten in x|z lokal
   //Die Lasten in x lokal werden zur besseren Lesbarkeit ebenfalls senkrecht zum Stab dargestellt.
   else if (last.Koordinatensystem === "lokal") {
    dir = angle - Math.PI / 2
    k1 = anfang.value.copy()
    k4 = ende.value.copy()
   }

   //Basispunkte werden entlang ihrer Lastvektoren verschoben um das Trapez zu erstellen
   k1 = k1.movePolar(graphicSettings.ABSTAND_STABLAST - min * props.scaleLasten, dir)
   k4 = k4.movePolar(graphicSettings.ABSTAND_STABLAST - min * props.scaleLasten, dir)
   k2 = k1.movePolar(props.scaleLasten * last.pl, dir)
   k3 = k4.movePolar(props.scaleLasten * last.pr, dir)

   //Um grafische Überlappungen zu vermeiden, werden Lasttypen, die an der gleichen
   //Stelle angezeigt werden verschoben.
   //unstack[0]: Verschiebungsvektor für Lasten die projeziert global in x wirken
   //unstack[1]: Verscheibungsvektor für Lasten die projeziert global in z wirken
   //unstack[2]: Verschiebungsvektor für Lasten die auf der Stabachse liegen
   if (last.Richtung === "x" && last.Koordinatensystem === "global" && last.Projektion) {
    k1 = k1.movePolar(unstack[0], -Math.PI)
    k2 = k2.movePolar(unstack[0], -Math.PI)
    k3 = k3.movePolar(unstack[0], -Math.PI)
    k4 = k4.movePolar(unstack[0], -Math.PI)
    unstack[0] += graphicSettings.ABSTAND_STABLAST + diff * props.scaleLasten
   } else if (last.Richtung === "z" && last.Koordinatensystem === "global" && last.Projektion) {
    k1 = k1.movePolar(unstack[1], -Math.PI / 2)
    k2 = k2.movePolar(unstack[1], -Math.PI / 2)
    k3 = k3.movePolar(unstack[1], -Math.PI / 2)
    k4 = k4.movePolar(unstack[1], -Math.PI / 2)
    unstack[1] += graphicSettings.ABSTAND_STABLAST + diff * props.scaleLasten
   } else if (
    (last.Richtung === "x" && last.Koordinatensystem === "global" && !last.Projektion) ||
    (last.Richtung === "z" && last.Koordinatensystem === "global" && !last.Projektion) ||
    last.Koordinatensystem === "lokal"
   ) {
    k1 = k1.movePolar(unstack[2], angle - Math.PI / 2)
    k2 = k2.movePolar(unstack[2], angle - Math.PI / 2)
    k3 = k3.movePolar(unstack[2], angle - Math.PI / 2)
    k4 = k4.movePolar(unstack[2], angle - Math.PI / 2)
    unstack[2] += graphicSettings.ABSTAND_STABLAST + diff * props.scaleLasten
   }

   //Texte für Lastwerte
   //Wenn pl und pr gleich sind wird nur ein Lastwert angezeigt.
   if (last.pl === last.pr) {
    texts.push({
     point: new Vector((k2.x + k3.x) / 2, (k2.z + k3.z) / 2).movePolar(
      graphicSettings.ABSTAND_TEXT,
      dir,
     ),
     value: last.pl,
    })
   } else {
    texts.push({ point: k2.movePolar(graphicSettings.ABSTAND_TEXT, dir), value: last.pl })
    texts.push({ point: k3.movePolar(graphicSettings.ABSTAND_TEXT, dir), value: last.pr })
   }

   trapez = { k1: k1, k2: k2, k3: k3, k4: k4 }

   //Erstellen der Pfeile
   const nArrows = 5
   const dirOben: Vector = k3.copy()
   dirOben.subtract(k2)
   const dirUnten = k4.copy()
   dirUnten.subtract(k1)
   //Für Lasten lokal in x
   //Zur besseren Lesbarkeit wird entschieden Lasten in lokal x trotzdem räumlich zu zeichnen
   //und nicht entlang der Stabachse.
   //Die Pfeile werden dann jedoch in x Richtung gezeichnet.
   if (last.Koordinatensystem === "lokal" && last.Richtung === "x") {
    for (let i = 0; i < nArrows; i++) {
     const t = i / (nArrows - 1)
     const pt = last.pl + t * (last.pr - last.pl) //Lastwert am Punkt t
     if (pt !== 0) {
      let kPfeil1 = k1.moveAlongVector(dirUnten, t) //Anfangspunkt des Pfeiles
      let kPfeil2 = kPfeil1.moveAlongVector(dirUnten, 0.001 * Math.sign(pt)) //Endpunkt des Pfeiles

      pfeile.push({ kp1: kPfeil1, kp2: kPfeil2 })
     }
    }
   }
   //Für alle anderern Arten von Lasten
   else {
    for (let i = 0; i < nArrows; i++) {
     const t = i / (nArrows - 1)
     const pt = last.pl + t * (last.pr - last.pl) //Lastwert am Punkt t
     if (pt !== 0) {
      let kPfeil1 = k2.moveAlongVector(dirOben, t) //Anfangspunkt des Pfeiles
      let kPfeil2 = k1.moveAlongVector(dirUnten, t) //Endpunkt des Pfeiles

      pfeile.push({ kp1: kPfeil1, kp2: kPfeil2 })
     }
    }
   }
   stablasten.push({ trapez, pfeile, texts })
  })

  return stablasten
 })
</script>
