<template>
 <v-dialog
  v-model="dialog"
  transition="dialog-bottom-transition"
  fullscreen
 >
  <template v-slot:activator="{ props: activatorProps }">
   <v-btn
    icon="mdi-cog"
    v-bind="activatorProps"
   ></v-btn>
  </template>

  <v-card>
   <v-toolbar
    density="compact"
    class="action-fields"
    color="green-lighten-4"
    elevation="10"
    :border="true"
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
      label="minimale Stabkennzahl für trigonometrischen Ansatz"
      v-model="settings.minEpsilon"
     />
    </v-list-item>

    <v-list-item>
     <v-text-field
      type="number"
      label="maximale Anzahl an Iterationen für Th.2.Ordnung"
      v-model="settings.maxIterationen"
     />
    </v-list-item>

    <v-list-item>
     <v-text-field
      type="number"
      label="Fehler für Abbruchkriterium bei Iteration nach Th. 2 Ordnung"
      v-model="settings.maxIterationsFehler"
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
        @click="ergebnisseLöschen(system)"
       ></v-checkbox-btn>
      </v-list-item-action>
     </template>
    </v-list-item>
    <!-- Nachkomkmastellen Ergenisse -->
    <v-list-item>
     <v-text-field
      type="number"
      label="Nachkommastellen Ergebnisse"
      v-model="graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN"
    /></v-list-item>

    <!-- Nachkommastellen Lasten -->
    <v-list-item>
     <v-text-field
      type="number"
      label="Nachkommastellen Lasten"
      v-model="graphicSettings.NACHKOMMASTELLEN_LASTWERTE"
    /></v-list-item>

    <v-divider></v-divider>
   </v-list>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
 import { ref, type Ref } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import { useSettingsStore } from "@/stores/SettingsStore"
 import { useSystemStore } from "@/stores/SystemStore"
 import { ergebnisseLöschen } from "@/typescript/berechnungen"

 const graphicSettings = useGraphicSettingsStore()
 const settings = useSettingsStore()
 const system = useSystemStore().system

 let dialog: Ref<boolean> = ref(false)
</script>
