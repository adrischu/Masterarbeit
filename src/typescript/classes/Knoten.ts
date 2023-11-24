import { useSystemStore } from '@/stores/SystemStore'
import type Lager from './Lager'
import Vector from './Vector'
import type { isStatikobjekt } from './interfaceStatikobjekt'

export default class Knoten implements isStatikobjekt {
  id: number
  Nummer: number
  Koordinaten: Vector
  Lagernummer: number
  Lager: Lager | null

  constructor(Nummer: number = 0, Koordinaten: Vector = new Vector(), Lagernummer: number = 0) {
    this.id = Nummer
    this.Nummer = Nummer
    this.Koordinaten = Koordinaten
    this.Lagernummer = Lagernummer
    this.Lager = null
  }

  //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
  //wie 'set values' und 'get header'
  get values() {
    return [this.Nummer, this.Koordinaten.x, this.Koordinaten.z, this.Lagernummer]
  }

  set values([Nummer, x, z, Lagernummer]: any[]) {
    this.id = Nummer
    this.Nummer = Nummer
    this.Koordinaten.x = x
    this.Koordinaten.z = z
    this.Lagernummer = Lagernummer
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
      },
      {
        id: 'Lager',
        einheit: '',
        value: this.Lagernummer,
        inputType: 'select',
        inputFormat: 'number',
        selectList: systemStore.system.Lager.map((knoten) => knoten.Nummer).sort()
      }
    ]
  }
}
