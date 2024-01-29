import { defineStore } from "pinia"

export const useGraphicSettingsStore = defineStore("graphicSettingsStore", {
 state: () => ({
  //Liniendicken
  LINIENDICKE_GESTRICHELTELINIE: 3 as number,
  LINIENDICKE_STAB: 8 as number,
  //Farben
  FARBE_STAB: "rgb(0,0,0)" as string,
  FARBE_SCHNITTGROESSE_POSITIV: "rgb(0,0,255)" as string,
  FARBE_SCHNITTGROESSE_NEVATIV: "rgb(255,0,0)" as string,
  FARBE_GESTRICHELTELINIE: "rgb(0,0,0)" as string,
  FARBE_VERFORMTESSYSTEM: "rgb(50,50,255)" as string,
  //Abstände
  ABSTAND_GESTRICHELTELINIE: 10 as number,
 }),
})
