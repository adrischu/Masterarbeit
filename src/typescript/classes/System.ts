import type { isStatikobjekt } from './interfaceStatikobjekt'
import Knoten from './Knoten'
import Lager from './Lager'
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

  private determineObjectClass(objektTyp: string): {
    statikobjekt: isStatikobjekt
    statikobjektArray: isStatikobjekt[]
  } {
    let statikobjekt: isStatikobjekt
    let statikobjektArray: isStatikobjekt[]
    switch (objektTyp) {
      case 'Knoten': {
        statikobjekt = new Knoten()
        statikobjektArray = this.Knoten
        break
      }
      case 'Stab': {
        statikobjekt = new Stab()
        statikobjektArray = this.Stäbe
        break
      }
      case 'Lager': {
        statikobjekt = new Lager()
        statikobjektArray = this.Lager
        break
      }
      default: {
        break
      }
    }
    return { statikobjekt: statikobjekt!, statikobjektArray: statikobjektArray! }
  }

  addStatikobjekt(objektTyp: string, statikobjektdaten: any[]) {
    const statikobjekt: isStatikobjekt = this.determineObjectClass(objektTyp).statikobjekt
    const statikobjektArray: isStatikobjekt[] =
      this.determineObjectClass(objektTyp).statikobjektArray

    statikobjekt!.values = statikobjektdaten
    statikobjektArray!.push(statikobjekt!)
  }

  editStatikobjekt(objektTyp: string, statikobjektdaten: any[], objektindex: number) {
    const statikobjektArray: isStatikobjekt[] =
      this.determineObjectClass(objektTyp).statikobjektArray

    statikobjektArray[objektindex].values = statikobjektdaten
  }

  deleteStatikobjekt(objektTyp: string, objektindex: number) {
    const statikobjektArray: isStatikobjekt[] =
      this.determineObjectClass(objektTyp).statikobjektArray

    statikobjektArray.splice(objektindex, 1)
  }
}
