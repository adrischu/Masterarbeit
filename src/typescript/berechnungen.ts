import type System from "./classes/System"
import { matMultiplyMat, matMultiplyVec, matTrans } from "./matrix"
import Balkenelement from "./classes/Balkenelement"
import Lastfall from "./classes/Lastfall"
import { gauss } from "./gauss"
import { Theorie } from "./enumerations"
import type { isStablast } from "./classes/InterfaceStablast"
import Knotenlast from "./classes/Knotenlast"
//-------------------------------------------------------------------------------
/**
 * ### ABLAUF DER BERECHNUNGEN
 * - 1. Eventuell vorhandene Ergebnisarrays werden gelöscht.
 * - 2. Freiheitsgrade des Systems werden definiert (einmal alle und einmal nur nicht-gehaltene).
 * #### Punkte 3-6 werden für jeden Lastfall wiederholt:
 * - 3. Elemente werden aus den Stäben erstellt.
 * - 4. Wird bis zur Konvergenz wiederholt (Abbruchkriterium über maxIterationen und maxIterationsfehler).
 *    - 4.1 Lastvektor aufstellen.
 *    - 4.2 Globale Gesamtsteifigkeitsmatrix aufbauen.
 *    - 4.3 Randbedingungen einarbeiten (Zeilen und Spalten streichen).
 *    - 4.4 Gleichungssystem lösen (Gauss-Algorithmus).
 *    - 4.5 Stabendkräfte aus Verformungen rückrechnen (f = k * w).
 *    - 4.6 Fehler zu vergangener Iteration bestimmen (Euklidische Abstandsformel).
 * - 5. Schnittgrößen entlang des Stabes berechnen.
 * - 6. Lagerkräfte bestimmen (F = K * W).
 * @param system Systemobjekt.
 */
export function startBerechnungen(system: System): void {
 console.log("Berechnungen werden gestartet.")
 ergebnisseLöschen(system)
 freiheitsgradeDefinieren(system)
 console.log(`Gesamte Freiheitsgrade: ${system.Freiheitsgrade}`)

 system.Lastfallliste.forEach((lastfall) => {
  /**Maximale Anzahl an Iterationen */
  const maxIterationen: number = lastfall.Theorie === Theorie.Theorie_1 ? 1 : 50
  /**Maximal erlaubter Fehler zwischen Iterationen (Euklidische Abstandsformel) */
  const maxIterationsfehler: number = 10 ** -5
  /**Fehler zur letzten Iteration (euklidische Abstandsformel) */
  let iterationsFehler: number = maxIterationsfehler + 1 //Muss am Anfang größer als maxIterationsfehler sein
  /**Aktuelle Iteration */
  let iteration: number = 0

  elementeAufstellen(system, lastfall)

  do {
   iteration++

   lastvektorAufstellen(system, lastfall, lastfall.Theorie)
   console.log("\n\nLastvektor")
   console.table(matTrans(lastfall.Lastvektor))

   steifigkeitsmatrixAufstellen(system, lastfall, lastfall.Theorie)
   console.log("\n\nNicht-kondensierte Gesamtsteifigkeitsmatrix (Th1)")
   console.table(lastfall.M_K_lang)

   randbedingungenEinarbeiten(system, lastfall)
   console.log(`\n\nNicht-gehaltene Freiheitsgrade ${system.Verformungsinzidenzen}\n`)
   console.log("\n\nKondensierte Gesamtsteifigkeitsmatrix (Th1)")
   console.table(lastfall.M_K_kurz)

   gleichungssystemLösen(system, lastfall)
   console.log("\n\nVerformungsvektor")
   console.table(matTrans(lastfall.Verformungsvektor_kurz))
   elementkräfteBestimmen(system, lastfall, lastfall.Theorie)

   iterationsFehler = verformungsDifferenz(
    lastfall.Verformungsvektor_kurz,
    lastfall.letzerVerformungsvektor_kurz,
   )
   console.log("Absoluter Fehler in Iteration " + iteration + ": " + iterationsFehler)
   lastfall.letzerVerformungsvektor_kurz = lastfall.Verformungsvektor_kurz.slice()
  } while (iteration + 1 <= maxIterationen && iterationsFehler > maxIterationsfehler)

  //Gibt Fehlermeldung aus, wenn nach max Iterationen noch keine Konvergenz gefunden wurde.
  if (iteration === maxIterationen && iterationsFehler > maxIterationsfehler) {
   //TODO: Ordentliche Fehlerausgabe in Website implementieren.
   console.log("Es wurde nach " + iteration + " Iteration noch keine Konvergenz gefunden.")
  }

  schnittgrößenBestimmen(system, lastfall, lastfall.Theorie)
  lagerkräfteBestimmen(system, lastfall)
  lastfall.istBerechnet = true
 })
}
/**
 * ************************************************************************************
 * ************************************************************************************
 * FUNKTIONEN**************************************************************************
 * ************************************************************************************
 * ************************************************************************************
 */

