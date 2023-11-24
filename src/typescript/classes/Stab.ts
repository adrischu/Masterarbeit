import Knoten from './Knoten'
import Vector from './Vector'
import { useSystemStore } from '@/stores/SystemStore'
import type { isStatikobjekt } from './interfaceStatikobjekt'

export default class Stab implements isStatikobjekt {
  id: number
  Nummer: number
  Anfangsknotennummer: number
  Anfangsknoten: Knoten | null
  Endknotennummer: number
  Endknoten: Knoten | null
  Elementabschnitte: number

  constructor(
    Nummer: number = 1,
    Anfangsknotennummer: number = 0,
    Endknotennummer: number = 0,
    Anfangsknoten: Knoten | null = null,
    Endknoten: Knoten | null = null,
    Elementabschnitte: number = 10
  ) {
    this.id = Nummer
    this.Nummer = Nummer
    this.Anfangsknotennummer = Anfangsknotennummer
    this.Endknotennummer = Endknotennummer
    this.Anfangsknoten = Anfangsknoten
    this.Endknoten = Endknoten
    this.Elementabschnitte = Elementabschnitte
  }

  get Länge(): number | string {
    if (this.Anfangsknoten === null || this.Endknoten === null) {
      return '?'
    } else {
      const stabVektor: Vector = new Vector(
        this.Endknoten.Koordinaten.x - this.Anfangsknoten.Koordinaten.x,
        this.Endknoten.Koordinaten.z - this.Anfangsknoten.Koordinaten.z
      )
      return stabVektor.length
    }
  }

  //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
  //wie 'set values' und 'get header'
  get values() {
    return [this.Nummer, this.Anfangsknotennummer, this.Endknotennummer, this.Elementabschnitte]
  }

  set values([Nummer, Anfangsknotennummer, Endknotennummer, Elementabschnitte]: any[]) {
    this.id = Nummer
    this.Nummer = Nummer
    this.Anfangsknotennummer = Anfangsknotennummer
    this.Endknotennummer = Endknotennummer
    this.Elementabschnitte = Elementabschnitte
  }

  get header() {
    const systemStore = useSystemStore()
    return [
      { id: 'Nummer', einheit: '', value: this.Nummer, inputType: 'fixed', inputFormat: 'number' },
      {
        id: 'Anfangsknoten',
        einheit: '',
        value: this.Anfangsknotennummer,
        inputType: 'select',
        inputFormat: 'number',
        selectList: systemStore.system.Knoten.map((knoten) => knoten.Nummer).sort()
      },
      {
        id: 'Endknoten',
        einheit: '',
        value: this.Endknotennummer,
        inputType: 'select',
        inputFormat: 'number',
        selectList: systemStore.system.Knoten.map((knoten) => knoten.Nummer).sort()
      },
      {
        id: 'Elementanzahl',
        einheit: '',
        value: this.Elementabschnitte,
        inputType: 'input',
        inputFormat: 'number'
      }
    ]
  }
}
