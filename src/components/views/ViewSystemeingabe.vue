<template>
 <p>Hier sollen Systemdaten eingegeben werden.</p>
 <TabelleLager />
 <TabelleKnoten />
 <TabelleMaterial />
 <TabelleQuerschnitt />
 <TabelleGelenk />
 <TabelleStab />
</template>

<script setup lang="ts">
 import TabelleKnoten from "../tabellen/TabelleKnoten.vue"
 import TabelleMaterial from "../tabellen/TabelleMaterial.vue"
 import TabelleQuerschnitt from "../tabellen/TabelleQuerschnitt.vue"
 import TabelleStab from "../tabellen/TabelleStab.vue"
 import TabelleLager from "../tabellen/TabelleLager.vue"
 import TabelleGelenk from "../tabellen/TabelleGelenk.vue"
</script>
<style scoped></style>
