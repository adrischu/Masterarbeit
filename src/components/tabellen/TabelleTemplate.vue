<template>
 <div class="tabelle-rahmen">
  <v-table
   class="eingabetabelle-tabelle"
   density="compact"
   hover
   fixed-header
   height="100%"
  >
   <!--  -->
   <!-- Tabellenkopfzeile -->
   <!--  -->
   <thead>
    <tr>
     <th
      v-for="headerItem in neuerKopf"
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
        location="bottom"
        open-delay="300"
        open-on-click
        max-width="320"
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
      v-for="(headerItem, itemIndex) in neuerKopf"
      :key="itemIndex"
     >
      <!-- Falls normaler Input vorhanden -->
      <input
       v-if="headerItem.inputType === 'fixed' || headerItem.inputType === 'input'"
       :type="headerItem.inputFormat === 'number' ? 'number' : 'text'"
       step="any"
       v-model="neueWerte[itemIndex]"
       :disabled="headerItem.disabled"
       @keydown.enter="handleAdd"
      />
      <!-- Falls DropDownBox vorhanden -->
      <select
       v-if="headerItem.inputType === 'select'"
       v-model="neueWerte[itemIndex]"
      >
       <option
        v-for="(selectItem, selectIndex) in headerItem.selectListKeys"
        :key="selectIndex"
        :value="headerItem.selectListValues![selectIndex]"
        :hidden="selectIndex === 0"
       >
        {{ selectItem }}
       </option>
      </select>
      <!-- Falls Checkbox vorhanden -->
      <v-checkbox-btn
       v-if="headerItem.inputType === 'checkbox'"
       v-model="neueWerte[itemIndex]"
       density="compact"
       @change="neuesObjektAktualisieren"
      ></v-checkbox-btn>
     </td>
     <td>
      <v-btn
       @click="handleAdd"
       icon
       color="green"
       size="small"
       density="comfortable"
       ><v-icon>mdi-plus</v-icon
       ><v-tooltip
        activator="parent"
        location="end"
        open-delay="500"
       >
        {{ objektname }} hinzufügen
       </v-tooltip></v-btn
      >
     </td>
    </tr>

    <!--  -->
    <!-- Andere Zeilen für Inhalt -->
    <!--  -->
    <tr
     v-for="(zeile, objectIndex) in daten"
     :key="`${objectIndex}-${zeile[0]}`"
    >
     <td
      v-for="(wert, itemIndex) in zeile"
      :key="itemIndex"
     >
      <template v-if="kopfzeilen[objectIndex]">
       <!-- Falls nicht veränderbar -->
       <span v-if="kopfzeilen[objectIndex][itemIndex].inputType === 'fixed'">
        {{ daten[objectIndex][itemIndex] }}
       </span>
       <!-- Falls normaler Input vorhanden -->
       <input
        v-if="kopfzeilen[objectIndex][itemIndex].inputType === 'input'"
        :type="kopfzeilen[objectIndex][itemIndex].inputFormat === 'number' ? 'number' : 'text'"
        step="any"
        v-model="daten[objectIndex][itemIndex]"
        @change="handleEdit(objectIndex)"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
        :disabled="kopfzeilen[objectIndex][itemIndex].disabled"
       />
       <!-- Falls DropDownBox vorhanden -->
       <select
        v-if="kopfzeilen[objectIndex][itemIndex].inputType === 'select'"
        v-model="daten[objectIndex][itemIndex]"
        @change="handleEdit(objectIndex)"
       >
        <option
         v-for="(selectItem, selectIndex) in kopfzeilen[objectIndex][itemIndex].selectListKeys"
         :key="selectIndex"
         :value="kopfzeilen[objectIndex][itemIndex].selectListValues![selectIndex]"
         :hidden="selectIndex === 0"
        >
         {{ selectItem }}
        </option>
       </select>
       <!-- Falls Checkbox vorhanden -->
       <v-checkbox-btn
        v-if="kopfzeilen[objectIndex][itemIndex].inputType === 'checkbox'"
        v-model="daten[objectIndex][itemIndex]"
        @change="handleEdit(objectIndex)"
        density="compact"
       ></v-checkbox-btn>
      </template>
     </td>
     <td>
      <v-btn
       v-if="!(objektTyp === 'Lastfall' && objektliste.length <= 1)"
       @click="handleDelete(objectIndex)"
       icon
       color="red"
       size="small"
       density="comfortable"
       ><v-icon>mdi-minus</v-icon
       ><v-tooltip
        activator="parent"
        location="end"
        open-delay="500"
       >
        {{ objektname }} entfernen
       </v-tooltip></v-btn
      >
     </td>
    </tr>
   </tbody>
  </v-table>
  <v-snackbar
   v-model="meldungAnzeigen"
   timeout="3500"
   color="red-darken-2"
  >
   {{ meldung }}
  </v-snackbar>
 </div>
</template>

