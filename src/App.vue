<template>
 <WindowMain />
</template>

<script setup lang="ts">
 import WindowMain from "./components/WindowMain.vue"
 import { onBeforeUnmount, onMounted, toRaw, watch } from "vue"
 import { preloadSystem } from "./typescript/SystemPreload"
 import { useSystemStore } from "./stores/SystemStore"
 import { useSettingsStore } from "./stores/SettingsStore"
 import { useGraphicSettingsStore } from "./stores/GraphicSettingsStore"
 import { speicherdateiErstellen, speicherdateiLesen } from "./typescript/speicherformat"
 import { einstellungenÜbernehmen } from "./typescript/DateiFunktionen"

 const AUTOSAVE_SCHLÜSSEL = "stabwerksprogramm-autosave"
 const systemStore = useSystemStore()
 const settings = useSettingsStore()
 const graphicSettings = useGraphicSettingsStore()

 /**
  * Beim Start wird das zuletzt automatisch gesicherte System geladen (localStorage).
  * Ist keines vorhanden oder ist es defekt, wird das Startsystem vorgeladen.
  */
 function starten() {
  try {
   const text = window.localStorage.getItem(AUTOSAVE_SCHLÜSSEL)
   if (text) {
    const { system, datei } = speicherdateiLesen(text)
    einstellungenÜbernehmen(settings, datei.settings)
    einstellungenÜbernehmen(graphicSettings, datei.graphicSettings)
    if (system.Knotenliste.length || system.Stabliste.length) {
     systemStore.systemErsetzen(system)
     return
    }
   }
  } catch (e) {
   console.warn("Automatisch gesichertes System konnte nicht geladen werden:", e)
  }
  preloadSystem(7)
  systemStore.alsGespeichertMarkieren()
 }
 starten()

 //Automatisch sichern (verzögert, damit nicht bei jeder Eingabe geschrieben wird)
 let zeitgeber: ReturnType<typeof setTimeout> | null = null
 function autosave() {
  if (zeitgeber) clearTimeout(zeitgeber)
  zeitgeber = setTimeout(() => {
   try {
    window.localStorage.setItem(
     AUTOSAVE_SCHLÜSSEL,
     speicherdateiErstellen(toRaw(systemStore.system), settings.$state, graphicSettings.$state),
    )
   } catch (e) {
    console.warn("Automatisches Sichern nicht möglich:", e)
   }
  }, 800)
 }
 watch(
  [() => systemStore.system, () => systemStore.system.Revision, () => systemStore.änderungen],
  autosave,
 )

 /** Warnung beim Verlassen der Seite mit ungespeicherten Änderungen */
 function vorVerlassen(e: BeforeUnloadEvent) {
  if (!systemStore.ungespeichert) return
  e.preventDefault()
  e.returnValue = ""
 }
 onMounted(() => window.addEventListener("beforeunload", vorVerlassen))
 onBeforeUnmount(() => window.removeEventListener("beforeunload", vorVerlassen))
</script>
