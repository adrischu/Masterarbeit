<template>
 <v-dialog
  v-model="dialog"
  transition="dialog-bottom-transition"
  fullscreen
 >
  <template v-slot:activator="{ props: activatorProps }">
   <!-- <v-btn
    icon="mdi-book-open-variant"
    v-bind="activatorProps"
   ></v-btn> -->
   <v-btn v-bind="activatorProps">Handbuch</v-btn>
  </template>

  <v-card>
   <v-toolbar
    density="compact"
    class="action-fields"
    color="green-lighten-4"
    elevation="10"
    :border="true"
    style="overflow-y: hidden"
   >
    <v-toolbar-title>Handbuch</v-toolbar-title>
    <v-spacer></v-spacer>

    <v-toolbar-items>
     <v-btn
      icon="mdi-close"
      @click="dialog = false"
     ></v-btn>
    </v-toolbar-items>
   </v-toolbar>
   <div style="overflow-y: auto">
   <v-card-item>



    <div id="handbuch">
  <h2>Allgemein</h2>
     <div>
      <p>
       Mit dieser Applikation können ebene Stabtragwerke definiert und nach verschiedenen Theorien
       berechnet werden. Die Berechnungen basieren auf einem schubstarren Bernoulli-Balken mit
       Normalkraftanteilen. 
      </p>
      <p>Die Applikation entstand im Rahmen meiner Masterarbeit an der h_da (Hochschule Darmstadt) und ist gedacht für die Nutzung in der Lehre.</p>
      <p> Folgende Berechnungstheorien sind implementiert.
      <ul>
       <li display: list-item>Theorie I. Ordnung</li>
       <li display: list-item>Theorie II. Ordnung (trigonometrischer Ansatz)</li>
       <li display: list-item>Näherung für Theorie II. Ordnung (kubischer Verschiebungsansatz)</li>
       <li display: list-item>Näherung für Theorie II. Ordnung (p-Delta Effekt)</li>
      </ul>
    </p>

    <v-divider class="divider"></v-divider>
  <h2>ergänzende Eingabeinformationen</h2>
  <h4>Lager</h4>
  <p>Jeder gesetzte Haken entspricht der Lagerung des entsprechenden Freiheitsgrades. Den Lagern können zusätzlich Federn zugewiesen werden.</p>
  <p>Um einen Freiheitsgrad zu federn, darf er NICHT gelagert sein (Häkchen nicht gesetzt).</p>
  <h4>Knoten</h4>
  <p>Folgendes Koordinatensystem wird verwendet.</p>
  <img
  :width="200"
  src="@/assets/images/Koordinatensystem-global.png"
  alt="globales Koordinatensystem"
/>
<h4>Gelenke</h4>
<p>Jeder Haken entspricht der Freigabe eines Freiheitsgrades. Den Gelenken können zusätzlich Federn zugewiesen werden.</p>
<p>Ein Freiheitsgrad kann nur gefedert werden, wenn er freigegeben ist (Häkchen gesetzt).</p>
<h4>Stäbe</h4>
<p>Ein Stab muss einen zugewiesenen Anfangsknoten, Endknoten und Querschnitt haben. Die Stabteilung bestimmt, in wie viele Teile der Stab für die Ergebnisausgabe unterteilt wird. Die Stabteilung hat KEINEN Einfluss auf die Berechnung.</p>
<p>Folgendes Koordinatensystem wird als lokales Koordinatensystem für die Stäbe verwendet. <span v-html="'&alpha;<sub>e</sub>'"></span> ist hierbei der Stabdrehwinkel.</p>
<img   :width="200" src="@/assets/images/Koordinatensystem-lokal.png" alt="">
<h4>Streckenlasten</h4>
<p>Streckenlasten können in Richtung des globalen oder des lokalen Koordinatensystems, sowie in die jeweilige x- oder z-Richtung angesetzt werden.</p>
<p>Lasten können wahlweise auf die prozierte Länge (Beispiel Schnee) oder die wahre Länge (Beispiel Eigengewicht) bezogen werden.</p>
<p>Achtung: Bei der Belastung in lokaler Stabachse hat die Projektion keine Wirkung.</p>
<h4>Imperfektionen</h4>
<p>Imperfektionen werden nach Eurocode 3 angesetzt. Die nachfolgende Grafik zeigt die Ersatzlasten, die für den rechnerischen Ansatz der Imperfektionen genutzt wird.</p>
<img :width="500" src="@/assets/images/Imperfektionen.png" alt="Imperfektionen">
[1]
<p>Da für die Theorie I. Ordnung am unverformten System gerechnet wird, haben Imperfektionen für diese Theorie keinen Einfluss.</p>

