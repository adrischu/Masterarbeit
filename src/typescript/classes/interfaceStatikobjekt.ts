export interface isStatikobjekt {
  id: number

  get values(): (string | number)[]

  set values(values: any[])

  get header(): {
    id: string
    einheit: string
    value: string | number | boolean
    inputType: string | 'fixed' | 'input' | 'select'
    inputFormat?: string
    selectList?: any[]
  }[]
}