/**
 * Setzt zur Fehlervermeidung Ergebnisarrays aus vergangenen Berechnungen gleich [ ].
 * @param system Systemobjekt
 */
export function ergebnisseLöschen(system: System): void {
 system.Freiheitsgrade = 0
 system.Verformungsinzidenzen = []
 system.Lastfallliste.forEach((lastfall) => {
  lastfall.Elementliste = []
  lastfall.Verformungsvektor_kurz = []
  lastfall.letzerVerformungsvektor_kurz = []
  lastfall.Verformungsvektor_lang = []
  lastfall.Lastvektor = []
  lastfall.M_K_kurz = []
  lastfall.M_K_lang = []
  lastfall.istBerechnet = false
 })
}

/**
 * Zählt alle Freiheitsgrade und stellt Vektor mit nicht-gehaltenen Freiheitsgraden auf.
 * @param system Systemobjekt
 */
function freiheitsgradeDefinieren(system: System): void {
 //Freiheitsgrade aus Knotenverformungen
 let freiheitsgrade: number = 0
 system.Knotenliste.forEach((knoten) => {
  for (let i = 0; i <= 2; i++) {
   knoten.Inzidenzen[i] = freiheitsgrade
   freiheitsgrade++
  }
 })

 //Zusätzliche Freiheitsgrade aus Gelenkdefinitionen
 //Zwei for Schleifen damit erst alle Gelenke vom Anfang und dann
 //alle Gelenk vom Ende hinzugefügt werden (um Struktur beizubehalten)
 system.Stabliste.forEach((stab) => {
  for (let i = 0; i <= 2; i++) {
   if (stab.Anfangsgelenk?.Gelenke[i]) {
    stab.Inzidenzen[i + 0] = freiheitsgrade
    freiheitsgrade++
   } else {
    stab.Inzidenzen[i + 0] = stab.Anfangsknoten!.Inzidenzen[i]
   }
  }
  for (let i = 0; i <= 2; i++) {
   if (stab.Endgelenk?.Gelenke[i]) {
    stab.Inzidenzen[i + 3] = freiheitsgrade
    freiheitsgrade++
   } else {
    stab.Inzidenzen[i + 3] = stab.Endknoten!.Inzidenzen[i]
   }
  }
 })
 system.Freiheitsgrade = freiheitsgrade

 //Nicht-gehaltene Inzidenzen aus Knotenverschiebungen
 //Falls ein Lager UND eine Feder vorhanden ist, wird die Knotenverschiebung als nicht-gehalten angesehen
 const verformungsInzidenzen: number[] = []
 system.Knotenliste.forEach((knoten) => {
  for (let i = 0; i <= 2; i++) {
   if (!(knoten.Lager!.Lagerung[i] && knoten.Lager?.Feder[i] === 0)) {
    verformungsInzidenzen.push(knoten.Inzidenzen[i])
   }
  }
 })

 //Nicht-gehaltene Inzidenzen aus Gelenkdefinitionen
 system.Stabliste.forEach((stab) => {
  for (let i = 0; i <= 2; i++) {
   if (stab.Anfangsgelenk?.Gelenke[i]) {
    verformungsInzidenzen.push(stab.Inzidenzen[i + 0])
   }
  }
  for (let i = 0; i <= 2; i++) {
   if (stab.Endgelenk?.Gelenke[i]) {
    verformungsInzidenzen.push(stab.Inzidenzen[i + 3])
   }
  }
 })
 system.Verformungsinzidenzen = verformungsInzidenzen
}

/**
 * Stellt für jeden Stab ein Balkenelement auf. Element wird mit zugehörigen Stablasten verknüpft.
 * @param system Systemobjekt.
 * @param lastfall Aktuelles Lastfallobjekt.
 */
function elementeAufstellen(system: System, lastfall: Lastfall) {
 //Alle Stablasten sammeln und beim Erstellen der Elemente diese den Stablasten zuordnen
 const stablasten: isStablast[] = []
 lastfall.StablastListeStreckenlast.forEach((last) => {
  stablasten.push(last)
 })

 system.Stabliste.forEach((stab) => {
  const neuesElement = new Balkenelement(stab.Nummer, stab)
  lastfall.Elementliste.push(neuesElement)

  //Neues Balkenelement wird allen zugehörigen Stablasten zugeordnet
  stablasten.forEach((stablast) => {
   if (stablast.Stab === stab) {
    stablast.Element = neuesElement
    neuesElement.Stablasten.push(stablast)
   }
  })
 })
}

