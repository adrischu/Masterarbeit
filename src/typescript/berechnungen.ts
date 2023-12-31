import type System from "./classes/System"
import { matMultiplyMat, matMultiplyVec, matTrans } from "./matrix"
import Balkenelement from "./classes/Balkenelement"
import Lastfall from "./classes/Lastfall"
import { gauss } from "./gauss"
import { Theorie } from "./enumerations"
//-------------------------------------------------------------------------------
export function startBerechnungen(system: System): void {
 console.log("Berechnungen werden gestartet.")
 ergebnisseLöschen(system)
 //Zählt Freiheitsgrade des Systems und stellt einen Vektor mit
 //nicht gehaltenen Freiheitsgraden auf.
 freiheitsgradeDefinieren(system)
 console.log(`Gesamte Freiheitsgrade: ${system.Freiheitsgrade}`)

 system.Lastfallliste.forEach((lastfall) => {
  elementeAufstellen(system, lastfall)

  lastvektorAufstellen(system, lastfall)
  console.log("\n\nLastvektor")
  console.table(matTrans(lastfall.Lastvektor))

  const iterationen: number = lastfall.Theorie === Theorie.Theorie_1 ? 1 : 2

  //Für Theorie 1 wird nur einmal iteriert,
  //für Theorie 2 wird mit den errechneten Normalkräften erneut berechnet.
  for (let i = 1; i <= iterationen; i++) {
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
  }
 })
}

//-------------------------------------------------------------------------------
function ergebnisseLöschen(system: System): void {
 system.Freiheitsgrade = 0
 system.Verformungsinzidenzen = []
 system.Lastfallliste.forEach((lastfall) => {
  lastfall.Elementliste = []
  lastfall.Verformungsvektor_kurz = []
  lastfall.Verformungsvektor_lang = []
  lastfall.Lastvektor = []
  lastfall.M_K_kurz = []
  lastfall.M_K_lang = []
 })
}

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

function elementeAufstellen(system: System, lastfall: Lastfall) {
 system.Stabliste.forEach((stab) => {
  lastfall.Elementliste.push(new Balkenelement(stab.Nummer, stab))
 })
}

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

function lastvektorAufstellen(system: System, lastfall: Lastfall) {
 const tempLastvektor: number[] = Array(system.Freiheitsgrade).fill(0)
 //Knotenlasten
 lastfall.Knotenlastliste.forEach((knotenlast) => {
  for (let i = 0; i <= 2; i++) {
   tempLastvektor[knotenlast.Knoten!.Inzidenzen[i]] += knotenlast.Lastvektor[i]
  }
 })

 //Stablasten
 lastfall.StablastListeStreckenlast.forEach((streckenlast) => {
  for (let i = 0; i <= 5; i++) {
   tempLastvektor[streckenlast.Stab!.Inzidenzen[i]] += streckenlast.Knotenersatzlasten[i]
  }
 })

 lastfall.Lastvektor = system.Verformungsinzidenzen.map((index) => tempLastvektor[index])
}

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
 })
}

function elementkräfteBestimmen(system: System, lastfall: Lastfall, theorie: Theorie) {
 //Kräfte auf Knotenverschiebungen
 lastfall.Elementliste.forEach((element) => {
  element.F = matMultiplyVec(element.k_lok(theorie), element.Verformungen)!
  console.log(`Stabendkräfte Stab ${element.Stab.Nummer}`)
  console.table(matTrans(element.F))
 })
}
