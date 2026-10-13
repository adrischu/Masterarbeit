import type { isEinheit } from "./InterfaceEinheit"
import type System from "./System"

/** Beschreibung einer Tabellenspalte eines Statikobjekts */
export interface Spalte {
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
}

export interface isStatikobjekt {
 Nummer: number
 Typ: string

 /** Tabellenzeile in Anzeigeeinheiten */
 get values(): any[]

 set values(values: any)

 /**
  * Spaltendefinition für die Eingabetabelle. Das System wird übergeben, damit Auswahllisten
  * (z. B. vorhandene Knoten) ohne Zugriff auf einen Store erstellt werden können.
  */
 header(system: System): Spalte[]
}
