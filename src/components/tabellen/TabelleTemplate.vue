<template>
  <div>
    <v-table class="eingabetabelle-tabelle">
      <!--  -->
      <!-- Tabellenkopfzeile -->
      <!--  -->
      <thead>
        <tr>
          <th v-for="headerItem in newStatikObjekt.header" :key="headerItem.id">
            <div>{{ headerItem.id }}</div>
            <div v-if="headerItem.einheit">[{{ headerItem.einheit }}]</div>
          </th>
        </tr>
      </thead>

      <!-- Tabelleninhalt -->
      <tbody>
        <!--  -->
        <!-- Erste Zeile zum Hinzufügen -->
        <!--  -->
        <tr class="eingabetabelle-ersteZeile">
          <td v-for="(headerItem, itemIndex) in newStatikObjekt.header" :key="itemIndex">
            <!-- Falls normaler Input vorhanden -->
            <input
              v-if="headerItem.inputType === 'fixed' || headerItem.inputType === 'input'"
              :type="headerItem.inputFormat"
              v-model="newObjectValues[itemIndex]"
            />
            <!-- Falls DropDownBox vorhanden -->
            <select v-if="headerItem.inputType === 'select'" v-model="newObjectValues[itemIndex]">
              <option
                v-for="selectItem in headerItem.selectList"
                :key="selectItem"
                :value="selectItem"
              >
                {{ selectItem }}
              </option>
            </select>
            <!-- Falls Checkbox vorhanden -->
            <v-checkbox-btn
              v-if="headerItem.inputType === 'checkbox'"
              v-model="newObjectValues[itemIndex]"
            ></v-checkbox-btn>
          </td>
          <td>
            <v-btn @click="handleAdd" color="green">Dazu</v-btn>
          </td>
        </tr>

        <!--  -->
        <!-- Andere Zeilen für Inhalt -->
        <!--  -->
        <tr v-for="(object, objectIndex) in data" :key="object[0]">
          <td v-for="(headerItem, itemIndex) in object" :key="itemIndex">
            <!-- Falls nicht veränderbar -->
            <span v-if="objectlist[objectIndex].header[itemIndex].inputType === 'fixed'">
              {{ data[objectIndex][itemIndex] }}
            </span>
            <!-- Falls normaler Input vorhanden -->
            <input
              v-if="objectlist[objectIndex].header[itemIndex].inputType === 'input'"
              :type="objectlist[objectIndex].header[itemIndex].inputFormat"
              v-model="data[objectIndex][itemIndex]"
              @focusout="handleEdit(object, objectIndex)"
            />
            <!-- Falls DropDownBox vorhanden -->
            <select
              v-if="objectlist[objectIndex].header[itemIndex].inputType === 'select'"
              v-model="data[objectIndex][itemIndex]"
              @focusout="handleEdit(object, objectIndex)"
            >
              <option :value="data[objectIndex][itemIndex]">
                {{ data[objectIndex][itemIndex] }}
              </option>
              <option
                v-for="selectItem in objectlist[objectIndex].header[itemIndex].selectList"
                :key="selectItem"
                :value="selectItem"
              >
                {{ selectItem }}
              </option>
            </select>
            <!-- Falls Checkbox vorhanden -->
            <v-checkbox-btn
              v-if="objectlist[objectIndex].header[itemIndex].inputType === 'checkbox'"
              v-model="data[objectIndex][itemIndex]"
              @change="handleEdit(object, objectIndex)"
            ></v-checkbox-btn>
          </td>
          <td>
            <!-- <v-btn @click="handleEdit(object, objectIndex)" color="blue">Ändern</v-btn> -->
            <v-btn @click="handleDelete(objectIndex)" color="red">Weg</v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type Ref } from 'vue'
import type { isStatikobjekt } from '@/typescript/classes/interfaceStatikobjekt'

const props = defineProps<{
  objectlist: isStatikobjekt[]
  createNewObject: () => isStatikobjekt
}>()

const emit = defineEmits<{
  deleteStatikObjekt: [objektindex: number]
  addStatikObjekt: [statikobjekt: isStatikobjekt]
  editStatikObjekt: [statikobjekt: any[], objektindex: number]
}>()

let newStatikObjekt: isStatikobjekt = props.createNewObject()

let newObjectValues: Ref<any[]> = ref(newStatikObjekt.values) //Ref<any[]> = ref([newStatikObjekt.values])

let data: Ref<any[]> = ref([])

updateData()

//
//Functions
//
function updateData() {
  data.value = []
  props.objectlist.forEach(function (statikobjekt) {
    data.value.push(statikobjekt.values)
  })
}

function handleAdd() {
  newStatikObjekt.values = newObjectValues.value
  emit('addStatikObjekt', newStatikObjekt)
  newStatikObjekt = props.createNewObject()
  //Hier könnte ein Callback für Fehlermeldungen eingebaut werden.
  updateData()
}

function handleEdit(objectData: any[], index: number) {
  emit('editStatikObjekt', objectData, index)
  updateData()
}

function handleDelete(index: number) {
  emit('deleteStatikObjekt', index)
  updateData()
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
