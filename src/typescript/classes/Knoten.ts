import Vector from './Vector'

export default class Knoten {
  Nummer: number
  Koordinaten: Vector

  constructor(nummer: number = 0, Koordinaten: Vector = new Vector()) {
    this.Nummer = nummer
    this.Koordinaten = Koordinaten
  }
}
