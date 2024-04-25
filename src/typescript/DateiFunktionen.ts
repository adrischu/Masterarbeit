import { useSystemStore } from "@/stores/SystemStore"

/**Funktion zum Einlesen eines Systems aus einer Datei */
export function handleFileUpload(event: Event) {
 const systemStore = useSystemStore()
 const fileInput = event!.target as HTMLInputElement // Typumwandlung zu HTMLInputElement
 const file = fileInput.files?.[0] // Verwenden des optionalen Zugriffsoperators

 if (!file) return

 const reader = new FileReader()
 reader.onload = (e) => {
  const content = e.target?.result
  if (content) {
   const systemData = JSON.parse(content as string) // Parsen Sie die JSON-Daten
   systemStore.importSystem(systemData) // Aktualisieren Sie das System im Store
   console.log("System erfolgreich eingelesen. Neues System:", systemStore.system)
  }
 }
 reader.readAsText(file)
}

/** Funktion zum Speichern des Systems an einem benutzerdefinierten Speicherort */
export function saveSystemToFile() {
 const systemStore = useSystemStore()
 // Konvertiere das System in JSON
 const systemData = JSON.stringify(systemStore.exportSystem())

 // Erstelle einen neuen Blob mit den Systemdaten
 const blob = new Blob([systemData], { type: "application/json" })

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

 //-----------------------------------------------------------------------------------------------
 //  let lastFileHandleSVG = "documents"
 //  let currentFilenameSVG = "d2beam.svg"
 //  //let svg = svgElement;
 //  //console.log("svg", svg)
 //  const elem = document.getElementById("svg-komponente") as any

 //  if (elem) {
 //   // svg = svg.replace(/\r?\n|\r/g, "").trim();
 //   // svg = svg.substring(0, svg.indexOf("</svg>")) + "</svg>";
 //   // // @ts-ignore
 //   // svg = svg.replaceAll("  ", "");

 //   // const preface = '<?xml version="1.0" standalone="no"?>\r\n';
 //   // const svgBlob = new Blob([preface, svg], { type: "image/svg+xml;charset=utf-8" });

 //   const svgBlob = new Blob([elem.innerHTML], { type: "image/svg+xml;charset=utf-8" }) //

 //   console.log("svgBlob.type", svgBlob.type)

 //   navigator.clipboard.writeText(elem.innerHTML) // für inkscape

 //   let filename: any = "d2beam.svg"

 //   if (app.hasFSAccess && app.isMac) {
 //    filename = window.prompt(
 //     "Name der Datei mit Extension, z.B. duennqs.svg\nDie Datei wird im Default Download Ordner gespeichert",
 //     "d2beam.svg",
 //    )
 //   } else if (app.hasFSAccess) {
 //    try {
 //     // @ts-ignore
 //     const fileHandle = await window.showSaveFilePicker({
 //      suggestedName: currentFilenameSVG,
 //      startIn: lastFileHandleSVG,
 //      types: [
 //       {
 //        description: "svg file",
 //        accept: { "text/plain": [".svg"] }, //   image/svg+xml (.svg)
 //       },
 //      ],
 //     })
 //     console.log("fileHandle SVG", fileHandle)
 //     lastFileHandleSVG = fileHandle
 //     currentFilenameSVG = fileHandle.name

 //     const fileStream = await fileHandle.createWritable()
 //     //console.log("fileStream=",fileStream);

 //     // (C) WRITE FILE
 //     await fileStream.write(svgBlob)
 //     await fileStream.close()
 //    } catch (error: any) {
 //     //alert(error.name);
 //     alert(error.message)
 //    }

 //    return
 //   }

 //   // für den Rest des Feldes

 //   try {
 //    saveAs(svgBlob, filename)
 //   } catch (error: any) {
 //    alert(error.message)
 //   }
 //  }
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
