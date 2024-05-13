import { saveTextFile } from "./DateiFunktionen"
import { preloadSystem } from "./SystemPreload"
import { useSystemStore } from "@/stores/SystemStore"

export function system1Analyse1Element() {
 preloadSystem(3)
 const system = useSystemStore().system
 const E = system.Stabliste[0].Querschnitt?.Material?.E!
 const I = system.Stabliste[0].Querschnitt?.I!
 const L = system.Stabliste[0].Länge
 const PI = Math.PI
 const Fcr: number = (PI ** 2 * E * I) / (2 * L) ** 2
 let ergebnisse: string =
  "F\tFcr\tF/Fcr\tTheorie I. Ordnung\tTheorie II. Ordnung (trigonometrisch)\tTheorie II. Ordnung (kubisch)\tTheorie II. Ordnung (p-Δ)\tF/Fcr\tTheorie I. Ordnung\tTheorie II. Ordnung (kubisch)\tTheorie II. Ordnung (p-Δ)\n"
 const nIterationen = 100
 for (let i = 0; i <= nIterationen; i++) {
  const F = (i / nIterationen) * Fcr
  system.Lastfallliste.forEach((lastfall) => {
   lastfall.Knotenlastliste[0].Lastvektor[0] = -F
  })
  system.berechnen()

  const uTh1 = system.Lastfallliste[0].Elementliste[0].Verformungen[4]
  const uTrig = system.Lastfallliste[1].Elementliste[0].Verformungen[4]
  const uKub = system.Lastfallliste[2].Elementliste[0].Verformungen[4]
  const upDelta = system.Lastfallliste[3].Elementliste[0].Verformungen[4]
  const fehlerTh1 = ((uTh1 - uTrig) / uTrig) * 100 //Fehler in Prozent
  const fehlerKub = ((uKub - uTrig) / uTrig) * 100 //Fehler in Prozent
  const fehlerpDelta = ((upDelta - uTrig) / uTrig) * 100 //Fehler in Prozent

  ergebnisse = ergebnisse.concat(
   F.toString(),
   "\t",
   Fcr.toString(),
   "\t",
   (F / Fcr).toString(),
   "\t",
   uTh1.toString(),
   "\t",
   uTrig.toString(),
   "\t",
   uKub.toString(),
   "\t",
   upDelta.toString(),
   "\t",
   (F / Fcr).toString(),
   "\t",
   fehlerTh1.toString(),
   "\t",
   fehlerKub.toString(),
   "\t",
   fehlerpDelta.toString(),
   "\n",
  )
 }

 //Punkte mit Komma ersetzen, damit excel die Zahlen richt3ig erkennt.
 const re = /\./gi
 ergebnisse = ergebnisse.replace(re, ",")

 //Download der Textdatei
 saveTextFile(ergebnisse, "system1-1ElementErgebnisse")
}

