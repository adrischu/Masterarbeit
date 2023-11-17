import Knoten from './Knoten'
import Vector from './Vector'

export default class Stab {
  Nummer: number
  Anfangsknotennummer: number
  Endknotennummer: number
  Anfangsknoten: Knoten
  Endknoten: Knoten
  Elementabschnitte: number

  constructor(
    Nummer: number = 1,
    Anfangsknotennummer: number = 0,
    Endknotennummer: number = 0,
    Anfangsknoten: Knoten = new Knoten(),
    Endknoten: Knoten = new Knoten(),
    Elementabschnitte: number = 10
  ) {
    this.Nummer = Nummer
    this.Anfangsknotennummer = Anfangsknotennummer
    this.Endknotennummer = Endknotennummer
    this.Anfangsknoten = Anfangsknoten
    this.Endknoten = Endknoten
    this.Elementabschnitte = Elementabschnitte
  }

  get Länge(): number {
    const stabVektor: Vector = new Vector(
      this.Endknoten.Koordinaten.x - this.Anfangsknoten.Koordinaten.x,
      this.Endknoten.Koordinaten.z - this.Anfangsknoten.Koordinaten.z
    )
    return stabVektor.length
  }
}
