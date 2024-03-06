/**
 * Hier sind alle Funktionen, die im Code nicht mehr gebraucht werden,
 * aber zu schade sind um weggeworfen zu werden.
 */

/**Ermittelt die Inverse der Transformationsmatrix.
 * Die Inverse wurde vorab mit SMath bestimmt für eine Matrix der Form:
 * -   | a   b   0   0   0   0 |
 * -   | c   d   0   0   0   0 |
 * -   | 0   0   1   0   0   0 |
 * -   | 0   0   0   e   f   0 |
 * -   | 0   0   0   g   h   0 |
 * -   | 0   0   0   0   0   1 |
 */
//  get TInv(): number[][] {
//   const T = this.T

//   const a = T[0][0]
//   const b = T[0][1]
//   const c = T[1][0]
//   const d = T[1][1]
//   const e = T[3][3]
//   const f = T[3][4]
//   const g = T[4][3]
//   const h = T[4][4]
//   return [
//    [-d / (b * c - a * d), b / (b * c - a * d), 0, 0, 0, 0],
//    [c / (b * c - a * d), -a / (b * c - a * d), 0, 0, 0, 0],
//    [0, 0, 1, 0, 0, 0],
//    [0, 0, 0, -h / (f * g - e * h), f / (f * g - e * h), 0],
//    [0, 0, 0, g / (f * g - e * h), -e / (f * g - e * h), 0],
//    [0, 0, 0, 0, 0, 1],
//   ]
//  }