export function system1Analyse2Element() {
 preloadSystem(4)
 const system = useSystemStore().system
 const E = system.Stabliste[0].Querschnitt?.Material?.E!
 const I = system.Stabliste[0].Querschnitt?.I!
 const L = system.Stabliste[0].Länge
 const PI = Math.PI
 const Fcr: number = (PI ** 2 * E * I) / (2 * (10 * L)) ** 2
 let ergebnisse: string =
  "F\tFcr\tF/Fcr\tTheorie I. Ordnung\tTheorie II. Ordnung (trigonometrisch)\tTheorie II. Ordnung (kubisch)\tTheorie II. Ordnung (p-Δ)\tF/Fcr\tTheorie I. Ordnung\tTheorie II. Ordnung (kubisch)\tTheorie II. Ordnung (p-Δ)\n"
 const nIterationen = 1000
 for (let i = 0; i <= nIterationen; i++) {
  const F = (i / nIterationen) * Fcr
  system.Lastfallliste.forEach((lastfall) => {
   lastfall.Knotenlastliste[0].Lastvektor[0] = -F
  })
  system.berechnen()

  const uTh1 = system.Lastfallliste[0].Elementliste[9].Verformungen[4]
  const uTrig = system.Lastfallliste[1].Elementliste[9].Verformungen[4]
  const uKub = system.Lastfallliste[2].Elementliste[9].Verformungen[4]
  const upDelta = system.Lastfallliste[3].Elementliste[9].Verformungen[4]
  const fehlerTh1 = ((uTh1 - uTrig) / uTrig) * 100 //Fehler in Prozent
  const fehlerKub = ((uKub - uTrig) / uTrig) * 100 //Fehler in Prozent
  const fehlerpDelta = ((upDelta - uTrig) / uTrig) * 100 //Fehler in Prozent

  ergebnisse = ergebnisse.concat(
   F.toString(),
   "\t",
   Fcr.toString(),
   "\t",
   (F / Fcr).toString(),
   "\t",
   uTh1.toString(),
   "\t",
   uTrig.toString(),
   "\t",
   uKub.toString(),
   "\t",
   upDelta.toString(),
   "\t",
   (F / Fcr).toString(),
   "\t",
   fehlerTh1.toString(),
   "\t",
   fehlerKub.toString(),
   "\t",
   fehlerpDelta.toString(),
   "\n",
  )
 }

 //Punkte mit Komma ersetzen, damit excel die Zahlen richt3ig erkennt.
 const re = /\./gi
 ergebnisse = ergebnisse.replace(re, ",")

 //Download der Textdatei
 saveTextFile(ergebnisse, "system1-2ElementeErgebnisse")
}

export function system2Analyse1Element() {
 preloadSystem(5)
 const system = useSystemStore().system

 const alphaCrit = 4.175

 let ergebnisse: string =
  "alphcaCrit\tF2\tF/Fcr\tTheorie I. Ordnung\tTheorie II. Ordnung (trigonometrisch)\tTheorie II. Ordnung (kubisch)\tTheorie II. Ordnung (p-Δ)\tF/Fcr\tTheorie I. Ordnung\tTheorie II. Ordnung (kubisch)\tTheorie II. Ordnung (p-Δ)\n"
 const nIterationen = 1000
 for (let i = 0; i <= nIterationen; i++) {
  const F1 = (i / nIterationen) * 100000 * alphaCrit
  const F2 = (i / nIterationen) * 1000000 * alphaCrit
  const F3 = (i / nIterationen) * 500000 * alphaCrit
  system.Lastfallliste.forEach((lastfall) => {
   lastfall.Knotenlastliste[0].Lastvektor[0] = F1
   lastfall.Knotenlastliste[0].Lastvektor[1] = F2
   lastfall.Knotenlastliste[1].Lastvektor[1] = F3
  })
  system.berechnen()

  const uTh1 = system.Lastfallliste[0].Elementliste[1].Verformungen[3]
  const uTrig = system.Lastfallliste[1].Elementliste[1].Verformungen[3]
  const uKub = system.Lastfallliste[2].Elementliste[1].Verformungen[3]
  const upDelta = system.Lastfallliste[3].Elementliste[1].Verformungen[3]
  const fehlerTh1 = ((uTh1 - uTrig) / uTrig) * 100 //Fehler in Prozent
  const fehlerKub = ((uKub - uTrig) / uTrig) * 100 //Fehler in Prozent
  const fehlerpDelta = ((upDelta - uTrig) / uTrig) * 100 //Fehler in Prozent

  ergebnisse = ergebnisse.concat(
   ((i / nIterationen) * alphaCrit).toString(),
   "\t",
   F2.toString(),
   "\t",
   (i / nIterationen).toString(),
   "\t",
   uTh1.toString(),
   "\t",
   uTrig.toString(),
   "\t",
   uKub.toString(),
   "\t",
   upDelta.toString(),
   "\t",
   (i / nIterationen).toString(),
   "\t",
   fehlerTh1.toString(),
   "\t",
   fehlerKub.toString(),
   "\t",
   fehlerpDelta.toString(),
   "\n",
  )
 }

 //Punkte mit Komma ersetzen, damit excel die Zahlen richt3ig erkennt.
 const re = /\./gi
 ergebnisse = ergebnisse.replace(re, ",")

 //Download der Textdatei
 saveTextFile(ergebnisse, "system2-1ElementeErgebnisse")
}
