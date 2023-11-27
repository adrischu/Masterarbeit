<template>
 <div>
  <v-table
   class="eingabetabelle-tabelle"
   density="compact"
  >
   <!--  -->
   <!-- Tabellenkopfzeile -->
   <!--  -->
   <thead>
    <tr>
     <th
      v-for="headerItem in newStatikObjekt.header"
      :key="headerItem.id"
     >
      <span v-html="headerItem.id"></span>
      <span v-if="headerItem.einheit"> [{{ headerItem.einheit }}]</span>
     </th>
    </tr>
   </thead>

   <!-- Tabelleninhalt -->
   <tbody>
    <!--  -->
    <!-- Erste Zeile zum Hinzufügen -->
    <!--  -->
    <tr class="eingabetabelle-ersteZeile">
     <td
      v-for="(headerItem, itemIndex) in newStatikObjekt.header"
      :key="itemIndex"
     >
      <!-- Falls normaler Input vorhanden -->
      <input
       v-if="headerItem.inputType === 'fixed' || headerItem.inputType === 'input'"
       :type="headerItem.inputFormat"
       v-model="newObjectValues[itemIndex]"
      />
      <!-- Falls DropDownBox vorhanden -->
      <select
       v-if="headerItem.inputType === 'select'"
       v-model="newObjectValues[itemIndex]"
      >
       <option
        v-for="(selectItem, selectIndex) in headerItem.selectListKeys"
        :key="selectItem"
        :value="headerItem.selectListValues![selectIndex]"
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
      <v-btn
       @click="handleAdd"
       icon
       color="green"
       size="x-small"
       ><v-icon>mdi-plus</v-icon
       ><v-tooltip
        activator="parent"
        location="end"
        open-delay="500"
       >
        {{ newStatikObjekt.constructor.name }} hinzufügen
       </v-tooltip></v-btn
      >
     </td>
    </tr>

    <!--  -->
    <!-- Andere Zeilen für Inhalt -->
    <!--  -->
    <tr
     v-for="(object, objectIndex) in data"
     :key="object[0]"
    >
     <td
      v-for="(headerItem, itemIndex) in object"
      :key="itemIndex"
     >
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
        v-for="(selectItem, selectIndex) in objectlist[objectIndex].header[itemIndex]
         .selectListKeys"
        :key="selectItem"
        :value="objectlist[objectIndex].header[itemIndex].selectListValues![selectIndex]"
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
      <v-btn
       @click="handleDelete(objectIndex)"
       icon
       color="red"
       size="x-small"
       ><v-icon>mdi-minus</v-icon
       ><v-tooltip
        activator="parent"
        location="end"
        open-delay="500"
       >
        {{ newStatikObjekt.constructor.name }} entfernen
       </v-tooltip></v-btn
      >
     </td>
    </tr>
   </tbody>
  </v-table>
 </div>
</template>

<script setup lang="ts">
 import { ref } from "vue"
 import { type Ref } from "vue"
 import type { isStatikobjekt } from "@/typescript/classes/InterfaceStatikobjekt.js"
 import { useSystemStore } from "@/stores/SystemStore"

 const props = defineProps<{
  objectlist: isStatikobjekt[]
  createNewObject: (index: number) => isStatikobjekt
 }>()

 const systemStore = useSystemStore()

 let newStatikObjekt: isStatikobjekt = props.createNewObject(firstEmptyId())

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
  newObjectValues.value = newStatikObjekt.values
 }

 function handleAdd() {
  systemStore.system.addStatikobjekt(newStatikObjekt.constructor.name, newObjectValues.value)
  console.log(`${newStatikObjekt.constructor.name} hinzugefügt`)
  newStatikObjekt = props.createNewObject(firstEmptyId())
  updateData()
 }

 function handleEdit(objectData: any[], index: number) {
  systemStore.system.editStatikobjekt(newStatikObjekt.constructor.name, objectData, index)
  console.log(`${newStatikObjekt.constructor.name} geändert`)
  updateData()
 }

 function handleDelete(index: number) {
  systemStore.system.deleteStatikobjekt(newStatikObjekt.constructor.name, index)
  console.log(`${newStatikObjekt.constructor.name} gelöscht`)
  updateData()
 }

 function firstEmptyId(): number {
  let index: number = 1
  for (let statikobjekt of props.objectlist) {
   if (index !== statikobjekt.Nummer) {
    break
   }
   index++
  }
  return index
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
