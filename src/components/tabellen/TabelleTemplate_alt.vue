<template>
  <div>
    <v-table class="eingabetabelle-tabelle">
      <!--  -->
      <!-- Tabellenkopfzeile -->
      <!--  -->
      <thead>
        <tr>
          <th v-for="item in createHeader(createNewObject())" :key="item.id">
            <div>{{ item.id }}</div>
            <div v-if="item.einheit">[{{ item.einheit }}]</div>
          </th>
        </tr>
      </thead>

      <!-- Tabelleninhalt -->
      <tbody>
        <!--  -->
        <!-- Erste Zeile zum Hinzufügen -->
        <!--  -->
        <tr class="eingabetabelle-ersteZeile">
          <td v-for="item in createHeader(newStatikObjekt)" :key="item.id">
            <!-- Falls normaler Input vorhanden -->
            <input v-if="!item.selectList" :type="item.inputType" v-model="item.value" />
            <!-- Falls DropDownBox vorhanden -->
            <select v-if="item.selectList" v-model="item.value">
              <option v-for="StatikObjekt in item.selectList" :key="StatikObjekt.Nummer" value="">
                {{ StatikObjekt.Nummer }}
              </option>
            </select>
          </td>
          <td>
            <v-btn @click="handleAdd(newStatikObjekt)" color="green">Dazu</v-btn>
          </td>
        </tr>

        <!--  -->
        <!-- Andere Zeilen für Inhalt -->
        <!--  -->
        <tr v-for="(object, index) in objectlist" :key="object.Nummer">
          <td v-for="item in createHeader(object)" :key="item.id">
            <!-- Falls normaler Input vorhanden -->
            <input v-if="!item.selectList" :type="item.inputType" v-model="item.value" />
            <!-- Falls DropDownBox vorhanden -->
            <select v-if="item.selectList" v-model="item.value">
              <option v-for="StatikObjekt in item.selectList" :key="StatikObjekt.Nummer" value="">
                {{ StatikObjekt.Nummer }}
              </option>
            </select>
          </td>
          <td>
            <v-btn @click="handleEdit(object, index)" color="blue">Ändern</v-btn>
            <v-btn @click="handleDelete(index)" color="red">Weg</v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts">
import type Knoten from '@/typescript/classes/Knoten'
import type Stab from '@/typescript/classes/Stab'

type StatikObjekt = Knoten | Stab

type header = {
  id: string
  einheit: string
  value: string | number
  inputType: string
  selectList?: StatikObjekt[]
}

const props = defineProps<{
  objectlist: StatikObjekt[]
  createNewObject: () => StatikObjekt
  createHeader: (item: any) => header[] //TODO: Lösung finden. Type "any" ist nicht zufriedenstellen. Type "object" funkionert aus irgendeinem Grund nicht.
}>()

const emit = defineEmits<{
  deleteStatikObjekt: [objektindex: number]
  addStatikObjekt: [statikobjekt: StatikObjekt]
  editStatikObjekt: [statikobjekt: StatikObjekt, objektindex: number]
}>()

let newStatikObjekt = props.createNewObject()

let headers: header[][]

props.objectlist.forEach(function (statikobjekt) {
  headers.push(props.createHeader(statikobjekt))
})

//Functions
function handleAdd(object: StatikObjekt) {
  emit('addStatikObjekt', object)
  newStatikObjekt = props.createNewObject()
}

function handleEdit(object: StatikObjekt, index: number) {
  console.log('Verändertes Objekt: ', object)

  emit('editStatikObjekt', object, index)
}

function handleDelete(index: number) {
  emit('deleteStatikObjekt', index)
}
</script>

<style scoped>
.eingabetabelle-ersteZeile {
  background-color: rgb(142, 255, 142);
  height: 10px;
}

.eingabetabelle-datenZeilen {
  height: 50px;
}

.eingabetabelle-tabelle,
thead {
  text-align: center;
  border: #646262 solid;
  border-width: 1px;
  border-width: 2px;
  margin: 15px;
  padding: 0px;
}

td,
th {
  text-align: center;
  align-items: center;
  border: #646262 solid;
  border-width: 1px;
}

thead {
  padding: 0;
  text-align: center;
}

select {
  width: 100px;
}
</style>
