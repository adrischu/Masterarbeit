<template>
 <defs>
  <!-- A marker to be used as an arrowhead -->
  <marker
   id="arrowVert"
   viewBox="0 0 10 10"
   refX="10"
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

 <!-- Ausgabe der Trapezlasten -->
 <g v-if="trapezlasten.length">
  <g
   v-for="trapezlast in trapezlasten"
   :key="trapezlast.key"
  >
   <!-- Weißes Polygon wird unterlegt, damit Farben besser sichtbar sind -->
   <polygon
    :points="`${trapezlast.trapez.k1.x},${trapezlast.trapez.k1.z} ${trapezlast.trapez.k2.x},${trapezlast.trapez.k2.z} ${trapezlast.trapez.k3.x},${trapezlast.trapez.k3.z} ${trapezlast.trapez.k4.x},${trapezlast.trapez.k4.z}`"
    stroke="none"
    fill="white"
    :opacity="0.3"
   />
   <!-- Farbiges Polygon -->
   <polygon
    :points="`${trapezlast.trapez.k1.x},${trapezlast.trapez.k1.z} ${trapezlast.trapez.k2.x},${trapezlast.trapez.k2.z} ${trapezlast.trapez.k3.x},${trapezlast.trapez.k3.z} ${trapezlast.trapez.k4.x},${trapezlast.trapez.k4.z}`"
    :stroke="graphicSettings.FARBE_STABLAST"
    :fill="graphicSettings.FARBE_STABLAST"
    fill-opacity="0.3"
    stroke-width="1"
   />

   <!-- Lastpfeile -->
   <line
    v-for="pfeil in trapezlast.pfeile"
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
    v-for="text in trapezlast.texts"
    :key="text.value"
    text-anchor="middle"
    dominant-baseline="middle"
    :fill="graphicSettings.FARBE_STABLAST"
    :font-size="`${graphicSettings.SCHRIFTGROESSE_STABLAST}px`"
    :x="text.point.x"
    :y="text.point.z"
   >
    {{
     Math.round(
      (einheitStreck.vonSI * text.value + Number.EPSILON) *
       10 ** graphicSettings.NACHKOMMASTELLEN_LASTWERTE,
     ) /
     10 ** graphicSettings.NACHKOMMASTELLEN_LASTWERTE
    }}{{ graphicSettings.EINHEIT_SHOW ? einheitStreck.text : "" }}
   </text>
  </g>
 </g>

 <!-- Ausgabe der Vorverformungen -->
 <g v-if="vorverformungen.length">
  <g
   v-for="vorverformung in vorverformungen"
   :key="vorverformung.key"
  >
   <!-- Gesamtkurve -->
   <polyline
    :points="vorverformung.totalCurve"
    :stroke="graphicSettings.FARBE_STABLAST"
    fill="none"
   />
   <!-- Nur gerade Linie aus phi0 -->
   <polyline
    v-if="vorverformung.straightLine"
    :points="vorverformung.straightLine"
    :stroke="graphicSettings.FARBE_STABLAST"
    fill="none"
    :stroke-dasharray="graphicSettings.GESTRICHELT_VORVERFORMUNG"
   />
   <!-- Linie für Stich in der Mitte (nur w0/L) -->
   <polyline
    v-if="vorverformung.middleLine"
    :points="vorverformung.middleLine"
    :stroke="graphicSettings.FARBE_STABLAST"
    fill="none"
    :stroke-dasharray="graphicSettings.GESTRICHELT_VORVERFORMUNG"
   />
   <!-- Linie für Stich am Ende (nur Phi0) -->
   <polyline
    v-if="vorverformung.endLine"
    :points="vorverformung.endLine"
    :stroke="graphicSettings.FARBE_STABLAST"
    fill="none"
    :stroke-dasharray="graphicSettings.GESTRICHELT_VORVERFORMUNG"
   />
   <!-- Text für Vorkrümmung -->
   <text
    v-if="vorverformung.textVorkruemmung"
    text-anchor="middle"
    dominant-baseline="middle"
    :fill="graphicSettings.FARBE_STABLAST"
    :font-size="`${graphicSettings.SCHRIFTGROESSE_STABLAST}px`"
    :x="vorverformung.textVorkruemmung!.point.x"
    :y="vorverformung.textVorkruemmung!.point.z"
    >{{ vorverformung.textVorkruemmung!.text }}</text
   >
   <!-- Text für Schiefstellung -->
   <text
    v-if="vorverformung.textSchiefstellung"
    text-anchor="middle"
    dominant-baseline="middle"
    :fill="graphicSettings.FARBE_STABLAST"
    :font-size="`${graphicSettings.SCHRIFTGROESSE_STABLAST}px`"
    :x="vorverformung.textSchiefstellung!.point.x"
    :y="vorverformung.textSchiefstellung!.point.z"
    >{{ vorverformung.textSchiefstellung!.text }}</text
   >
  </g>
 </g>
