# **SETUP**

---

# 1. ORDNER-GERÜST AUFBAUEN (SCAFFOLDING)

Eine ausführliche Anleitung mit Hintergründen kann [hier](https://vuejs.org/guide/quick-start.html#local) gefunden werden. Im folgenden wird der Vorgang kurz zusammengefasst.

1. Kommandozeile öffnen und mit `cd` in Ordnerpfad für VSCode-Projekte navigieren.
2. Mit `npm create vue@latest` Projekt-Gerüst erstellen lassen.
3. Abfragen einzeln beantworten (hier Vorschlag).

- Project name: `vue-vite-typescript-shoelace-template`
- Add Typescript support: `Yes`
- Add JSX support: `No`
- Add Vue Router: `No`
- Add Pinia: `No`
- Add Vitest: `Yes`
- Add End-to-End Testing Solution: `No`
- Add ESLint: `Yes`
- Add Prettier: `Yes`

3. Mit `cd vue-vite-typescript-shoelace-template` in Projektordner wechseln (Name muss angepasst werden).
4. Mit `npm install` alle Abhängigkeiten installieren (dauert einige Minuten (ca 10)).
5. Mit `code .` Projekt in VSCode öffnen.
6. Mit `npm run dev` Projekt im Development-Server testen.

# VUETIFY IMPLEMENTIEREN

In der Kommandozeile im Projektordner folgenden Befehl eingeben:

```Shell
npm i vuetify
```

In **main.ts** folgenden Code hinzufügen:

```ts
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives
})

app.use(vuetify)
```

Nähere Informationen sind auf der [Seite von Vuetify](https://vuetifyjs.com/en/getting-started/installation/#existing-projects) unter dem Reiter **Existing Projects** zu finden zu finden.

# SHOELACE IMPLEMENTIEREN

Die Anleitung zum Implementieren von Shoelace in ein Vue-Projekt kann [hier](https://shoelace.style/frameworks/vue) gefunden werden.
Im weiteren werden Abschnitte daraus hier aufgelistet.

## Shoelace in den Projektordner laden

In der Kommandozeile in den Projektordner navigieren folgenden Befehl eingeben:

```shell
$npm install @shoelace-style/shoelace
```

## Nutzen eines Shoelace Themes

In **main.ts** folgende Code-Zeile eingeben:

```ts
import '@shoelace-style/shoelace/dist/themes/light.css'
```

Um das Dark-Theme von Shoelace zu nutzen müssen zwei Schritte befolgt werden.

1. Das `...dark.css` anstelle von `...light.css` importieren
2. In **index.html** dem HTML-Element die Klasse `sl-theme-dark` hinzufügen.

## Setzen des Basis-Pfads für Shoelace-Komponenten

In **main.ts** folgende Code-Zeilen eingeben:

```ts
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'
setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.11.2/cdn/')
```

## SHOELACE KOMPONENTEN MÜSSEN VON VUE IGNORIERT WERDEN

In **vite.config.ts** folgenden code anstelle von `HIER` in `export default defineConfig({plugins:[vue(HIER)]})` hinzufügen:

```ts
template: {
  compilerOptions: {
    isCustomElement: (tag) => tag.startsWith('sl-')
  }
}
```

Danach sollte es so aussehen:

```ts
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('sl-')
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

## Implementieren einer Shoelace Komponente (Beispielhaft für sl-button)

In **main.ts** folgende Code-Zeile einfügen:

```ts
//Button
import '@shoelace-style/shoelace/dist/components/button/button.js'
```

# BUG-FIXES

## Bug-Fix für Fehlermeldung in VSCode

In **tsconfig.json** innerhalb von `"compileroptions":{HIER}` folgende Code-Zeile anstelle von `HIER` einfügen:

```json
  "types": ["vite/client"]
```

## ESLint erzeugt falsche Fehlermeldungen bei der 'slot'-Property

In **.eslintrc.cjs** innerhalb von `module exports{HIER}` folgende Code-Zeile anstelle von `HIER` einfügen:

```cjs
rules: {
'vue/no-deprecated-slot-attribute': 'off',
}
```

## Fehlermeldung in **tsconfig.app.json**

Neue Datei **.hintrc** im Hauptordner hinzufügen, mit folgendem Code:

```json
{
  "extends": ["development"],
  "hints": {
    "typescript-config/is-valid": "off",
    "typescript-config/consistent-casing": "off",
    "typescript-config/strict": "off"
  }
}
```

## Extension 'Code Runner' funktioniert nicht mit Typescrit

Problem wurde auf [StackOverFlow](https://stackoverflow.com/questions/74108060/how-to-configure-coderunner-extension-to-execute-ts) schon gelöst.
