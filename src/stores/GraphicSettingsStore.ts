import { defineStore } from "pinia"

export const useGraphicSettingsStore = defineStore("graphicSettingsStore", {
 state: () => ({
  //Liniendicken
  LINIENDICKE_GESTRICHELTELINIE: 2 as number,
  LINIENDICKE_STAB: 6 as number,
  //Farben
  FARBE_STAB: "rgb(0,0,0)" as string,
  FARBE_SCHNITTGROESSE_POSITIV: "rgb(0,0,255)" as string, //Zählt auch für ux uz und phi
  FARBE_SCHNITTGROESSE_NEVATIV: "rgb(255,0,0)" as string,
  FARBE_GESTRICHELTELINIE: "rgb(0,0,0)" as string,
  FARBE_VERFORMTESSYSTEM: "rgb(50,50,255)" as string,
  FARBE_STABLAST: "rgb(100,100,255)" as string,
  FARBE_LAGER: "rgb(100,150,100)",
  FARBE_LAGERKRAEFTE: "rgb(100,150,100)",
  //Abstände
  ABSTAND_GESTRICHELTELINIE: 8 as number, //Abstand der gestrichelten Linien zum Stab
  ABSTAND_TEXT: 15 as number, //Abstand des Textes von Ausgabepunkten (Schnittgrößen oder Verformung)
  ABSTAND_STABLAST: 30 as number,
  ABSTAND_KNOTENLAST: 30 as number,
  //Nachkommastellen
  NACHKOMMASTELLEN_SCHNITTGROESSEN: 6 as number,
  NACHKOMMASTELLEN_LASTWERTE: 2 as number,
  //Schriftgrößen
  SCHRIFTGROESSE_SCHNITTGROESSEN: 15 as number,
  SCHRIFTGROESSE_STABLAST: 15 as number,
  //DARSTELLUNGSSKALIERUNGEN
  SKALIERUNG_STABLASTEN: 1 as number,
  SKALIERUNG_VERFORMUNGEN: 1 as number,
  SKALIERUNG_SCHNITTGROESSEN: 1 as number,
  SKALIERUNG_KNOTENLASTEN: 1 as number,
 }),
})
