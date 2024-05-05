<template>
 <v-dialog
  max-width="300px"
  transition="dialog-bottom-transition"
  v-model="dialog"
 >
  <v-card>
   <v-card-title>Achtung</v-card-title>
   <v-card-text>
    Es sind vor oder während der Berechnung Fehler aufgetreten. Bitte in Tabellenreiter "Fehler"
    überprüfen.
   </v-card-text>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
 import { ref } from "vue"

 let dialog = ref(true)
</script>
