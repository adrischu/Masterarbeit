export function matMultiply(...matrices: number[][][]): number[][] | null {
 if (matrices.length < 2) {
  console.error("Es müssen mindestens zwei Matrizen übergeben werden.")
  return null
 }

 // Überprüfe die Kompatibilität der Matrizen für die Multiplikation
 for (let i = 1; i < matrices.length; i++) {
  if (matrices[i - 1][0].length !== matrices[i].length) {
   console.error(
    "Die Anzahl der Spalten von Matrix",
    i,
    "muss der Anzahl der Zeilen von Matrix",
    i + 1,
    "entsprechen.",
   )
   return null
  }
 }

 // Funktion für die Matrizenmultiplikation
 function matrixMultiply(a: number[][], b: number[][]): number[][] {
  const rowsA = a.length
  const colsA = a[0].length
  const rowsB = b.length
  const colsB = b[0].length

  const result: number[][] = Array.from({ length: rowsA }, () => Array(colsB).fill(0))

  for (let i = 0; i < rowsA; i++) {
   for (let j = 0; j < colsB; j++) {
    for (let k = 0; k < colsA; k++) {
     result[i][j] += a[i][k] * b[k][j]
    }
   }
  }

  return result
 }

 // Multiplikation der Matrizen von links nach rechts
 let result = matrices[0]
 for (let i = 1; i < matrices.length; i++) {
  result = matrixMultiply(result, matrices[i])
  if (result === null) {
   return null // Wenn die Multiplikation nicht möglich ist, breche ab
  }
 }

 return result
}

export function matTrans(inputMatrix: number[][] | number[]): number[][] {
 if (inputMatrix.length === 0) {
  return []
 }

 if (Array.isArray(inputMatrix[0])) {
  // Zweidimensionales Array (Matrix)
  return (inputMatrix as number[][]).reduce((transposedMatrix, row, rowIndex) => {
   row.forEach((value, colIndex) => {
    if (!transposedMatrix[colIndex]) {
     transposedMatrix[colIndex] = []
    }
    transposedMatrix[colIndex][rowIndex] = value
   })
   return transposedMatrix
  }, [] as number[][])
 } else {
  // Eindimensionales Array (Vektor)
  return (inputMatrix as number[]).map((value) => [value])
 }
}

export function matAdd(...matrices: number[][][]): number[][] | null {
 if (matrices.length < 2) {
  console.error("Es müssen mindestens zwei Matrizen übergeben werden.")
  return null
 }

 // Überprüfe die Kompatibilität der Matrizen für die Addition
 const rows = matrices[0].length
 const cols = matrices[0][0].length
 for (const matrix of matrices) {
  if (matrix.length !== rows || matrix[0].length !== cols) {
   console.error("Alle Matrizen müssen die gleiche Anzahl an Zeilen und Spalten haben.")
   return null
  }
 }

 // Führe die Matrixaddition durch
 const result: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0))

 for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
   for (const matrix of matrices) {
    result[i][j] += matrix[i][j]
   }
  }
 }

 return result
}

export function matSub(...matrices: number[][][]): number[][] | null {
 if (matrices.length < 2) {
  console.error("Es müssen mindestens zwei Matrizen übergeben werden.")
  return null
 }

 // Überprüfe die Kompatibilität der Matrizen für die Subtraktion
 const rows = matrices[0].length
 const cols = matrices[0][0].length
 for (const matrix of matrices) {
  if (matrix.length !== rows || matrix[0].length !== cols) {
   console.error("Alle Matrizen müssen die gleiche Anzahl an Zeilen und Spalten haben.")
   return null
  }
 }

 // Führe die Matrixsubtraktion durch
 const result: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0))

 for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
   result[i][j] = matrices[0][i][j] // Setze den Wert auf den der ersten Matrix

   // Subtrahiere die Werte der nachfolgenden Matrizen
   for (let k = 1; k < matrices.length; k++) {
    result[i][j] -= matrices[k][i][j]
   }
  }
 }

 return result
}
