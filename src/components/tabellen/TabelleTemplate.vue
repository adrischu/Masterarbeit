<template>
  <div>
    <v-table class="tabelle-input">
      <!-- Tabellenkopfzeile -->
      <thead>
        <tr>
          <th v-for="item in header(createNewObject())" :key="item.id">
            <span>{{ item.id }}</span>
            <span v-if="item.einheit">[{{ item.einheit }}]</span>
          </th>
        </tr>
      </thead>

      <!-- Tabelleninhalt -->
      <tbody>
        <!-- Erste Zeile zum Hinzufügen -->
        <tr class="zeile-objektHinzufügen">
          <td v-for="item in header(newObject)" :key="item.id">
            <input v-model="item.value" />
          </td>
          <td>
            <v-btn color="green">Dazu</v-btn>
          </td>
        </tr>

        <!-- Andere Zeilen für Inhalt -->
        <tr v-for="object in objectlist" :key="object.Nummer">
          <!-- <component v-if="!component === null" :is="component"></component> -->
          <td v-for="item in header(object)" :key="item.id">
            <input v-model="item.value" />
          </td>
          <td>
            <v-btn color="red">Weg</v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts">
import type Knoten from '@/typescript/classes/Knoten'
import type Stab from '@/typescript/classes/Stab'

type StatikObject = Knoten | Stab

const props = defineProps<{
  objectlist: StatikObject[]
  createNewObject: () => StatikObject
  header: (item: any) => {
    //TODO: Lösung finden. Type "any" ist nicht zufriedenstellen. Type "object" funkionert aus irgendeinem Grund nicht.
    id: string
    einheit: string
    value: string | number
    component: string | null
  }[]
}>()

const newObject = props.createNewObject()
</script>
