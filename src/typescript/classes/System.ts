import Knoten from './Knoten'
import Stab from './Stab'

export default class System {
  Knoten: Knoten[]
  Stäbe: Stab[]

  constructor() {
    this.Knoten = []
    this.Stäbe = []
  }
}
