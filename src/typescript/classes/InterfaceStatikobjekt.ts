import type { isEinheit } from "./InterfaceEinheit"

export interface isStatikobjekt {
 Nummer: number
 Typ: string

 get values()

 set values(values: any)

 get header(): {
  title: string //Angezeigter Name im Tabellenkopf
  unit?: isEinheit //Angezeigte Einheit im Tabellenkopf
  einheitTest?: isEinheit
  value: string | number | boolean //Angezeigter Wert im Tabellenkörper
  inputType: string | "fixed" | "input" | "select" | "checkbox" //Eingabetyp
  disabled?: boolean //Ein Boolean der mitgegeben werden kann und die Eingabe verhindert
  tooltip?: string //Tooltip im HTML Format
  //Für inputType = 'input'
  inputFormat?: string //Eingabeformat, (nur für inputType=input)
  //FÜr inputType = 'select'
  /**Liste der Werte die in der DropdownBox angezeigt werden. */
  selectListKeys?: any[] //Mitgegebene Liste für Combobox (nur falls inputType=select)
  /**Liste der Werte die gespeichert werden können. */
  selectListValues?: any[] //Liste der jeweiligen Werte zur Anzeige in der Combobox
 }[]
}
