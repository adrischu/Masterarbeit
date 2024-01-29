import { defineStore } from "pinia"

export const useGraphicSettingsStore = defineStore("graphicSettingsStore", {
 state: () => ({
  STAB_DICKE: 8 as number,
  STAB_FARBE: "rgb(0,0,0)" as string,
  GESTRICHELTELINIE_ABSTAND: 10 as number,
  GESTRICHELTELINIE_FARBE: "rgb(0,0,0)" as string,
  GESTRICHELTELINIE_DICKE: 3 as number,
 }),
})
