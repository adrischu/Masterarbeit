import "./assets/main.css"

import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"

// Vuetify
import "vuetify/styles"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import "@mdi/font/css/materialdesignicons.css" // Ensure you are using css-loader
import MathJax, { initMathJax, renderByMathjax } from "mathjax-vue3"

//MathJax
function onMathJaxReady() {
 const el = document.getElementById("elementId")
 renderByMathjax(el)
}

initMathJax({}, onMathJaxReady)

const vuetify = createVuetify({
 components,
 directives,
 theme: {
  defaultTheme: "light",
 },
 icons: {
  defaultSet: "mdi", // This is already the default value - only for display purposes
 },
})

const app = createApp(App)

app.use(vuetify)

app.use(MathJax)

// app.use(createPinia()) //Wenn die Zeile wie hier aufgeteilt wird, erscheint der Pinia-Tab in Vue-Inspect (F12) nicht...

app.use(createPinia()).mount("#app")