<script setup lang="ts">
 import { computed, ref, shallowRef, watch } from "vue"
 import type { isStatikobjekt, Spalte } from "@/typescript/classes/InterfaceStatikobjekt"
 import { useSystemStore } from "@/stores/SystemStore"

 const props = withDefaults(
  defineProps<{
   /** Objekttyp, z. B. "Knoten" oder "StablastStreckenlast" */
   objektTyp: string
   /** Lastfallnummer für Lasten */
   lastfallnummer?: number
  }>(),
  {
   lastfallnummer: 0,
  },
 )

 const systemStore = useSystemStore()

 const OBJEKTNAMEN: Record<string, string> = {
  StablastStreckenlast: "Streckenlast",
  StablastVorverformung: "Vorverformung",
  StablastEinzellast: "Einzellast",
  StablastTemperatur: "Temperaturlast",
 }
 const objektname = computed(() => OBJEKTNAMEN[props.objektTyp] ?? props.objektTyp)

 /** Aktuelle Objektliste aus dem Store (reagiert auf Änderungen und auf ein neues System) */
 const objektliste = computed<isStatikobjekt[]>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  systemStore.system.Revision
  try {
   return systemStore.system.objektliste(props.objektTyp, props.lastfallnummer)
  } catch {
   return []
  }
 })

 const kopfzeilen = ref<Spalte[][]>([])
 const daten = ref<any[][]>([])

 const neuesObjekt = shallowRef<isStatikobjekt>(
  systemStore.system.neuesStatikobjekt(props.objektTyp),
 )
 const neueWerte = ref<any[]>([])
 const neuerKopf = ref<Spalte[]>([])

 /** Liest die Tabellenwerte neu aus den Objekten */
 function updateData() {
  const system = systemStore.system
  daten.value = objektliste.value.map((o) => o.values)
  kopfzeilen.value = objektliste.value.map((o) => o.header(system))
  neuerKopf.value = neuesObjekt.value.header(system)
 }

 function neuesObjektErstellen() {
  neuesObjekt.value = systemStore.system.neuesStatikobjekt(props.objektTyp, firstEmptyId())
  neueWerte.value = neuesObjekt.value.values
 }

 watch(
  [objektliste, () => systemStore.system.Revision, () => systemStore.system],
  () => {
   updateData()
  },
  { immediate: true },
 )
 neuesObjektErstellen()
 updateData()

 function zeigeMeldung(text: string) {
  meldung.value = text
  meldungAnzeigen.value = true
 }
 const meldung = ref("")
 const meldungAnzeigen = ref(false)

 function handleAdd() {
  const nummer = Number(neueWerte.value[0])
  if (!Number.isInteger(nummer) || nummer < 1) {
   zeigeMeldung("Die Nummer muss eine ganze Zahl ≥ 1 sein.")
   return
  }
  if (objektliste.value.some((o) => o.Nummer === nummer)) {
   zeigeMeldung(`${objektname.value} Nr. ${nummer} existiert bereits.`)
   neueWerte.value[0] = firstEmptyId()
   return
  }
  systemStore.vorÄnderung()
  systemStore.system.addStatikobjekt(props.objektTyp, neueWerte.value.slice(), props.lastfallnummer)
  neuesObjektErstellen()
  updateData()
 }

 function handleEdit(index: number) {
  const zeile = daten.value[index]
  const objekt = objektliste.value[index]
  // Das Edit-Event wird nur weitergeleitet, wenn der alte und der neue Wert sich unterscheiden
  if (zeile.toString() === objekt.values.toString()) return
  systemStore.vorÄnderung()
  systemStore.system.editStatikobjekt(props.objektTyp, zeile.slice(), index, props.lastfallnummer)
  updateData()
 }

 function handleDelete(index: number) {
  systemStore.vorÄnderung()
  systemStore.system.deleteStatikobjekt(props.objektTyp, index, props.lastfallnummer)
  neuesObjektErstellen()
  updateData()
 }

 function neuesObjektAktualisieren() {
  neuesObjekt.value.values = neueWerte.value
  neuerKopf.value = neuesObjekt.value.header(systemStore.system)
 }

 /** Kleinste freie Nummer */
 function firstEmptyId(): number {
  const vorhanden = new Set(objektliste.value.map((o) => o.Nummer))
  let index = 1
  while (vorhanden.has(index)) index++
  return index
 }
</script>

<style scoped>
 .tabelle-rahmen {
  width: 100%;
  height: 100%;
 }

 .eingabetabelle-ersteZeile {
  text-align: center;
  background-color: rgb(178, 246, 178);
 }

 .eingabetabelle-tabelle {
  width: 100%;
  height: 100%;
  text-align: center;
  margin: 0px;
  padding: 0px;
 }

 .eingabetabelle-tabelle :deep(table) {
  width: max-content;
  min-width: 100%;
 }

 .eingabetabelle-tabelle :deep(th) {
  white-space: nowrap;
  min-width: 70px;
 }

 select {
  width: 100%;
  min-width: 90px;
  padding: 2px;
  margin: 0;
  min-height: 32px;
 }
 input {
  width: 100%;
  min-width: 70px;
  min-height: 32px;
  padding: 2px 4px;
 }

 input:disabled {
  color: #b0b0b0;
 }

 /* Scrollbalken der Eingabetabelle immer sichtbar, horizontal scrollbar */
 :deep(.v-table__wrapper) {
  overflow: auto !important;
 }
</style>
