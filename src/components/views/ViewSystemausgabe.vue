<template>
 <div>
  <h1>Materialien</h1>
  <v-data-table
   :items="systemStore.system.Materialliste"
   hide-default-header
   hide-default-footer
   class="elevation-1"
  ></v-data-table>

  <v-divider :thickness="5"></v-divider>

  <h1>Querschnitte</h1>
  <v-data-table
   :items="systemStore.system.Querschnittliste"
   items-per-page="-1"
   class="elevation-1"
   :hide-default-footer="true"
  ></v-data-table>

  <v-divider :thickness="5"></v-divider>

  <h1>Lager</h1>
  <v-data-table
   :items="systemStore.system.Lagerliste"
   items-per-page="-1"
   class="elevation-1"
   :hide-default-footer="true"
  ></v-data-table>

  <v-divider :thickness="5"></v-divider>

  <h1>Knoten</h1>
  <v-data-table
   :items="systemStore.system.Knotenliste"
   :hide-default-header="true"
   :hide-default-footer="true"
   disable-pagination
   items-per-page="-1"
   class="elevation-1"
  ></v-data-table>

  <v-divider :thickness="5"></v-divider>

  <h1>Stäbe</h1>
  <v-data-table
   :items="systemStore.system.Stabliste"
   items-per-page="-1"
   class="elevation-1"
   :hide-default-footer="true"
  ></v-data-table>
  <h1></h1>
 </div>
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"

 const systemStore = useSystemStore()
</script>
