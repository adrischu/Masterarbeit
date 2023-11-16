import Vector from './Vector'

export default class Knoten {
  Nummer: Number
  Koordinaten: Vector

  constructor(nummer: Number = 0, Koordinaten: Vector = new Vector()) {
    this.Nummer = nummer
    this.Koordinaten = Koordinaten
  }
}
