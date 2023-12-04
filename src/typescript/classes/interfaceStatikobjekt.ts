export interface isStatikobjekt {
 Nummer: number

 get values()

 set values(values: any)

 get header(): {
  id: string //Angezeigter Name im Tabellenkopf
  einheit: string //Angezeigte Einheit im Tabellenkopf
  value: string | number | boolean //Angezeigter Wert im Tabellenkörper
  inputType: string | "fixed" | "input" | "select" | "checkbox" //Eingabetyp
  //Für inputType = 'input'
  inputFormat?: string //Eingabeformat, (nur für inputType=input)
  //FÜr inputType = 'select'
  selectListKeys?: any[] //Mitgegebene Liste für Combobox (nur falls inputType=select)
  selectListValues?: any[]
 }[]
}
