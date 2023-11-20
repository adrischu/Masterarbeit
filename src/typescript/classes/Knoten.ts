import Vector from './Vector'
import { useSystemStore } from '@/stores/SystemStore'
import type { isStatikobjekt } from './interfaceStatikobjekt'

export default class Knoten implements isStatikobjekt {
  id: number
  Nummer: number
  Koordinaten: Vector

  constructor(Nummer: number = 0, Koordinaten: Vector = new Vector()) {
    this.id = Nummer
    this.Nummer = Nummer
    this.Koordinaten = Koordinaten
  }

  get values() {
    return [this.Nummer, this.Koordinaten.x, this.Koordinaten.z]
  }

  set values([Nummer, x, z]: any[]) {
    this.id = Nummer
    this.Nummer = Nummer
    this.Koordinaten.x = x
    this.Koordinaten.z = z
  }

  get header() {
    const systemStore = useSystemStore()
    return [
      { id: 'Nummer', einheit: '', value: this.Nummer, inputType: 'fixed', inputFormat: 'number' },
      {
        id: 'x-Koordinate',
        einheit: 'kNm',
        value: this.Koordinaten.x,
        inputType: 'input',
        inputFormat: 'number'
      },
      {
        id: 'z-Koordinate',
        einheit: 'm',
        value: this.Koordinaten.z,
        inputType: 'input',
        inputFormat: 'number'
      }
    ]
  }
}