</template>

<script setup lang="ts">
 import Vector from "@/typescript/classes/Vector"
 import { computed } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type StablastStreckenlast from "@/typescript/classes/StablastStreckenlast"
 import type Stab from "@/typescript/classes/Stab"
 import type { isStablast } from "@/typescript/classes/InterfaceStablast"
 import type StablastVorverformung from "@/typescript/classes/StablastVorverformung"
 import type { isEinheit } from "@/typescript/classes/InterfaceEinheit"

 const graphicSettings = useGraphicSettingsStore()

 const einheitStreck: isEinheit = useGraphicSettingsStore().EINHEIT_LASTEN_STRECKENLAST
 //const einheitVorv:isEinheit = useGraphicSettingsStore().EINHEIT_LASTEN_VORVERFORMUNG

 const props = defineProps<{
  lasten: isStablast[]
  stab: Stab
  transform: { x: number; y: number; scale: number }
  scaleLasten: number
  scaleVorverformungen: number
 }>()

 /**Anfangspunkt des Stabes im KS des Grafikfensters */
 let anfang = computed(() => {
  return new Vector(
   props.stab.Anfangsknoten!.Koordinaten.x * props.transform.scale + props.transform.x,
   props.stab.Anfangsknoten!.Koordinaten.z * props.transform.scale + props.transform.y,
  )
 })

 /**Endpunkt des Stabes im KS des Grafikfensters */
 let ende = computed(() => {
  return new Vector(
   props.stab.Endknoten!.Koordinaten.x * props.transform.scale + props.transform.x,
   props.stab.Endknoten!.Koordinaten.z * props.transform.scale + props.transform.y,
  )
 })

 //Berechnung Ausgabeformen für Trapezlast
 //Berechnet Polygone jeweils zwischen zwei Ausgabepunkten.
 let trapezlasten = computed(() => {
  let trapezlasten: {
   trapez: { k1: Vector; k2: Vector; k3: Vector; k4: Vector }
   pfeile: { kp1: Vector; kp2: Vector }[]
   texts: { point: Vector; value: number }[]
   key: string
  }[] = []
  const angle = props.stab.Stabvektor.direction
  //   const distance = Math.sqrt(
  //    (ende.value.x - anfang.value.x) ** 2 + (ende.value.z - anfang.value.z) ** 2,
  //   )

  let trapez: { k1: Vector; k2: Vector; k3: Vector; k4: Vector }
  let pfeile: { kp1: Vector; kp2: Vector }[] = []
  let texts: { point: Vector; value: number }[] = []
  let key: string

  let k1: Vector
  let k2: Vector
  let k3: Vector
  let k4: Vector

  //Sich überlappende Lasten werden nach oben verschoben, daher wird immer der oberste Punkt
  //eines Lasttyps gespeichert
  let unstack = [0, 0, 0]

  //Durchläuft alle Trapezlast
  props.lasten
   .filter((stablast) => stablast.Typ === "StablastStreckenlast")
   .forEach((stablast, index) => {
    if (index === 0) {
     unstack = [0, 0, 0]
    }
    const last: StablastStreckenlast = stablast as StablastStreckenlast
    /**Individueller Key für "v-for" Vue-Komponente */
    key = last.Stab?.Nummer + "_" + last.Nummer
    /**Variable für Zeichenrichtung einer Linie */
    let dir: number = 0
    /**Minimaler Lastwert */
    const min = Math.min(last.pl, last.pr, 0)
    /**Maximaler Lastwert */
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
    trapezlasten.push({ trapez, pfeile, texts, key })
   })
  return trapezlasten
 })

 /**
  * Ermittelt die Form für die Grafikausgabe der Vorverformungen.
  */
 let vorverformungen = computed(() => {
  const angle = props.stab.Stabvektor.direction
  const vorverformungen: {
   totalCurve: string
   straightLine: string
   middleLine: string
   endLine: string
   textVorkruemmung: { point: Vector; text: string } | null
   textSchiefstellung: { point: Vector; text: string } | null
   key: string
  }[] = []

  //Durchläuft alle Vorverformungen
  props.lasten
   .filter((stablast) => stablast.Typ === "StablastVorverformung")
   .forEach((stablast) => {
    const vorverformung = stablast as StablastVorverformung
    /**Kurve die aus phi0 und w0/L entsteht */
    let totalCurve: string = ""
    /**Kurve die nur aus phi0 entsteht */
    let straightLine: string = ""
    /**Kurve die in der Mitte den Stich durch w0/L anzeigt */
    let middleLine: string = ""
    /**Kurve die den Endstich durch phi0 anzeigt. */
    let endLine: string = ""
    /**Stelle und anzuzeigender Text für die Vorkrümmung */
    let textVorkruemmung: { point: Vector; text: string } | null = null
    /**Stelle und anzuzeigender Text für die Schiefstelluug */
    let textSchiefstellung: { point: Vector; text: string } | null = null

    /**Individueller Key für "v-for" Vue-Komponente */
    const key: string = stablast.Stab!.Nummer + "_" + stablast.Nummer
    const L = stablast.Stab!.Länge
    /**Stich in Stabmitte */
    const wM = vorverformung.w0zuL * L + 0.5 * vorverformung.phi0 * L
    /**Stich am Stabende */
    const wE = vorverformung.phi0 * L
    /**Stabvektor im KS des Grafikfensters */
    const stabvektor: Vector = ende.value.copy()
    stabvektor.subtract(anfang.value)

    //Nachfolgend wird die Vorverformungslinie durch 10 Punkte angenähert.
    //nPunkte muss ungerade sein, damit der Strich für den Stich in der Mitte liegt.
    const nPunkte = 21
    for (let i = 0; i < nPunkte; i++) {
     const t = i / (nPunkte - 1)
     const x = t * L
     //Nachfolgende Formel wurde gelöst für:
     //Ansatz: y(x) = A*x^2 + B*x + C
     //Randbedingungen: f(0)=0 | f(L/2)=wM | f(L)=wE
     const y = (x / L) ** 2 * (2 * wE - 4 * wM) + (x / L) * (-wE + 4 * wM)
     const curvePoint = anfang.value
      .moveAlongVector(stabvektor, t)
      .movePolar(y * props.scaleVorverformungen, angle + Math.PI / 2)

     if (i === 0) {
      totalCurve = `${curvePoint.x},${curvePoint.z}`
     } else {
      totalCurve = totalCurve.concat(" ", `${curvePoint.x},${curvePoint.z}`)
     }

     //Nachfolgende Schleife ermittelt die gestrichelte Linie, die den Stich
     //in der Mitte darstellt.
     //Muss nur angezeigt werden wenn auch eine Verkrümmung vorhanden ist.
     if (vorverformung.w0zuL && i === (nPunkte - 1) / 2) {
      const yphi0 = 0.5 * vorverformung.phi0 * L
      const lineMiddle = anfang.value
       .moveAlongVector(stabvektor, t)
       .movePolar(yphi0 * props.scaleVorverformungen, angle + Math.PI / 2)
      middleLine = `${lineMiddle.x},${lineMiddle.z} ${curvePoint.x},${curvePoint.z}`
      textVorkruemmung = {
       point: curvePoint,
       text: `w0/L=${vorverformung.w0zuL}`,
      }
     }

     //Nachfolgende Schleife ermittelt die gestrichelte Linie die nur durch ph0 entsteht
     //Muss nur angezeigt werden wenn auch eine Verkrümmung vorhanden ist.
     if (vorverformung.w0zuL && i === nPunkte - 1) {
      straightLine = `${anfang.value.x},${anfang.value.z} ${curvePoint.x},${curvePoint.z}`
     }
     //Nachfolgende Schleife ermittelt die Linie für den Endstich
     //Muss nur angezeigt werden wenn auch eine Verdrehung da ist.
     if (vorverformung.phi0 && i === nPunkte - 1) {
      endLine = `${ende.value.x},${ende.value.z} ${curvePoint.x},${curvePoint.z}`
      textSchiefstellung = {
       point: curvePoint,
       text: `ϕ0=${vorverformung.w0zuL}`,
      }
     }
    }
    vorverformungen.push({
     totalCurve,
     straightLine,
     middleLine,
     endLine,
     textVorkruemmung,
     textSchiefstellung,
     key,
    })
   })
  return vorverformungen
 })
</script>
