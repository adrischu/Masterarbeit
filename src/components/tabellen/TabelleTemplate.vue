<template>
 <v-table
  class="eingabetabelle-tabelle"
  density="compact"
  hover
  fixed-header
  :height="tableHeight"
 >
  <!--  -->
  <!-- Tabellenkopfzeile -->
  <!--  -->
  <thead>
   <tr>
    <th
     v-for="headerItem in newStatikObjekt.header"
     :key="headerItem.title"
    >
     <span v-html="headerItem.title"></span>
     <span
      v-if="headerItem.unit"
      v-html="` [${headerItem.unit.text}]`"
     ></span>
     <v-btn
      v-if="headerItem.tooltip"
      icon
      color="rgb(255, 255, 80)"
      size="20"
      :active="false"
      ><v-icon>mdi-help</v-icon
      ><v-tooltip
       activator="parent"
       location="end"
       open-delay="500"
       ><div v-html="headerItem.tooltip"></div></v-tooltip
     ></v-btn>
    </th>
    <th></th>
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
      :disabled="headerItem.disabled"
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
      density="compact"
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
       {{ newStatikObjekt.Typ }} hinzufügen
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
      :disabled="objectlist[objectIndex].header[itemIndex].disabled"
     />
     <!-- Falls DropDownBox vorhanden -->
     <select
      v-if="objectlist[objectIndex].header[itemIndex].inputType === 'select'"
      v-model="data[objectIndex][itemIndex]"
      @change="handleEdit(object, objectIndex)"
     >
      <option
       v-for="(selectItem, selectIndex) in objectlist[objectIndex].header[itemIndex].selectListKeys"
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
      density="compact"
     ></v-checkbox-btn>
    </td>
    <td>
     <g v-if="!(newStatikObjekt.Typ === 'Lastfall' && objectIndex === 0)">
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
        {{ newStatikObjekt.Typ }} entfernen
       </v-tooltip></v-btn
      >
     </g>
    </td>
   </tr>
  </tbody>
 </v-table>
</template>

<script setup lang="ts">
 import { ref } from "vue"
 import { type Ref } from "vue"
 import type { isStatikobjekt } from "@/typescript/classes/InterfaceStatikobjekt"
 import { useSystemStore } from "@/stores/SystemStore"

 const props = withDefaults(
  defineProps<{
   tableHeight: number
   objectlist: isStatikobjekt[]
   createNewObject: (index: number) => isStatikobjekt
   lastfallnummer?: number
  }>(),
  {
   lastfallnummer: -1, //Default-Wert
  },
 )

 const systemStore = useSystemStore()

 let newStatikObjekt: isStatikobjekt = props.createNewObject(firstEmptyId())

 let newObjectValues: Ref<any[]> = ref(newStatikObjekt.values)

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
  systemStore.system.addStatikobjekt(
   newStatikObjekt.Typ,
   newObjectValues.value,
   props.lastfallnummer,
  )
  console.log(`${newStatikObjekt.Typ} hinzugefügt`)
  newStatikObjekt = props.createNewObject(firstEmptyId())
  updateData()
 }

 function handleEdit(objectData: any[], index: number) {
  // Das Edit-Event wird nur nach oben weitergeleitet,
  //wenn der alte und der neue Wert sich unterscheiden
  if (objectData.toString() != props.objectlist[index].values.toString()) {
   systemStore.system.editStatikobjekt(newStatikObjekt.Typ, objectData, index, props.lastfallnummer)
   console.log(`${newStatikObjekt.Typ} geändert`)
   updateData()
  }
 }

 function handleDelete(index: number) {
  systemStore.system.deleteStatikobjekt(newStatikObjekt.Typ, index, props.lastfallnummer)
  console.log(`${newStatikObjekt.Typ} gelöscht`)
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
 .v-table__wrapper table {
  table-layout: fixed;
  width: 0 !important;
 }

 .eingabetabelle-ersteZeile {
  text-align: center;
  background-color: rgb(178, 246, 178);
  height: 10px;
 }

 .eingabetabelle-datenZeilen {
  height: 50px;
 }

 .eingabetabelle-tabelle {
  width: 100%;
  height: 100%;
  text-align: center;
  border: #646262 solid;
  border-width: 0px;
  margin: 0px;
  padding: 0px;
 }

 thead {
  width: 100%;
  height: 100%;
  text-align: center;
  border: #646262 solid;
  border-width: 0px;
  margin: 0px;
  padding: 0px;
 }

 select {
  width: 100%;
  padding: 0;
  margin: 0;
 }
 input {
  width: 100%;
 }

 input:disabled {
  color: #b0b0b0;
 }
</style>
