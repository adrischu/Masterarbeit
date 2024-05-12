<template>
 <v-dialog
  v-model="dialog"
  transition="dialog-bottom-transition"
  fullscreen
 >
  <template v-slot:activator="{ props: activatorProps }">
   <!-- <v-btn
    icon="mdi-book-open-variant"
    v-bind="activatorProps"
   ></v-btn> -->
   <v-btn v-bind="activatorProps">Handbuch</v-btn>
  </template>

  <v-card>
   <v-toolbar
    density="compact"
    class="action-fields"
    color="green-lighten-4"
    elevation="10"
    :border="true"
   >
    <v-toolbar-title>Handbuch</v-toolbar-title>
    <v-spacer></v-spacer>

    <v-toolbar-items>
     <v-btn
      icon="mdi-close"
      @click="dialog = false"
     ></v-btn>
    </v-toolbar-items>
   </v-toolbar>

   <v-card-item>
    <math-jax
     :latex="`x_a+y^2`"
     :block="true"
    ></math-jax
   ></v-card-item>
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
