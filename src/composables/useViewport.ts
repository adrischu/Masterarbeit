import { computed, onBeforeUnmount, onMounted, ref, type Ref } from "vue"
import Vector from "@/typescript/classes/Vector"

/** Abbildung Systemkoordinaten [m] -> Bildschirmkoordinaten [px]: p = (x·scale + x0, z·scale + y0) */
export interface Ansicht {
 x: number
 y: number
 scale: number
}

/** Rechnet einen Systempunkt [m] in Bildschirmkoordinaten [px] um. */
export function bildpunkt(t: Ansicht, x: number, z: number): Vector {
 return new Vector(x * t.scale + t.x, z * t.scale + t.y)
}

/** Rechnet einen Bildschirmpunkt [px] in Systemkoordinaten [m] um. */
export function systempunkt(t: Ansicht, px: number, py: number): Vector {
 return new Vector((px - t.x) / t.scale, (py - t.y) / t.scale)
}

/**
 * Ansicht des Grafikfensters:
 * - passt das System in das Fenster ein (Rand in px)
 * - Zoom und Verschieben per Mausrad, Ziehen (Maus/Stift/1 Finger) und Pinch (2 Finger)
 * - Größenänderungen des Containers werden per ResizeObserver erkannt (auch beim Ziehen des Splitters)
 */
export function useViewport(
 container: Ref<HTMLElement | null>,
 punkte: () => { x: number; z: number }[],
 rand: () => number,
) {
 const breite = ref(0)
 const höhe = ref(0)
 const zoom = ref(1)
 const pan = ref({ x: 0, y: 0 })

 /** Einpassen des Systems ohne Zoom/Verschiebung */
 const grundansicht = computed<Ansicht>(() => {
  const liste = punkte()
  if (liste.length === 0) return { x: breite.value / 2, y: höhe.value / 2, scale: 1 }
  const xs = liste.map((p) => p.x)
  const zs = liste.map((p) => p.z)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minZ = Math.min(...zs)
  const maxZ = Math.max(...zs)
  //Rand auf kleinen Bildschirmen verkleinern
  const r = Math.min(rand(), 0.5 * Math.min(breite.value, höhe.value))
  const sx = maxX > minX ? (breite.value - r) / (maxX - minX) : Infinity
  const sz = maxZ > minZ ? (höhe.value - r) / (maxZ - minZ) : Infinity
  let scale = Math.min(sx, sz)
  if (!Number.isFinite(scale)) scale = 1
  scale = Math.max(1e-6, scale)
  return {
   x: (breite.value - (maxX + minX) * scale) / 2,
   y: (höhe.value - (maxZ + minZ) * scale) / 2,
   scale,
  }
 })

 const ansicht = computed<Ansicht>(() => ({
  x: grundansicht.value.x * zoom.value + pan.value.x,
  y: grundansicht.value.y * zoom.value + pan.value.y,
  scale: grundansicht.value.scale * zoom.value,
 }))

 /** Zoomt um den Bildschirmpunkt (cx, cy) */
 function zoomen(faktor: number, cx: number, cy: number) {
  const neu = Math.min(Math.max(zoom.value * faktor, 0.05), 200)
  const f = neu / zoom.value
  pan.value = { x: cx - f * (cx - pan.value.x), y: cy - f * (cy - pan.value.y) }
  zoom.value = neu
 }

 function verschieben(dx: number, dy: number) {
  pan.value = { x: pan.value.x + dx, y: pan.value.y + dy }
 }

 function zurücksetzen() {
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
 }

 //Zeiger (Maus, Stift, Finger) für Verschieben und Pinch-Zoom
 const zeiger = new Map<number, { x: number; y: number }>()
 let bewegt = false

 function position(e: PointerEvent | WheelEvent) {
  const r = container.value!.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
 }

 function pointerDown(e: PointerEvent) {
  zeiger.set(e.pointerId, position(e))
  bewegt = false
  ;(e.currentTarget as Element)?.setPointerCapture?.(e.pointerId)
 }

 function pointerMove(e: PointerEvent) {
  if (!zeiger.has(e.pointerId)) return
  const alt = zeiger.get(e.pointerId)!
  const neu = position(e)
  if (zeiger.size === 1) {
   if (Math.abs(neu.x - alt.x) + Math.abs(neu.y - alt.y) > 0) bewegt = true
   verschieben(neu.x - alt.x, neu.y - alt.y)
  } else if (zeiger.size === 2) {
   const [a, b] = [...zeiger.entries()].map(([id, p]) => (id === e.pointerId ? neu : p))
   const [a0, b0] = [...zeiger.values()]
   const d0 = Math.hypot(a0.x - b0.x, a0.y - b0.y)
   const d1 = Math.hypot(a.x - b.x, a.y - b.y)
   const m0 = { x: (a0.x + b0.x) / 2, y: (a0.y + b0.y) / 2 }
   const m1 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
   verschieben(m1.x - m0.x, m1.y - m0.y)
   if (d0 > 0) zoomen(d1 / d0, m1.x, m1.y)
   bewegt = true
  }
  zeiger.set(e.pointerId, neu)
 }

 function pointerUp(e: PointerEvent) {
  zeiger.delete(e.pointerId)
 }

 function wheel(e: WheelEvent) {
  e.preventDefault()
  const p = position(e)
  zoomen(Math.pow(1.0015, -e.deltaY), p.x, p.y)
 }

 /** true, wenn der letzte Zeigerkontakt eine Verschiebung war (kein Tippen) */
 const warVerschiebung = () => bewegt

 let beobachter: ResizeObserver | null = null
 function messen() {
  if (!container.value) return
  breite.value = container.value.clientWidth
  höhe.value = container.value.clientHeight
 }
 onMounted(() => {
  messen()
  if (typeof ResizeObserver !== "undefined" && container.value) {
   beobachter = new ResizeObserver(() => messen())
   beobachter.observe(container.value)
  } else {
   window.addEventListener("resize", messen)
  }
 })
 onBeforeUnmount(() => {
  beobachter?.disconnect()
  window.removeEventListener("resize", messen)
 })

 return {
  breite,
  höhe,
  ansicht,
  zoom,
  zurücksetzen,
  zoomen,
  pointerDown,
  pointerMove,
  pointerUp,
  wheel,
  warVerschiebung,
 }
}
