import Knoten from './Knoten'

export default class Stab {
  Nummer: Number
  Anfangsknoten: Knoten
  Endknoten: Knoten
  Elementabschnitte: Number

  constructor(
    Nummer: Number = 1,
    Anfangsknoten: Knoten = new Knoten(),
    Endknoten: Knoten = new Knoten(),
    Elementabschnitte: number = 10
  ) {
    this.Nummer = Nummer
    this.Anfangsknoten = Anfangsknoten
    this.Endknoten = Endknoten
    this.Elementabschnitte = Elementabschnitte
  }
}