<v-divider class="divider"></v-divider>
  <h2>Berechnung</h2>
  <p>Als Berechnungsbasis wird das Weggrößenverfahren verwendet, welches die Steifigkeitsbeziehung des Systems aufstellt und nach der Verformung löst.</p>
<p>Für die genaue Dokumentation der Berechnung sowie sämtlicher verwendeter Formeln wird auf meine Masterarbeit verwiesen welche über diesen [hier Link einsetzen] als PDF heruntergeladen werden kann.</p>

<v-divider class="divider"></v-divider>
<h2>Ergebnisse</h2>
<h4>Knotenergebnisse</h4>
<p>Als Knotenergebnisse werden die Verformungen aller Knoten und Gelenke in globaler Richtung ausgegeben. Für jedes Gelenk werden programmintern 3 neue Freiheitsgrade (entspricht einem Knoten) hinzugefügt.</p>
<p>Die Gelenke werden gekennzeichnet durch "Stab[Stabnummer]A" oder "Stab[Stabnummer]E", je nachdem ob das Gelenk am Stabanfang oder Stabende ist.</p>
<p>Beispiel: "Stab1E" gibt die Verformungen des Stabendes von Stab 2 aus.</p>
<h4>Stabergebnisse</h4>
<p>Als Stabergebnisse werden die Verformungen sowie Schnittgrößen entlang des Stabes für alle Ausgabepunkte (beeinflusst durch Stabteilung) ausgegeben.</p>
<p>Standardmäßig werden die Normal- und Querkraft mit Bezug auf das unverformte System ausgegeben. Dies kann in den Einstellungen geändert werden.</p>
<h4>Zwischenergebnisse</h4>
<p>Über den Knopf <v-icon>mdi-table</v-icon> im Reiter "Ergebnisse" können zusätzliche Ergebnisse ausgegeben werden. </p>
<p>Hierzu gehören</p>
<ul>
    <li>Elementsteifigkeitsmatrizen</li>
    <li>Elementtransformationsmatrizen</li>
    <li>Systemsteifigkeitsmatrizen</li>
</ul>

<v-divider class="divider"></v-divider>
<h2>Einstellungen</h2>
<h4>Option "minimale Stabkennzahl für trigonometrischen Ansatz"</h4>
<p>Die Gleichungen für den trigonometrischen Ansatz nutzen Sinus- und Cosinus Funktionen. Für eine Normalkraft von N=0 würde der Nenner in diesen Gleichungen zu null laufen. Der trigonometrische Lösungsansatz für Theorie II. Ordnung geht für sehr kleine Normalkräfte nicht nahtlos in die Theorie I. Ordnung über.  </p>
<p>Diese Option legt die Stabkennzahl fest, unter welcher automatische vom trigonometrischen Ansatz zum kubischen Ansatz gewechselt wird, um numerische Probleme zu vermeiden.</p>
<p>Wenn testhalber immer mit dem trigonometrischen Ansatz gerechnet werden soll, kann der Wert auf -1 gesetzt werden. Allerdings kann es sein, dass die Ergebnisse in diesem Fall unbrauchbar werden.</p>

