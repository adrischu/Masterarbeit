import Knoten from './Knoten'
import Stab from './Stab'

export default class System {
  Knoten: Knoten[]
  Stäbe: Stab[]

  constructor() {
    this.Knoten = []
    this.Stäbe = []
  }

  //Knoten
  addKnoten(newKnoten: Knoten): void {
    this.Knoten.push(newKnoten)
    this.Knoten.sort((a, b) => a.Nummer - b.Nummer)
  }

  deleteKnoten(toDeleteIndex: number): void {
    this.Knoten.splice(toDeleteIndex, 1)
  }

  editKnoten(changedData: any[], toEditIndex: number): void {
    //Nummer darf nicht geändert werden.
    this.Knoten[toEditIndex].values = changedData
  }
}
