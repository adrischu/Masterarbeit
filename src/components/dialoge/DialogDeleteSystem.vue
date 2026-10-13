<template>
 <v-dialog
  max-width="300px"
  transition="dialog-bottom-transition"
  v-model="dialog"
 >
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
 import { computed } from "vue"

 /** Sichtbarkeit (v-model des Elternelements) */
 const props = defineProps<{ modelValue: boolean }>()
 const emit = defineEmits<{
  (event: "accept-delete"): void
  (event: "update:modelValue", wert: boolean): void
 }>()
 const dialog = computed({
  get: () => props.modelValue,
  set: (wert: boolean) => emit("update:modelValue", wert),
 })

 function handleAccept() {
  emit("accept-delete")
  dialog.value = false
 }
</script>
