export interface isStatikobjekt {
 Nummer: number
 Typ: string

 get values()

 set values(values: any)

 get header(): {
  title: string //Angezeigter Name im Tabellenkopf
  unit?: string //Angezeigte Einheit im Tabellenkopf
  value: string | number | boolean //Angezeigter Wert im Tabellenkörper
  inputType: string | "fixed" | "input" | "select" | "checkbox" //Eingabetyp
  disabled?: boolean //Ein Boolean der mitgegeben werden kann und die Eingabe verhindert
  tooltip?: string //Tooltip im HTML Format
  //Für inputType = 'input'
  inputFormat?: string //Eingabeformat, (nur für inputType=input)
  //FÜr inputType = 'select'
  selectListKeys?: any[] //Mitgegebene Liste für Combobox (nur falls inputType=select)
  selectListValues?: any[] //Liste der jeweiligen Werte zur Anzeige in der Combobox
 }[]
}
