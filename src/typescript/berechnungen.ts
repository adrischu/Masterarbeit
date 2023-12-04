import type System from "./classes/System"
import Knoten from "./classes/Knoten"
import type Lager from "./classes/Lager"
import type Querschnitt from "./classes/Querschnitt"
import type Material from "./classes/Material"
import { matMultiply, matAdd, matTrans, matSub } from "./matrix"
import Lastfall from "./classes/Lastfall"
import { gauss } from "./gauss"

export function startBerechnungen(system: System): void {
 console.log("Berechnungen werden gestartet.")

 freiheitsgradeDefinieren(system)
 console.log(`Gesamte Freiheitsgrade: ${system.Freiheitsgrade}`)

 steifigkeitsmatrixAufstellen(system)
 console.log("Nicht-kondensierte Gesamtsteifigkeitsmatrix (Th1)")
 console.table(system.M_K_lang)

 randbedingungenEinarbeiten(system)
 console.log(`Nicht-gehaltene Freiheitsgrade ${system.Verformungsinzidenzen}`)
 console.log("\n")
 console.log("Kondensierte Gesamtsteifigkeitsmatrix (Th1)")
 console.table(system.M_Kkurz)

 system.Lastfallliste.forEach((lastfall) => {
  lastvektorAufstellen(system, lastfall)
  gleichungssystemLösen(system, lastfall)
 })

 console.log("\n")
 console.log("Lastvektor")
 console.table(matTrans(system.Lastfallliste[0].Lastvektor))
 console.table(matTrans(system.Lastfallliste[0].Verformungsvektor))
}

function elementsteifigkeitsmatrix_elastisch_lokal(
 E: number,
 A: number,
 I: number,
 L: number,
): number[][] {
 return [
  [(E * A) / L, 0, 0, -(E * A) / L, 0, 0],
  [
   0,
   (12 * E * I) / (L * L * L),
   -(6 * E * I) / (L * L),
   0,
   -(12 * E * I) / (L * L * L),
   -(6 * E * I) / (L * L),
  ],
  [0, -(6 * E * I) / (L * L), (4 * E * I) / L, 0, (6 * E * I) / (L * L), (2 * E * I) / L],
  [(-E * A) / L, 0, 0, (E * A) / L, 0, 0],
  [
   0,
   (-12 * E * I) / (L * L * L),
   (6 * E * I) / (L * L),
   0,
   (12 * E * I) / (L * L * L),
   (6 * E * I) / (L * L),
  ],
  [0, (-6 * E * I) / (L * L), (2 * E * I) / L, 0, (6 * E * I) / (L * L), (4 * E * I) / L],
 ]
}

//Gibt die 6x6 Transformationsmatrix für ein Element mit der Stabdrehung alpha[rad] zurück.
function transformationsmatrix(alpha: number): number[][] {
 const sin = Math.sin
 const cos = Math.cos
 return [
  [cos(alpha), sin(alpha), 0, 0, 0, 0],
  [-sin(alpha), cos(alpha), 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 0, 0, cos(alpha), sin(alpha), 0],
  [0, 0, 0, -sin(alpha), cos(alpha), 0],
  [0, 0, 0, 0, 0, 1],
 ]
}

function freiheitsgradeDefinieren(system: System): void {
 let freiheitsgrade: number = 0

 //Freiheitsgrade aus Knotenverformungen
 system.Knotenliste.forEach((knoten) => {
  for (let i = 0; i <= 2; i++) {
   knoten.Inzidenzen[i] = freiheitsgrade
   freiheitsgrade++
  }
 })

 //Zusätzliche Freiheitsgrade aus Gelenkdefinitionen
 //Zwei for Schleife damit erst alle Gelenke vom Anfang und dann
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
}

function steifigkeitsmatrixAufstellen(system: System) {
 //Nicht-kondensierte Steifigkeitsmatrix  zu Nullmatrix initialisieren
 system.M_K_lang = Array.from({ length: system.Freiheitsgrade }, () =>
  Array(system.Freiheitsgrade).fill(0),
 )

 system.Stabliste.forEach((stab) => {
  stab.M_k = elementsteifigkeitsmatrix_elastisch_lokal(
   stab.Querschnitt!.Material!.E,
   stab.Querschnitt!.A,
   stab.Querschnitt!.I,
   stab.Länge,
  )
  stab.M_T = transformationsmatrix(stab.Winkel)
  stab.M_K = matMultiply(matTrans(stab.M_T), stab.M_k, stab.M_T)

  //Elemente der Elementsteifigkeitsmatrix zu Gesamtsteifigkeitsmatrix (unkondensiert) addieren
  for (let rows: number = 0; rows <= 5; rows++) {
   for (let cols: number = 0; cols <= 5; cols++) {
    system.M_K_lang[stab.Inzidenzen[rows]][stab.Inzidenzen[cols]] += stab.M_K![rows][cols]
   }
  }
 })

 //Federkräfte addieren
 system.Knotenliste.forEach((knoten) => {
  for (let i = 0; i <= 2; i++) {
   if (knoten.Lager?.Lagerung[i] && knoten.Lager.Feder[i] !== 0) {
    system.M_K_lang[knoten.Inzidenzen[i]][knoten.Inzidenzen[i]] += knoten.Lager.Feder[i]
   }
  }
 })
}

function randbedingungenEinarbeiten(system: System) {
 const verformungsInzidenzen: number[] = []

 //Nicht-gehaltene Inzidenzen aus Knotenverschiebungen
 //Falls ein Lager UND eine Feder vorhanden ist, wird die Knotenverschiebung als nicht-gehalten angesehen
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

 system.M_Kkurz = Array.from({ length: verformungsInzidenzen.length }, () =>
  Array(verformungsInzidenzen.length).fill(0),
 )
 for (let row: number = 0; row < verformungsInzidenzen.length; row++) {
  for (let col: number = 0; col < verformungsInzidenzen.length; col++) {
   system.M_Kkurz[row][col] =
    system.M_K_lang![verformungsInzidenzen[row]][verformungsInzidenzen[col]]
  }
 }
}

function lastvektorAufstellen(system: System, lastfall: Lastfall) {
 const tempLastvektor: number[] = Array(system.Freiheitsgrade).fill(0)
 lastfall.Knotenlastliste.forEach((knotenlast) => {
  for (let i = 0; i <= 2; i++) {
   tempLastvektor[knotenlast.Knoten!.Inzidenzen[i]] = knotenlast.Lastvektor[i]
  }
 })

 lastfall.Lastvektor = system.Verformungsinzidenzen.map((index) => tempLastvektor[index])
}

function gleichungssystemLösen(system: System, lastfall: Lastfall) {
 lastfall.Verformungsvektor = lastfall.Lastvektor.slice()
 if (
  gauss(
   system.Verformungsinzidenzen.length,
   system.M_Kkurz.map((row) => [...row]),
   lastfall.Verformungsvektor,
  )
 ) {
  console.log("Singuläre Steifigkeitsmatrix")
 }
}
