export function matMultiplyMat(A: number[][], B: number[][]): number[][] | null {
 const rowsA = A.length
 const colsA = A[0].length
 const rowsB = B.length
 const colsB = B[0].length

 // Überprüfe die Kompatibilität der Matrizen für die Multiplikation
 if (colsA !== rowsB) {
  console.error(
   "Die Anzahl der Spalten von Matrix A muss gleich der Anzahl der Zeilen von Matrix B sein.",
  )
  return null
 }

 const result: number[][] = Array.from({ length: rowsA }, () => Array(colsB).fill(0))

 for (let i = 0; i < rowsA; i++) {
  for (let j = 0; j < colsB; j++) {
   for (let k = 0; k < colsA; k++) {
    result[i][j] += A[i][k] * B[k][j]
   }
  }
 }

 return result
}

export function matMultiplyVec(A: number[][], b: number[]): number[] | null {
 const rowsA = A.length
 const colsA = A[0].length

 // Überprüfe die Kompatibilität von Matrix A und Vektor b
 if (colsA !== b.length) {
  console.error("Die Anzahl der Spalten von Matrix A muss gleich der Länge von Vektor b sein.")
  return null
 }

 const result: number[] = Array(rowsA).fill(0)

 for (let i = 0; i < rowsA; i++) {
  for (let j = 0; j < colsA; j++) {
   result[i] += A[i][j] * b[j]
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

export function matInv(matrix: number[][]): number[][] {
 const n: number = Math.sqrt(matrix.length)
 if (!Number.isInteger(n) || n % 1 !== 0) {
  throw new Error("Matrix must be square.")
 }

 const augmentedMatrix: number[][] = matrix.map((row) => [
  ...row,
  ...identityMatrix(n)[matrix.indexOf(row)],
 ])
 const numCols: number = 2 * n

 // Gauss-Jordan Elimination
 for (let i = 0; i < n; i++) {
  const pivot: number = augmentedMatrix[i][i]
  if (pivot === 0) {
   throw new Error("Matrix is singular, it cannot be inverted.")
  }
  for (let j = 0; j < numCols; j++) {
   augmentedMatrix[i][j] /= pivot
  }
  for (let k = 0; k < n; k++) {
   if (k !== i) {
    const factor: number = augmentedMatrix[k][i]
    for (let j = 0; j < numCols; j++) {
     augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j]
    }
   }
  }
 }

 // Rückgabe der inversen Matrix
 const inverse: number[][] = augmentedMatrix.map((row) => row.slice(n))
 return inverse
}

// Funktion zur Erstellung einer Identitätsmatrix der Größe n x n
function identityMatrix(n: number): number[][] {
 const identity: number[][] = []
 for (let i = 0; i < n; i++) {
  const row: number[] = []
  for (let j = 0; j < n; j++) {
   row.push(i === j ? 1 : 0)
  }
  identity.push(row)
 }
 return identity
}
