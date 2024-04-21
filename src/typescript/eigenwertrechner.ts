function eigenwertberechnung(
 iKomb: number,
 stiff: number[][],
 stiff_sig: number[][],
 u: number[],
 flag: number,
) {
 //---------------------------------------------------------------------------------------------------------------
 {
  let i: number, j: number, ielem: number

  for (i = 0; i < neq; i++) stiff[i].fill(0.0)
  for (i = 0; i < neq; i++) stiff_sig[i].fill(0.0)

  //R.fill(0.0);
  //u.fill(0.0);
  //const help = Array.from(Array(6), () => new Array(6));

  for (ielem = 0; ielem < nelemTotal; ielem++) {
   if (el[ielem].isActive) {
    el[ielem].berechneElementsteifigkeitsmatrix(0)
    el[ielem].addiereElementsteifigkeitmatrix(stiff)

    el[ielem].berechneElementsteifigkeitsmatrix_Ksig()
    el[ielem].addiereElementsteifigkeitmatrix_ksig(stiff_sig)
   }
  }

  // for (i = 0; i < neq; i++) {
  //     console.log("stiff_sig", stiff_sig[i])
  // }

  let kstiff_array = new Float64Array(neq * neq)
  let k = 0
  for (let ispalte = 0; ispalte < neq; ispalte++) {
   for (let izeile = 0; izeile < neq; izeile++) {
    kstiff_array[k] = stiff[izeile][ispalte]
    k++
   }
  }
  let kstiff_ptr = Module._malloc(kstiff_array.length * bytes_8)
  Module.HEAPF64.set(kstiff_array, kstiff_ptr / bytes_8)

  let kstiff_sig_array = new Float64Array(neq * neq)
  k = 0
  for (let ispalte = 0; ispalte < neq; ispalte++) {
   for (let izeile = 0; izeile < neq; izeile++) {
    kstiff_sig_array[k] = stiff_sig[izeile][ispalte]
    k++
   }
  }
  let kstiff_sig_ptr = Module._malloc(kstiff_sig_array.length * bytes_8)
  Module.HEAPF64.set(kstiff_sig_array, kstiff_sig_ptr / bytes_8)

  let eigenform_ptr = Module._malloc(neq * neigv * bytes_8)
  let omega_ptr = Module._malloc(neigv * bytes_8)

  c_simvektoriteration(kstiff_ptr, kstiff_sig_ptr, omega_ptr, eigenform_ptr, neq, neigv)

  let omega_array = new Float64Array(Module.HEAPF64.buffer, omega_ptr, neigv)
  console.log("omega", omega_array[0], omega_array[1])

  for (i = 0; i < neigv; i++) alpha_cr[iKomb - 1][i] = omega_array[i] ** 2

  let eigenform_array = new Float64Array(Module.HEAPF64.buffer, eigenform_ptr, neq * neigv)
  //console.log("eigenform_array", eigenform_array);

  if (flag === 0) {
   for (i = 0; i < neq; i++) u[i] = eigenform_array[i]
  } else {
   let disp = [3]
   let offset = 0
   for (let ieigv = 1; ieigv <= neigv; ieigv++) {
    for (i = 0; i < nnodes; i++) {
     // Ausgabe der Verschiebungen der einzelnen Knoten im gedrehten Koordinatensystem
     for (j = 0; j < 3; j++) {
      let ieq = node[i].L[j]
      if (ieq === -1) {
       disp[j] = 0
      } else {
       disp[j] = eigenform_array[ieq + offset]
      }
     }

     for (j = 0; j < 3; j++) {
      // console.log("eigenform_container_node[iKomb]", eigenform_container_node[iKomb-1])
      eigenform_container_node[iKomb - 1].set(i + 1, j + 1, ieigv, disp[j])
      if (Math.abs(disp[j]) > maxValue_eigv[iKomb - 1][ieigv - 1])
       maxValue_eigv[iKomb - 1][ieigv - 1] = Math.abs(disp[j])
     }
    }

    for (i = 0; i < neq; i++) {
     eigenform_container_u[iKomb - 1].set(i, ieigv, eigenform_array[i + offset])
    }
    offset = offset + neq
    console.log(" maxValue_eigv[iKomb - 1][ieigv-1] = ", maxValue_eigv[iKomb - 1][ieigv - 1])
   }
  }

  Module._free(kstiff_ptr)
  Module._free(kstiff_sig_ptr)
  Module._free(eigenform_ptr)
  Module._free(omega_ptr)
 }
}
