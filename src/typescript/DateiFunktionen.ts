import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
import { useSettingsStore } from "@/stores/SettingsStore"
import { useSystemStore } from "@/stores/SystemStore"

/**Funktion zum Einlesen eines Systems aus einer Datei */

export function handleFileUpload(event: Event): FileReader | undefined {
 const systemStore = useSystemStore()
 const fileInput = event!.target as HTMLInputElement // Typumwandlung zu HTMLInputElement
 const file = fileInput.files?.[0] // Verwenden des optionalen Zugriffsoperators
 if (!file) return
 const reader = new FileReader()
 reader.onload = (e) => {
  const content = e.target?.result
  if (content) {
   const saveData = JSON.parse(content as string) // Parsen Sie die JSON-Daten
   systemStore.importSystem(saveData.system) // Aktualisieren Sie das System im Store
   useSettingsStore().$state = saveData.settings
   useGraphicSettingsStore().$state = saveData.graphicSettings
   console.log("System erfolgreich eingelesen. Neues System:", systemStore.system)
  }
 }
 reader.readAsText(file)
 return reader
}

/** Funktion zum Speichern des Systems an einem benutzerdefinierten Speicherort */
export function saveSystemToFile() {
 const systemStore = useSystemStore()
 // Konvertiere das System in JSON
 //  const systemData = JSON.stringify(systemStore.exportSystem())
 const saveData = {
  system: systemStore.exportSystem(),
  settings: useSettingsStore().$state,
  graphicSettings: useGraphicSettingsStore().$state,
 }
 const jsonData = JSON.stringify(saveData)
 // Erstelle einen neuen Blob mit den Systemdaten
 const blob = new Blob([jsonData], { type: "application/json" })

 // Öffne den Dateidialog für den Benutzer
 const link = document.createElement("a")
 link.href = window.URL.createObjectURL(blob)
 link.download = "system.json" // Standarddateiname
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
}

export async function alsSVGSpeichern() {
 const svg = document!.getElementById("grafik-fenster")!.innerHTML
 console.log(svg)
 const blob = new Blob([svg.toString()], { type: "image/svg+xml;charset=utf-8" })
 const element = document.createElement("a")
 element.download = "statiksystem.svg"
 element.href = window.URL.createObjectURL(blob)
 element.click()
 element.remove()
}

export function alsPNGSpeichern() {
 const createStyleElementFromCSS = () => {
  // assume index.html loads only one CSS file in <header></header>
  const sheet = document.styleSheets[0]

  const styleRules = []
  for (let i = 0; i < sheet.cssRules.length; i++) styleRules.push(sheet.cssRules.item(i)!.cssText)

  const style = document.createElement("style")
  style.type = "text/css"
  style.appendChild(document.createTextNode(styleRules.join(" ")))

  return style
 }

 const svg = document!.getElementById("grafik-fenster")!
 const svgData = svg.innerHTML

 // CSS must be explicitly embedded
 const style = createStyleElementFromCSS()
 svg.insertBefore(style, svg.firstChild)

 const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })

 const url = URL.createObjectURL(svgBlob)

 const img = new Image()

 const canvas = document.createElement("canvas")
 const width = svg.scrollWidth
 const height = svg.scrollHeight
 canvas.setAttribute("width", String(width))
 canvas.setAttribute("height", String(height))

 const context = canvas.getContext("2d")
 context?.drawImage(img, 0, 0, width, height)

 URL.revokeObjectURL(url)

 const a = document.createElement("a")
 a.download = "image.png"
 document.body.appendChild(a)
 a.href = canvas.toDataURL()
 a.click()
 a.remove()
 //  })
}

export async function saveTextFile(text: string, fileName: string) {
 const blob = new Blob([text], { type: "text/plain" })
 const element = document.createElement("a")
 element.download = `${fileName}.txt`
 element.href = window.URL.createObjectURL(blob)
 element.click()
 element.remove()
}
