/**
 * Gleichungslöser nach Cholesky
 * netterweise bereitgestellt von Hr. Detlef Rothe 
 * Mail von Hr Rorht als Info:
 * 
 * Hallo Herr Schubert,

anbei die Funktion zur Gleichungslösung nach Cholesky.

Man kann die Lösung in zwei Teile aufteilen. Zuerst die Zerlegung in A=L*L^T (case 1). Dies ist unabhängig von den rechten Seiten. Dies ist der aufwändige Teil. Danach können mehrere rechten Seiten gelöst werden (case 2). Die L-Matrizen ändern sich dabei nicht. Das ist interessant bei Theorie I.Ordnung mit vielen rechten Seiten.

Wenn Sie den gauss-Algorithmus  direkt austauschen wollen, dann können Sie in der Datei cholesky.ts die Switch-Anweisung entfernen incl. der Variablen flag und dem return 0; vor case 2.  Dann werden beide Teile nacheinander abgearbeitet.

Viel Spaß,

Detlef Rothe
 * 
 * @param a linke Seite (Steifigeitsmatrix)
 * @param b rechte Seite (Lastvektor)
 * @param n Anzahl an zu lösenden Gleichungen
 * @returns 0 bei fehlerfrei... sonst fehlerhafte Zeile
 */

export function cholesky(a: number[][], b: number[], n: number) {
 /* Cholesky Zerlegung   A = L*L^T = L*U

          | x x x |
      U = | 0 x x |
          | 0 0 x |

        der obere Teil der Matrix [A] enthält [U] nach der Zerlegung
    */

 let i = 0,
  j = 0,
  k = 0
 let s = 0.0

 for (i = 0; i < n; ++i) {
  if (a[i][i] <= 0.0) return i // Zeilenummer zurückgeben
  else {
   a[i][i] = Math.sqrt(a[i][i])
   for (k = i + 1; k < n; ++k) {
    a[i][k] /= a[i][i]
   }
   for (j = i + 1; j < n; ++j) {
    for (k = j; k < n; ++k) {
     a[j][k] -= a[i][j] * a[i][k]
    }
   }
  }
 }
 // for (j = 0; j < n; j++) {
 //     console.log('a_stiff[]', a[j])
 // }

 for (k = 0; k < n; k++) {
  s = b[k]
  for (i = 0; i < k; ++i) {
   s -= a[i][k] * b[i]
  }
  b[k] = s / a[k][k]
 }

 for (i = n - 1; i >= 0; --i) {
  s = b[i]
  for (k = i + 1; k < n; ++k) {
   s -= a[i][k] * b[k]
  }
  b[i] = s / a[i][i]
 }

 return 0
}

/**
 * Cholesky in der Ursprungsform aus der Mail von Hr Rothe.
 * Mit dieser Variante können mehrere rechte Seiten gelöst werden mit weniger extra Aufwand, 
 * da zunächst K*K^T aufgestellt wird.
 * Mail von Hr Rothe hierzu:
 * 
 * Hallo Herr Schubert,

anbei die Funktion zur Gleichungslösung nach Cholesky.

Man kann die Lösung in zwei Teile aufteilen. Zuerst die Zerlegung in A=L*L^T (case 1). Dies ist unabhängig von den rechten Seiten. Dies ist der aufwändige Teil. Danach können mehrere rechten Seiten gelöst werden (case 2). Die L-Matrizen ändern sich dabei nicht. Das ist interessant bei Theorie I.Ordnung mit vielen rechten Seiten.

Wenn Sie den gauss-Algorithmus  direkt austauschen wollen, dann können Sie in der Datei cholesky.ts die Switch-Anweisung entfernen incl. der Variablen flag und dem return 0; vor case 2.  Dann werden beide Teile nacheinander abgearbeitet.

Viel Spaß,

Detlef Rothe

 */

/* 
    Cholesky Zerlegung   A = L*L^T = L*U

          | x x x |
      U = | 0 x x |
          | 0 0 x |

        der obere Teil der Matrix [A] enthält [U] nach der Zerlegung
    
export function cholesky(a: number[][], b: number[], n: number, flag: number) {


        let i = 0,
        j = 0,
        k = 0
       let s = 0.0
      
       switch (flag) {
        case 1:
         for (i = 0; i < n; ++i) {
          if (a[i][i] <= 0.0) return i // Zeilenummer zurückgeben
          else {
           a[i][i] = Math.sqrt(a[i][i])
           for (k = i + 1; k < n; ++k) {
            a[i][k] /= a[i][i]
           }
           for (j = i + 1; j < n; ++j) {
            for (k = j; k < n; ++k) {
             a[j][k] -= a[i][j] * a[i][k]
            }
           }
          }
         }
         // for (j = 0; j < n; j++) {
         //     console.log('a_stiff[]', a[j])
         // }
         return 0
      
        case 2:
         for (k = 0; k < n; k++) {
          s = b[k]
          for (i = 0; i < k; ++i) {
           s -= a[i][k] * b[i]
          }
          b[k] = s / a[k][k]
         }
      
         for (i = n - 1; i >= 0; --i) {
          s = b[i]
          for (k = i + 1; k < n; ++k) {
           s -= a[i][k] * b[k]
          }
          b[i] = s / a[i][i]
         }
      
         return 0
      
        default:
         return -1
       }
      }
*/
