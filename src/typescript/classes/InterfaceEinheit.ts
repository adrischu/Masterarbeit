export interface isEinheit {
 /**Einheitentyp. zB "Spannung", "Kraft"... */
 typ: string
 /**Wert, der Ausgegeben werden kann. zB: "kN/m²" */
 text: string
 /**Wert mit dem die EInheit multipliziert werden muss damit SI-EInheiten entstehen */
 nachSI: number
 /**Wert mit dem eine SI-Einheit multipliziert werden muss damit die gewünschte Einheit entsteht. */
 vonSI: number
}
