import type { isStatikobjekt } from './interfaceStatikobjekt'

export default class Lager implements isStatikobjekt {
  id: number
  Nummer: number
  Lagerung: { x: boolean; z: boolean; phi: boolean }
  Feder: { x: number; z: number; phi: number }

  constructor(
    Nummer: number = 0,
    Lagerung: { x: boolean; z: boolean; phi: boolean } = { x: true, z: true, phi: true },
    Feder: { x: number; z: number; phi: number } = { x: 0, z: 0, phi: 0 }
  ) {
    this.id = Nummer
    this.Nummer = Nummer
    this.Lagerung = Lagerung
    this.Feder = Feder
  }

  //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
  //wie 'set values' und 'get header'
  get values() {
    return [
      this.Nummer,
      this.Lagerung.x,
      this.Lagerung.z,
      this.Lagerung.phi,
      this.Feder.x,
      this.Feder.z,
      this.Feder.phi
    ]
  }

  set values([Nummer, LagX, LagZ, LagPhi, FedX, FedZ, FedPhi]: any[]) {
    this.id = Nummer
    this.Nummer = Nummer
    this.Lagerung = { x: LagX, z: LagZ, phi: LagPhi }
    this.Feder = { x: FedX, z: FedZ, phi: FedPhi }
  }

  get header() {
    return [
      { id: 'Nummer', einheit: '', value: this.Nummer, inputType: 'fixed', inputFormat: 'number' },
      {
        id: 'Lager in x',
        einheit: '',
        value: this.Lagerung.x,
        inputType: 'checkbox',
        inputFormat: 'boolean',
        selectList: [0, 1]
      },
      {
        id: 'Lager in z',
        einheit: '',
        value: this.Lagerung.z,
        inputType: 'checkbox',
        inputFormat: 'boolean',
        selectList: [0, 1]
      },
      {
        id: 'Lager in phi',
        einheit: '',
        value: this.Lagerung.phi,
        inputType: 'checkbox',
        inputFormat: 'boolean',
        selectList: [0, 1]
      },
      {
        id: 'Feder in x',
        einheit: '',
        value: this.Feder.x,
        inputType: 'input',
        inputFormat: 'number'
      },
      {
        id: 'Feder in z',
        einheit: '',
        value: this.Feder.z,
        inputType: 'input',
        inputFormat: 'number'
      },
      {
        id: 'Feder in phi',
        einheit: '',
        value: this.Feder.phi,
        inputType: 'input',
        inputFormat: 'number'
      }
    ]
  }
}
