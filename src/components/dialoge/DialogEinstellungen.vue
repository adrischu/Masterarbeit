<template>
 <v-dialog
  v-model="dialog"
  transition="dialog-bottom-transition"
  fullscreen
 >
  <v-card>
   <v-toolbar
    density="compact"
    color="green-lighten-4"
    elevation="4"
   >
    <v-toolbar-title>Einstellungen</v-toolbar-title>
    <v-spacer></v-spacer>

    <v-toolbar-items>
     <v-btn
      icon="mdi-close"
      @click="dialog = false"
     ></v-btn>
    </v-toolbar-items>
   </v-toolbar>

   <v-list
    lines="one"
    subheader
   >
    <v-list-subheader>Berechnung</v-list-subheader>
    <v-list-item>
     <v-text-field
      type="number"
      label="Stabkennzahl ε, unter der statt des trig. Ansatzes der kubische verwendet wird"
      hint="0 = nie (empfohlen). Der trigonometrische Ansatz ist inzwischen für alle ε numerisch stabil."
      persistent-hint
      v-model.number="settings.minEpsilon"
     />
    </v-list-item>

    <v-list-item>
     <v-text-field
      type="number"
      label="maximale Anzahl an Iterationen für Th.2.Ordnung"
      v-model.number="settings.maxIterationen"
     />
    </v-list-item>

    <v-list-item>
     <v-text-field
      type="number"
      label="Fehler für Abbruchkriterium bei Iteration nach Th. 2 Ordnung"
      v-model.number="settings.maxIterationsFehler"
     />
    </v-list-item>

    <v-divider></v-divider>
    <v-list-subheader>Darstellung</v-list-subheader>
    <v-list-item
     title="Schnittgrößenbezug für Theorie II. Ordnung"
     subtitle="Schnittgrößen aus das verformte System beziehen? (löscht Ergebnisse)"
     ><template v-slot:prepend>
      <v-list-item-action start>
       <v-checkbox-btn
        v-model="settings.schnittgrößenAufVerformtesSystemBeziehen"
        @click="ergebnisseLöschen(systemStore.system)"
       ></v-checkbox-btn>
      </v-list-item-action>
     </template>
    </v-list-item>

    <!-- Einheiten anzeigen -->
    <v-list-item
     title="Einheitenanzeige"
     subtitle="Einheitentexte für Lasten und Ergebnisse anzeigen?"
     ><template v-slot:prepend>
      <v-list-item-action start>
       <v-checkbox-btn v-model="graphicSettings.EINHEIT_SHOW"></v-checkbox-btn>
      </v-list-item-action>
     </template>
    </v-list-item>

    <!-- Nachkomkmastellen Ergebnisse -->
    <v-list-item>
     <v-text-field
      type="number"
      label="Nachkommastellen Ergebnisse"
      v-model.number="graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN"
    /></v-list-item>

    <!-- Nachkommastellen Lasten -->
    <v-list-item>
     <v-text-field
      type="number"
      label="Nachkommastellen Lasten"
      v-model.number="graphicSettings.NACHKOMMASTELLEN_LASTWERTE"
    /></v-list-item>

    <!-- Skalierungen -->
    <v-list-item>
     <v-slider
      v-model="graphicSettings.SKALIERUNG_SCHNITTGROESSEN"
      label="Skalierung Schnittgrößen"
      :min="0.1"
      :max="3"
      :step="0.1"
      thumb-label
      hide-details
     />
    </v-list-item>
    <v-list-item>
     <v-slider
      v-model="graphicSettings.SKALIERUNG_VERFORMUNGEN"
      label="Skalierung Verformungen"
      :min="0.1"
      :max="3"
      :step="0.1"
      thumb-label
      hide-details
     />
    </v-list-item>

    <v-divider></v-divider>
    <v-list-subheader>Entwicklung</v-list-subheader>
    <v-list-item
     title="Debug-Ausgabe"
     subtitle="Matrizen und Vektoren jeder Iteration in der Browser-Konsole ausgeben (langsamer)"
     ><template v-slot:prepend>
      <v-list-item-action start>
       <v-checkbox-btn v-model="settings.debug"></v-checkbox-btn>
      </v-list-item-action>
     </template>
    </v-list-item>
   </v-list>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
 import { computed } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import { useSettingsStore } from "@/stores/SettingsStore"
 import { useSystemStore } from "@/stores/SystemStore"
 import { ergebnisseLöschen } from "@/typescript/berechnungen"

 const graphicSettings = useGraphicSettingsStore()
 const settings = useSettingsStore()
 const systemStore = useSystemStore()

 /** Sichtbarkeit (v-model des Elternelements) */
 const props = defineProps<{ modelValue: boolean }>()
 const dialog = computed({
  get: () => props.modelValue,
  set: (wert: boolean) => emit("update:modelValue", wert),
 })
 const emit = defineEmits<{ (e: "update:modelValue", wert: boolean): void }>()
</script>
