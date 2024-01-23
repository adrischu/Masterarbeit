//Funktion wurde von Prof. Dr. Detlef Rothe (hda) übernommen.
export function gauss(n: number, a: number[][], b: number[]) {
 //***********************************************************************
 //                                                                      *
 // Funktion GAUSS zur Lösung linearer Gleichungen A*x=B                 *
 //                                                                      *
 //***********************************************************************

 let i: number, mem: number, iz: number, k: number, j: number
 let c: number, aji: number

 if (n === 0) return 0 // Falls die Matrixgröße 0 ist, gibt es nichts zu lösen.

 //console.log("in GAUSS");

 // Lösung des Vektors b berechnen

 for (i = 0; i < n - 1; i++) {
  // Pivoting: Suche das maximale Element in der Spalte i

  mem = i
  c = a[i][i]

  for (iz = i + 1; iz < n; iz++) {
   if (Math.abs(a[iz][i]) > Math.abs(c)) {
    c = a[iz][i]
    mem = iz
   }
  }

  // Tausche die Zeilen, wenn notwendig

  if (c === 0.0) {
   console.log("S I N G U L A E R E   M A T R I X      Spalte : ", i)
   console.log("GAUSS")
   return 1 // Rückgabe 1, wenn die Matrix singulär ist.
  }

  if (mem !== i) {
   for (k = i; k < n; k++) {
    c = a[i][k]
    a[i][k] = a[mem][k]
    a[mem][k] = c
   }

   c = b[i]
   b[i] = b[mem]
   b[mem] = c
  }

  // Eliminationsschritt

  for (j = i + 1; j < n; j++) {
   aji = a[j][i] / a[i][i]
   for (k = i; k < n; k++) a[j][k] = a[j][k] - a[i][k] * aji
   b[j] = b[j] - b[i] * aji
  }
 }

 // Überprüfe, ob die Diagonalelemente der resultierenden Matrix 0 sind

 if (a[n - 1][n - 1] === 0.0) {
  console.log("S I N G U L A E R E   M A T R I X      Spalte : ", n)
  console.log("GAUSS")
  return 1 // Rückgabe 1, wenn die Matrix singulär ist.
 }

 // Rücksubstitution, um die Lösung zu erhalten

 b[n - 1] = b[n - 1] / a[n - 1][n - 1]

 for (i = n - 2; i >= 0; i--) {
  c = 0.0
  for (j = i + 1; j < n; j++) c = c + a[i][j] * b[j]
  b[i] = (b[i] - c) / a[i][i]
 }

 return 0 // Erfolgreiche Berechnung, Rückgabe 0.
}
