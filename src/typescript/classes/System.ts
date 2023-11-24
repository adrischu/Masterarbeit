import Knoten from './Knoten'
import type Lager from './Lager'
import Stab from './Stab'

export default class System {
  Knoten: Knoten[]
  Stäbe: Stab[]
  Lager: Lager[]

  constructor() {
    this.Knoten = []
    this.Stäbe = []
    this.Lager = []
  }

  //-----------------------------------------------------------------
  //Methoden, um Objekte, zu verändern, hinzuzufügen, oder zu löschen
  //-----------------------------------------------------------------

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

  //Stab
  addStab(newStab: Stab): void {
    this.Stäbe.push(newStab)
    this.Stäbe.sort((a, b) => a.Nummer - b.Nummer)
  }

  deleteStab(toDeleteIndex: number): void {
    this.Stäbe.splice(toDeleteIndex, 1)
  }

  editStab(changedData: any[], toEditIndex: number): void {
    //Hier noch anpassungen dass
    this.Stäbe[toEditIndex].values = changedData
  }

  //Lager
  addLager(newLager: Lager): void {
    this.Lager.push(newLager)
    this.Lager.sort((a, b) => a.Nummer - b.Nummer)
  }

  deleteLager(toDeleteIndex: number): void {
    this.Stäbe.splice(toDeleteIndex, 1)
  }

  editLager(changedData: any[], toEditIndex: number): void {
    //Hier noch anpassungen dass
    this.Lager[toEditIndex].values = changedData
  }
}
