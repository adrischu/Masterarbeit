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

 get direction(): number {
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

 subtract(v: Vector): void {
  this.x = this.x - v.x
  this.z = this.z - v.z
 }

 add(v: Vector): void {
  this.x = this.x + v.x
  this.z = this.z + v.z
 }

 movePolar(distance: number, angle: number): Vector {
  return new Vector(this.x + Math.cos(angle) * distance, this.z + Math.sin(angle) * distance)
 }

 moveAlongVector(vector: Vector, ratio: number): Vector {
  return new Vector(this.x + vector.x * ratio, this.z + vector.z * ratio)
 }

 copy(): Vector {
  return new Vector(this.x, this.z)
 }
}
