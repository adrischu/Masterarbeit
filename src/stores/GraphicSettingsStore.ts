import { defineStore } from "pinia"
import { useEinheitenStore } from "./EinheitenStore"

/**
 * In diesem Speicher befinden sich Variablen, die die grafische Darstellung des Systems steuern.
 * Hierzu gehören:
 * - Liniendicken
 * - Farben
 * - Abstände
 * - Schrifteinstellungen
 * - Nachkommastellen
 * - Skalierungsfaktoren
 */
export const useGraphicSettingsStore = defineStore("graphicSettingsStore", {
 state: () => ({
  //Liniendicken
  LINIENDICKE_GESTRICHELTELINIE: 2 as number,
  LINIENDICKE_STAB: 6 as number,
  LINIENDICKE_GELENK: 1.5 as number,
  //Werte für gestrichelte Linien
  //Erster Wert ist Strichlänge (px) Zweiter Wert ist Abstand zwischen den Strichen
  GESTRICHELT_VORVERFORMUNG: "3,2" as string,
  GESTRICHELT_GESTRICHELTELINIE: "10,10" as string,
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
  /**Dieser Abstand in px wird mindestens zwischen System und Fensterrand eingehalten. */
  ABSTAND_GRAFIKRAND: 250 as number,
  //Nachkommastellen
  NACHKOMMASTELLEN_SCHNITTGROESSEN: 4 as number,
  NACHKOMMASTELLEN_LASTWERTE: 2 as number,
  NACHKOMMASTELLEN_MATRIZEN: 1 as number,
  //Schriftgrößen
  SCHRIFTGROESSE_SCHNITTGROESSEN: 15 as number,
  SCHRIFTGROESSE_STABLAST: 15 as number,
  //DARSTELLUNGSSKALIERUNGEN
  SKALIERUNG_STABLASTEN: 1 as number,
  SKALIERUNG_VERFORMUNGEN: 1 as number,
  SKALIERUNG_SCHNITTGROESSEN: 1 as number,
  SKALIERUNG_KNOTENLASTEN: 1 as number,

  RADIUS_KNOTEN: 4 as number,
  RADIUS_GELENK: 8 as number,

  //EINHEITENANZEIGE
  EINHEIT_SHOW: true,
  EINHEIT_ERGEBNIS_KRAFT: useEinheitenStore().kN,
  EINHEIT_ERGEBNIS_MOMENT: useEinheitenStore().kNm,
  EINHEIT_ERGEBNIS_LÄNGE: useEinheitenStore().mm,
  EINHEIT_ERGEBNIS_WINKEL: useEinheitenStore().mrad,
  EINHEIT_LASTEN_KRAFT: useEinheitenStore().kN,
  EINHEIT_LASTEN_STRECKENLAST: useEinheitenStore().kN_m,
 }),
})
