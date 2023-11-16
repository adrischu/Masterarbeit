export default class Vector {
  x: number
  z: number

  constructor(x: number = 0, z: number = 0) {
    this.x = x
    this.z = z
  }

  get length(): number {
    return Math.sqrt(this.x * this.x + this.z * this.z)
  }

  direction(): number {
    return Math.atan2(this.z, this.x)
  }

  change(x: number, z: number): void {
    this.x = x
    this.z = z
  }
  scale(f: number): void {
    this.x = f * this.x
    this.z = f * this.z
  }
}
