<template>
  <v-card>
    <v-tabs v-model="tab" bg-color="green">
      <v-tab value="start">Start</v-tab>
      <v-tab value="systemeingabe">Systemeingabe</v-tab>
      <v-tab value="lasteingabe">Lasteingabe</v-tab>
      <v-tab value="grafikausgabe">Grafikausgabe</v-tab>
      <v-tab value="handbuch">Handbuch</v-tab>
      <v-tab value="dev">Dev-Ausgabe</v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="start" transition="false" reverse-transition="false">
          <ViewStart></ViewStart>
        </v-window-item>
        <v-window-item value="systemeingabe" transition="false" reverse-transition="false">
          <ViewSystemeingabe></ViewSystemeingabe>
        </v-window-item>
        <v-window-item value="lasteingabe" transition="false" reverse-transition="false">
          <ViewLasteingabe></ViewLasteingabe>
        </v-window-item>
        <v-window-item value="grafikausgabe" transition="false" reverse-transition="false">
          <ViewGrafikausgabe></ViewGrafikausgabe>
        </v-window-item>
        <v-window-item value="handbuch" transition="false" reverse-transition="false">
          <ViewHandbuch></ViewHandbuch>
        </v-window-item>
        <v-window-item value="dev" transition="false" reverse-transition="false">
          <ViewDevAusgabe></ViewDevAusgabe>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ViewStart from './components/views/ViewStart.vue'
import ViewSystemeingabe from './components/views/ViewSystemeingabe.vue'
import ViewLasteingabe from './components/views/ViewLasteingabe.vue'
import ViewGrafikausgabe from './components/views/ViewGrafikausgabe.vue'
import ViewHandbuch from './components/views/ViewHandbuch.vue'
import ViewDevAusgabe from './components/views/ViewDevAusgabe.vue'
import { useSystemStore } from './stores/SystemStore'
import Knoten from './typescript/classes/Knoten'
import Vector from './typescript/classes/Vector'

const systemStore = useSystemStore()

//SETUP eines vorgeladenen Modells
systemStore.system.Knoten.push(new Knoten(1, new Vector(0, 0)))
systemStore.system.Knoten.push(new Knoten(2, new Vector(3, 4)))

let tab = ref<String>('start')
</script>
