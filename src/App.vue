<template>
  <v-tabs v-model="tab" bg-color="grey">
    <v-tab value="start">Start</v-tab>
    <v-tab value="systemeingabe">Systemeingabe</v-tab>
    <v-tab value="lasteingabe">Lasteingabe</v-tab>
  </v-tabs>

  <v-window v-model="tab">
    <v-window-item value="start" transition="false" reverse-transition="false">
      Hier ist der Startbildschirm.
    </v-window-item>

    <v-window-item value="systemeingabe" transition="false" reverse-transition="false">
      Hier ist die Systemeingabe.
    </v-window-item>

    <v-window-item value="lasteingabe" transition="false" reverse-transition="false">
      Hier ist die Lasteingabe.
    </v-window-item>
  </v-window>
</template>

<script setup lang="ts">
import { ref } from 'vue'

let tab = ref<Number>()
</script>

<style scoped>
* {
  text-transform: none !important;
}
</style>