/**
 * Stellt Lastvektor (nicht gehaltene Freiheitsgrade) auf aus:
 * - Knotenlasten
 * - Knotenersatzlasten aus Elementlasten
 * @param system Systemobjekt.
 * @param lastfall Aktuelles Lastfallobjekt.
 * @param theorie Berechnungstheorie.
 */
function lastvektorAufstellen(system: System, lastfall: Lastfall, theorie: Theorie) {
 const tempLastvektor: number[] = Array(system.Freiheitsgrade).fill(0)
 //Knotenlasten
 lastfall.Knotenlastliste.forEach((knotenlast) => {
  for (let i = 0; i <= 2; i++) {
   tempLastvektor[knotenlast.Knoten!.Inzidenzen[i]] += knotenlast.Lastvektor[i]
  }
 })

 //Knotenersatzlasten aus Stablasten
 lastfall.Elementliste.forEach((element) => {
  element.Stablasten.forEach((stablast) => {
   stablast.integrationskonstantenBestimmen(theorie)
   stablast.knotenersatzlastenBestimmen(theorie)
   console.log("Knotenersatzlasten")
   console.table(stablast.Knotenersatzlasten)
   stablast.Knotenersatzlasten.forEach((lastterm, index) => {
    tempLastvektor[element.Inzidenzen[index]] += lastterm
   })
  })
 })
 lastfall.Lastvektor = system.Verformungsinzidenzen.map((index) => tempLastvektor[index])
}

/**
 * Führt folgende Punkte aus:
 * - Stellt über Elementmatrizen die Globale Gesamtsteifigkeitsmatrix auf.
 * - Addiert Federkräfte zu den Steifigkeiten der jeweiligen Freiheitsgrade.
 * @param system Systemobjekt.
 * @param lastfall Aktuelles Lastfallobjekt.
 * @param theorie Berechnungstheorie
 */
function steifigkeitsmatrixAufstellen(system: System, lastfall: Lastfall, theorie: Theorie) {
 //Nicht-kondensierte Steifigkeitsmatrix  zu Nullmatrix initialisieren
 lastfall.M_K_lang = Array.from({ length: system.Freiheitsgrade }, () =>
  Array(system.Freiheitsgrade).fill(0),
 )

 lastfall.Elementliste.forEach((element) => {
  //Elemente der Elementsteifigkeitsmatrix zu Gesamtsteifigkeitsmatrix (unkondensiert) addieren
  for (let rows: number = 0; rows <= 5; rows++) {
   for (let cols: number = 0; cols <= 5; cols++) {
    lastfall.M_K_lang[element.Inzidenzen[rows]][element.Inzidenzen[cols]] +=
     element.k_glob(theorie)[rows][cols]
   }
  }
 })

 //Federkräfte addieren
 system.Knotenliste.forEach((knoten) => {
  for (let i = 0; i <= 2; i++) {
   if (knoten.Lager?.Lagerung[i] && knoten.Lager.Feder[i] !== 0) {
    lastfall.M_K_lang[knoten.Inzidenzen[i]][knoten.Inzidenzen[i]] += knoten.Lager.Feder[i]
   }
  }
 })
}

/**
 * Baut aus der nicht-kondensierten globalen Gesamtsteifigkeitsmatrix die kondensierte
 * Gesamtsteifigkeitsmatrix auf (nur nicht-gehaltene Freiheitsgrade).
 * @param system Systemobjekt.
 * @param lastfall Aktuelles Lastfallobjekt.
 */
function randbedingungenEinarbeiten(system: System, lastfall: Lastfall) {
 lastfall.M_K_kurz = Array.from({ length: system.Verformungsinzidenzen.length }, () =>
  Array(system.Verformungsinzidenzen.length).fill(0),
 )
 for (let row: number = 0; row < system.Verformungsinzidenzen.length; row++) {
  for (let col: number = 0; col < system.Verformungsinzidenzen.length; col++) {
   lastfall.M_K_kurz[row][col] =
    lastfall.M_K_lang![system.Verformungsinzidenzen[row]][system.Verformungsinzidenzen[col]]
  }
 }
}

/**
 * Führt folgende Schritte aus:
 * - Löst F = K * W mit dem Gauss-Algorithmus.
 * - Erstellt aus Ergebnis den Verformungsvektor (alle Freiheitsgrade).
 * - Weist den Stäben die Stabendverformungen zu.
 * - Transformiert diese Verformungen in die jeweiligen lokalen Systeme.
 * @param system Systemobjekt.
 * @param lastfall Aktuelles Lastfallobjekt.
 */
