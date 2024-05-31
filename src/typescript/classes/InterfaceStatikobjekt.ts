import type { isEinheit } from "./InterfaceEinheit"

export interface isStatikobjekt {
 Nummer: number
 Typ: string

 get values()

 set values(values: any)

 get header(): {
  /**Angezeigter Name im Tabellenkopf */
  title: string
  /**Angezeigte Einheit im Tabellenkopf. */
  unit?: isEinheit
  /**Angezeigter Wert im Tabellenkörper. */
  value: string | number | boolean
  /**Eingabetyp. Der Wert kann auf vier verschiedene Arten in der Tabelle dargestellt werden. */
  inputType: string | "fixed" | "input" | "select" | "checkbox"
  /**Hier kann eine Bedingung mitgegeben werden, bei deren Eintreten die Eingabe verhindert wird. */
  disabled?: boolean
  /**Hier kann ein Text mitgegeben werden, der als Tooltip in Tabellenkopf angezeigt wird. */
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
