import { defineStore } from "pinia"

export const useGraphicSettingsStore = defineStore("graphicSettingsStore", {
 state: () => ({
  //Liniendicken
  LINIENDICKE_GESTRICHELTELINIE: 3 as number,
  LINIENDICKE_STAB: 8 as number,
  //Farben
  FARBE_STAB: "rgb(0,0,0)" as string,
  FARBE_SCHNITTGROESSE_POSITIV: "rgb(0,0,255)" as string, //Zählt auch für ux uz und phi
  FARBE_SCHNITTGROESSE_NEVATIV: "rgb(255,0,0)" as string,
  FARBE_GESTRICHELTELINIE: "rgb(0,0,0)" as string,
  FARBE_VERFORMTESSYSTEM: "rgb(50,50,255)" as string,
  FARBE_STABLAST: "rgb(100,100,255)" as string,
  //Abstände
  ABSTAND_GESTRICHELTELINIE: 10 as number, //Abstand der gestrichelten Linien zum Stab
  ABSTAND_TEXT: 15 as number, //Abstand des Textes von Ausgabepunkten (Schnittgrößen oder Verformung)
  ABSTAND_STABLAST: 30 as number,
  //Nachkommastellen
  NACHKOMMASTELLEN_SCHNITTGROESSEN: 2 as number,
  //Schriftgrößen
  SCHRIFTGROESSE_SCHNITTGROESSEN: 15 as number,
 }),
})
