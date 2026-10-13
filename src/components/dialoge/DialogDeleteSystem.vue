<template>
 <v-dialog
  max-width="300px"
  transition="dialog-bottom-transition"
  v-model="dialog"
 >
  <template v-slot:activator="{ props: activatorProps }">
   <v-list-item
    v-bind="activatorProps"
    prepend-icon="mdi-trash-can-outline"
    title="Neues System (alles löschen)"
   />
  </template>
  <v-card
   text="Soll das aktuelle System wirklich gelöscht werden? (Rückgängig ist möglich.)"
   title="Achtung!"
  >
   <template v-slot:actions>
    <v-spacer></v-spacer>

    <v-btn @click="handleAccept"> OK </v-btn>

    <v-btn @click="dialog = false"> Zurück </v-btn>
   </template>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
 import { ref } from "vue"

 const emit = defineEmits<{
  (event: "accept-delete"): void
 }>()

 function handleAccept() {
  emit("accept-delete")
  dialog.value = false
 }

 let dialog = ref(false)
</script>
