import { toRaw } from "vue"
import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
import { useSettingsStore } from "@/stores/SettingsStore"
import { useSystemStore } from "@/stores/SystemStore"
import { speicherdateiErstellen, speicherdateiLesen } from "./speicherformat"

/**
 * Übernimmt nur bekannte Einstellungen aus einer Datei (statt den Store komplett zu ersetzen).
 * Zahlen werden als Zahlen übernommen (ältere Dateien enthielten teilweise Text).
 */
export function einstellungenÜbernehmen(
 store: { $state: Record<string, any>; $patch: (p: Record<string, any>) => void },
 werte: Record<string, any> | undefined,
): void {
 if (!werte || typeof werte !== "object") return
 const aktuell = store.$state
 const patch: Record<string, any> = {}
 Object.keys(aktuell).forEach((schlüssel) => {
  if (!(schlüssel in werte)) return
  const alt = aktuell[schlüssel]
  const neu = werte[schlüssel]
  if (typeof alt === "number") {
   const zahl = Number(neu)
   if (Number.isFinite(zahl)) patch[schlüssel] = zahl
  } else if (typeof alt === "boolean") {
   patch[schlüssel] = !!neu
  } else if (typeof alt === typeof neu) {
   patch[schlüssel] = neu
  }
 })
 store.$patch(patch)
}

/**Liest ein System aus einer Datei ein. Wirft bei ungültigen Dateien einen Fehler mit Erklärung. */
export async function systemAusDateiLaden(file: File): Promise<void> {
 const text = await file.text()
 const { system, datei, version } = speicherdateiLesen(text)
 const settings = useSettingsStore()
 einstellungenÜbernehmen(settings, datei.settings)
 //Alte Dateien: Umschaltung auf den kubischen Ansatz bei kleinen ε ist nicht mehr nötig
 if (version < 2) settings.minEpsilon = 0
 einstellungenÜbernehmen(useGraphicSettingsStore(), datei.graphicSettings)
 useSystemStore().systemErsetzen(system)
}

/** Funktion zum Speichern des Systems (Dateiformat Version 2, SI-Einheiten) */
export function saveSystemToFile(dateiname = "system.json") {
 const systemStore = useSystemStore()
 const jsonData = speicherdateiErstellen(
  toRaw(systemStore.system),
  useSettingsStore().$state,
  useGraphicSettingsStore().$state,
 )
 dateiHerunterladen(new Blob([jsonData], { type: "application/json" }), dateiname)
 systemStore.alsGespeichertMarkieren()
}

export function dateiHerunterladen(blob: Blob, dateiname: string) {
 const link = document.createElement("a")
 const url = window.URL.createObjectURL(blob)
 link.href = url
 link.download = dateiname
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** CSS-Eigenschaften, die beim Export in die SVG-Elemente geschrieben werden */
const EXPORT_STILE = [
 "fill",
 "fill-opacity",
 "stroke",
 "stroke-width",
 "stroke-dasharray",
 "stroke-opacity",
 "opacity",
 "font-size",
 "font-family",
 "font-weight",
 "text-anchor",
 "dominant-baseline",
 "visibility",
 "display",
]

/**
 * Erstellt eine eigenständige SVG-Datei der Grafik: mit xmlns, eingebetteten Stilen und ohne
 * Bedienelemente.
 */
export function grafikAlsSVGText(): string | null {
 const svg = document.getElementById("svg-komponente") as SVGSVGElement | null
 if (!svg) return null
 const kopie = svg.cloneNode(true) as SVGSVGElement
 //Berechnete Stile übertragen (Quelle und Kopie haben dieselbe Struktur)
 const quellen = [svg, ...Array.from(svg.querySelectorAll("*"))]
 const ziele = [kopie, ...Array.from(kopie.querySelectorAll("*"))]
 quellen.forEach((quelle, i) => {
  const ziel = ziele[i] as SVGElement
  const stil = window.getComputedStyle(quelle)
  EXPORT_STILE.forEach((name) => {
   const wert = stil.getPropertyValue(name)
   if (wert) ziel.style.setProperty(name, wert)
  })
 })
 kopie.querySelectorAll("[data-kein-export]").forEach((e) => e.remove())
 const breite = svg.clientWidth || Number(svg.getAttribute("width")) || 800
 const höhe = svg.clientHeight || Number(svg.getAttribute("height")) || 600
 kopie.setAttribute("xmlns", "http://www.w3.org/2000/svg")
 kopie.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
 kopie.setAttribute("width", String(breite))
 kopie.setAttribute("height", String(höhe))
 kopie.setAttribute("viewBox", `0 0 ${breite} ${höhe}`)
 //Weißer Hintergrund
 const hintergrund = document.createElementNS("http://www.w3.org/2000/svg", "rect")
 hintergrund.setAttribute("width", "100%")
 hintergrund.setAttribute("height", "100%")
 hintergrund.setAttribute("fill", "white")
 kopie.insertBefore(hintergrund, kopie.firstChild)
 return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(kopie)
}

export function alsSVGSpeichern() {
 const text = grafikAlsSVGText()
 if (!text) return
 dateiHerunterladen(new Blob([text], { type: "image/svg+xml;charset=utf-8" }), "statiksystem.svg")
}

/** Speichert die Grafik als PNG (2-fache Auflösung). */
export function alsPNGSpeichern(): Promise<void> {
 return new Promise((resolve, reject) => {
  const text = grafikAlsSVGText()
  const svg = document.getElementById("svg-komponente")
  if (!text || !svg) return resolve()
  const breite = svg.clientWidth
  const höhe = svg.clientHeight
  const faktor = 2
  const url = URL.createObjectURL(new Blob([text], { type: "image/svg+xml;charset=utf-8" }))
  const img = new Image()
  img.onload = () => {
   const canvas = document.createElement("canvas")
   canvas.width = breite * faktor
   canvas.height = höhe * faktor
   const context = canvas.getContext("2d")!
   context.fillStyle = "white"
   context.fillRect(0, 0, canvas.width, canvas.height)
   context.drawImage(img, 0, 0, canvas.width, canvas.height)
   URL.revokeObjectURL(url)
   canvas.toBlob((blob) => {
    if (blob) dateiHerunterladen(blob, "statiksystem.png")
    resolve()
   }, "image/png")
  }
  img.onerror = () => {
   URL.revokeObjectURL(url)
   reject(new Error("Die Grafik konnte nicht als PNG umgewandelt werden."))
  }
  img.src = url
 })
}

export function textDateiSpeichern(text: string, dateiname: string, typ = "text/plain") {
 //BOM, damit Excel Umlaute korrekt erkennt
 dateiHerunterladen(new Blob(["﻿" + text], { type: `${typ};charset=utf-8` }), dateiname)
}