<h4>Option "maximale Anzahl an Iterationen für Theorie II. Ordnung"</h4>
<p>Bei der Berechnunng nach Theorie II. Ordnung wird weiter iterativ gerechnet, bis der Fehler zur vorherigen Iteration eine gewisse Grenze unterschreitet. </p>
<p>Um Unendlich-Schleifen zu vermeiden wird ab einer bestimmten Iterations-Anzahl die Berechnung mit einem Fehler abgebrochen. Dieser Wert kann festgelegt werden.</p>

<h4>Option "Fehler für Abbruchkriterium bei Iteration nach Theorie II. Ordnung"</h4>
<p>Bei der Berechnunng nach Theorie II. Ordnung wird weiter iterativ gerechnet, bis der Fehler zur vorherigen Iteration eine gewisse Grenze unterschreitet.</p>
<p>Ein Fehler von 1,0 würde einer 100%igen Abweichung entsprechen, während ein Fehler von 0 keiner Abweichung entspricht.</p>
<p>Je kleiner dieser Wert ist, desto genauer sind die Ergebnisse. Die standardmäßig eingestellte Genauigkeit sollte für normale Fälle ausreichen.</p>

<h4>Option "Schnittgrößenbezug für Theorie II. Ordnung"</h4>
<p>Standardmäig werde die Schnittgrößen des Stabes mit Bezug auf die unverformte Achse ausgegeben. Mit dem aktivieren dieser Option werden die Schnittgrößen auf das verformte System bezogen.</p>
<p>Die folgende Grafik veranschaulicht die verschiedenen Bezüge, wobei sich für das Moment keine Änderung ergibt.</p>
<img :width="500" src="@/assets/images/Schnittgroessenbezug.png" alt="Koordinatensystem für Schnittgrößenbezug der Stabergebnisse">
<ul>
    <li>Linkes Bild: Option nicht aktiviert.</li>
    <li>Rechtes Bild: Option aktiviert.</li>
</ul>

<v-divider class="divider"></v-divider>
<h2>Grafik speicher</h2>
<p>Die Grafik kann als SVG (Scalable Vector Graphics) heruntergeladen werden. Diese Format kann zB in Browsern oder in Word dargestellt werden.</p>
<p>Ein Download als .png oder .jpg ist aktuell nicht implementiert. Hier kann das Snipping-Tool oder Ähnliches verwendet werden.</p>

<v-divider class="divider"></v-divider>
  <h2>Quellen</h2>
  <ul>
    <li>[1]: DIN e.V. 2010. DIN EN 1993-1-1: Eurocode 3: Bemessung und Konstruktion von Stahlbauten - Teil 1-1: Allgemeine Bemessungsregeln und Regeln für den Hochbau; Deutsche Fassung EN 1993-1-1:2005 + AC:2009. Berlin : Beuth Verlag GmbH, 2010., Bild 5.4</li>
    <li>Zusätzliche Quellen sind in der Masterarbeit enthalten.</li>
  </ul>
  <p>Text für Abschnitt 3</p>
</div>
     </div>
   </v-card-item>
</div>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
 import { nextTick, ref, watch, type Ref } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import { useSettingsStore } from "@/stores/SettingsStore"
 import { useSystemStore } from "@/stores/SystemStore"
 import { ergebnisseLöschen } from "@/typescript/berechnungen"

 const graphicSettings = useGraphicSettingsStore()
 const settings = useSettingsStore()
 const system = useSystemStore().system

 let dialog: Ref<boolean> = ref(false)
</script>
 <style scoped>
 #linktree {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
}

#linktree ul {
  list-style-type: none;
  padding: 0;
}

#linktree li {
  margin-bottom: 5px;
}

h2{
    padding-bottom:10px;
}

h4{
    padding-top:10px;
}

li {
    margin-left: 14px;
    list-style-type:square;
 }
 .divider{
    margin-top:20px;
    margin-bottom:20px
 }
 </style>