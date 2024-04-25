<template>
 <v-dialog
  max-width="500px"
  transition="dialog-bottom-transition"
  v-model="dialog"
 >
  <v-card>
   <v-card-title>Achtung</v-card-title>
   <v-card-text>Bitte erst Eingabefehler beheben, bevor die Berechnung gestartet wird.</v-card-text>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
 import { ref } from "vue"

 let dialog = ref(true)
</script>