function gleichungssystemLösen(system: System, lastfall: Lastfall) {
 //Da der Lastvektor in der Funktion gauss zum Verformungsvektor
 //umgeformt wird, werden diese beiden hier gleichgesetzt.
 lastfall.Verformungsvektor_kurz = lastfall.Lastvektor.slice()
 if (
  gauss(
   system.Verformungsinzidenzen.length,
   lastfall.M_K_kurz.map((row) => [...row]),
   lastfall.Verformungsvektor_kurz,
  )
 ) {
  console.log("Singuläre Steifigkeitsmatrix")
 }

 //Verformungsvektor auffüllen (mit Nullen)
 lastfall.Verformungsvektor_lang = Array(system.Freiheitsgrade).fill(0)
 system.Verformungsinzidenzen.forEach((inz, index) => {
  lastfall.Verformungsvektor_lang[inz] = lastfall.Verformungsvektor_kurz[index]
 })

 //Verformungen den Einzelnen Stäben zuweisen
 lastfall.Elementliste.forEach((element) => {
  for (let i = 0; i < 6; i++) {
   element.Verformungen[i] = lastfall.Verformungsvektor_lang[element.Inzidenzen[i]]
  }
  //Elementverformungen ins lokale System transformieren
  element.Verformungen = matMultiplyVec(element.T, element.Verformungen)!
 })
}

/**
 * Ermittelt aus den Stabendverformungen die Stabendkräfte.
 * @param system Systemobjekt.
 * @param lastfall Aktuelles Lastfallobjekt.
 * @param theorie Berechnungstheorie.
 */
function elementkräfteBestimmen(system: System, lastfall: Lastfall, theorie: Theorie) {
 lastfall.Elementliste.forEach((element) => {
  //StabendKräfte aus Knotenverschiebungen ermitteln
  element.F = matMultiplyVec(element.k_lok(theorie), element.Verformungen)!
  //Knotenersatzlasten aus Stablasten abziehen
  //Knotenersatzlasten müssen erst ins lokale System transformiert werden.
  element.Stablasten.forEach((stablast) => {
   matMultiplyVec(element.T, stablast.Knotenersatzlasten)!.forEach((lastterm, index) => {
    element.F[index] -= lastterm
   })
  })
  console.log(`Stabendkräfte Stab ${element.Stab.Nummer}`)
  console.table(matTrans(element.F))
 })
}

/**
 * Berechnet die Verformungsdifferenz zur letzten Iteration nach der euklidischen Abstandsformel.
 * @param u Verformungsvektor aus der aktuellen Iteration.
 * @param u_last Verformungsvektor aus der letzten Iteration.
 *
 * @returns {number} Fehler Epsilon
 */
function verformungsDifferenz(u: number[], u_last: number[]): number {
 let zaehler = 0
 let nenner = 0
 let fehler_eps = 0
 const freiheitsgrade = u.length

 if (u_last.length === 0) u_last = Array(freiheitsgrade).fill(0) //Für erste Iteration ist noch kein Verformungsvektor bekannt

 for (let i = 0; i < freiheitsgrade; i++) {
  zaehler += (u[i] - u_last[i]) ** 2
  nenner += u[i] ** 2
 }
 zaehler = Math.sqrt(zaehler)
 nenner = Math.sqrt(nenner)
 if (nenner === 0) {
  fehler_eps = 0
 } else {
  fehler_eps = zaehler / nenner
 }
 return fehler_eps
}

/**
 * Berechnet für jeden Stab die Ausgabegrößen über die Stabachse.
 * @param system Systemobjekt.
 * @param lastfall Aktuelles Lastfallobjekt.
 * @param theorie Berechnungstheorie.
 */
function schnittgrößenBestimmen(system: System, lastfall: Lastfall, theorie: Theorie) {
 lastfall.Elementliste.forEach((element) => {
  element.AusgabepunkteBerechnen(theorie)
 })
}

/**
 * Berechnet über F=K*W die Lagerkräfte.
 * @param system Systemobjekt.
 * @param lastfall Aktuelles Lastfallobjekt.
 */
function lagerkräfteBestimmen(system: System, lastfall: Lastfall) {
 lastfall.Lagerkräfte = Array(system.Freiheitsgrade).fill(0)

 //Gleichgewicht am Knoten durchführen
 //Kräfte aus Stabenden
 lastfall.Elementliste.forEach((element) => {
  const kräfte_global = matMultiplyVec(matTrans(element.T), element.F)!
  for (let i = 0; i <= 5; i++) {
   lastfall.Lagerkräfte[element.Inzidenzen[i]] -= kräfte_global[i]
  }
 })
 //Kräfte aus Knotenlasten
 lastfall.Knotenlastliste.forEach((knotenlast) => {
  for (let i = 0; i <= 2; i++) {
   lastfall.Lagerkräfte[knotenlast.Knoten?.Inzidenzen[i]!] += knotenlast.Lastvektor[i]
  }
 })
 console.log("Lagerkräfte")
 console.table(lastfall.Lagerkräfte)
}
