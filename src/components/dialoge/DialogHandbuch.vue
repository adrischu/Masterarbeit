<template>
 <v-dialog
  v-model="dialog"
  transition="dialog-bottom-transition"
  fullscreen
 >
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
       <p>
        Die Applikation entstand im Rahmen meiner Masterarbeit an der h_da (Hochschule Darmstadt)
        und ist gedacht für die Nutzung in der Lehre.
       </p>
       <p>Folgende Berechnungstheorien sind implementiert.</p>
       <ul>
        <li>Theorie I. Ordnung</li>
        <li>Theorie II. Ordnung (trigonometrischer Ansatz)</li>
        <li>Näherung für Theorie II. Ordnung (kubischer Verschiebungsansatz)</li>
        <li>Näherung für Theorie II. Ordnung (p-Delta Effekt)</li>
       </ul>

       <v-divider class="divider"></v-divider>
       <h2>ergänzende Eingabeinformationen</h2>
       <h4>Lager</h4>
       <p>
        Jeder gesetzte Haken entspricht der Lagerung des entsprechenden Freiheitsgrades. Den Lagern
        können zusätzlich Federn zugewiesen werden.
       </p>
       <p>Um einen Freiheitsgrad zu federn, darf er NICHT gelagert sein (Häkchen nicht gesetzt).</p>
       <h4>Knoten</h4>
       <p>Folgendes Koordinatensystem wird verwendet.</p>
       <img
        :width="200"
        src="@/assets/images/Koordinatensystem-global.png"
        alt="globales Koordinatensystem"
       />
       <h4>Gelenke</h4>
       <p>
        Jeder Haken entspricht der Freigabe eines Freiheitsgrades. Den Gelenken können zusätzlich
        Federn zugewiesen werden.
       </p>
       <p>Ein Freiheitsgrad kann nur gefedert werden, wenn er freigegeben ist (Häkchen gesetzt).</p>
       <p>
        Für jede freigegebene Richtung erhält das Stabende einen eigenen Freiheitsgrad (bei N und V
        in Richtung der lokalen Stabachsen). Nicht freigegebene Richtungen sind exakt starr mit dem
        Knoten verbunden.
       </p>
       <h4>Schräge Lager</h4>
       <p>
        Über die Spalte „Drehung“ wird das Lagerkoordinatensystem gedreht (positiv im Uhrzeigersinn,
        wie der Stabdrehwinkel). Lagerung, Federn und Lagerkräfte beziehen sich dann auf die
        gedrehten Achsen X' und Z'.
       </p>
       <h4>Stäbe</h4>
       <p>
        Ein Stab muss einen zugewiesenen Anfangsknoten, Endknoten und Querschnitt haben. Die
        Stababschnitte bestimmen, in wie viele Teile der Stab für die Ergebnisausgabe unterteilt
        wird. Sie haben KEINEN Einfluss auf die Berechnung.
       </p>
       <p>
        Die Spalte „Elemente“ legt fest, in wie viele Balkenelemente der Stab für die Berechnung
        unterteilt wird (Standard 1). Die Zwischenknoten werden nur intern verwendet; Ergebnisse
        werden wieder auf den Stab bezogen ausgegeben. Beim trigonometrischen Ansatz ist bereits ein
        Element exakt, die Näherungsansätze (kubisch, P-&Delta;) werden mit mehr Elementen genauer.
       </p>
       <p>
        Folgendes Koordinatensystem wird als lokales Koordinatensystem für die Stäbe verwendet.
        <span v-html="'&alpha;<sub>e</sub>'"></span> ist hierbei der Stabdrehwinkel.
       </p>
       <img
        :width="200"
        src="@/assets/images/Koordinatensystem-lokal.png"
        alt=""
       />
       <h4>Streckenlasten</h4>
       <p>
        Streckenlasten können in Richtung des globalen oder des lokalen Koordinatensystems, sowie in
        die jeweilige x- oder z-Richtung angesetzt werden.
       </p>
       <p>
        Lasten können wahlweise auf die prozierte Länge (Beispiel Schnee) oder die wahre Länge
        (Beispiel Eigengewicht) bezogen werden.
       </p>
       <p>Achtung: Bei der Belastung in lokaler Stabachse hat die Projektion keine Wirkung.</p>
       <h4>Einzellasten</h4>
       <p>
        Einzellasten wirken an der Stelle a (Abstand vom Stabanfang) in lokaler oder globaler x-
        bzw. z-Richtung. Querkraft und Normalkraft springen an der Laststelle; in der
        Stabergebnistabelle erscheint die Stelle deshalb zweimal (links und rechts der Last).
       </p>
       <h4>Temperaturlasten</h4>
       <p>
        &Delta;T<sub>N</sub> ist die gleichmäßige Temperaturänderung (Dehnung
        &alpha;<sub>T</sub>·&Delta;T<sub>N</sub>), &Delta;T<sub>M</sub> = T<sub>unten</sub> &minus;
        T<sub>oben</sub> der Temperaturunterschied über die Querschnittshöhe h (Krümmung
        &alpha;<sub>T</sub>·&Delta;T<sub>M</sub>/h). „Unten“ ist die Seite der gestrichelten Linie
        (lokal +z). &alpha;<sub>T</sub> wird beim Material, h beim Querschnitt eingegeben.
       </p>
       <h4>Imperfektionen</h4>
       <p>
        Imperfektionen werden nach Eurocode 3 angesetzt. Die nachfolgende Grafik zeigt die
        Ersatzlasten, die für den rechnerischen Ansatz der Imperfektionen genutzt wird.
       </p>
       <img
        :width="500"
        src="@/assets/images/Imperfektionen.png"
        alt="Imperfektionen"
       />
       [1]
       <p>
        Da für die Theorie I. Ordnung am unverformten System gerechnet wird, haben Imperfektionen
        für diese Theorie keinen Einfluss.
       </p>
       <p>
        Die Vorkrümmung w<sub>0</sub>/L ist immer auf den ganzen Stab bezogen, auch wenn der Stab in
        mehrere Elemente unterteilt ist.
       </p>

       <v-divider class="divider"></v-divider>
       <h2>Berechnung</h2>
       <p>
        Als Berechnungsbasis wird das Weggrößenverfahren verwendet, welches die
        Steifigkeitsbeziehung des Systems aufstellt und nach der Verformung löst.
       </p>
       <p>
        Für die genaue Dokumentation der Berechnung sowie sämtlicher verwendeter Formeln wird auf
        meine Masterarbeit verwiesen welche über diesen [hier Link einsetzen] als PDF
        heruntergeladen werden kann.
       </p>

       <h4>Stabilität (Verzweigungslastfaktor &alpha;<sub>cr</sub>)</h4>
       <p>
        Im Menü „Stabilität“ wird der Faktor &alpha;<sub>cr</sub> berechnet, mit dem alle Lasten des
        Lastfalls gesteigert werden können, bis das System ausknickt. Standardmäßig werden die
        Normalkräfte nach Theorie I. Ordnung proportional gesteigert (lineare Verzweigungsanalyse).
        Alternativ können die Normalkräfte nach Theorie II. Ordnung beim jeweiligen Lastfaktor
        verwendet werden; dabei werden Normalkraftumlagerungen erfasst.
       </p>
       <p>
        Verwendet wird der Ansatz des Lastfalls (bei Theorie I. Ordnung der trigonometrische
        Ansatz). Die Eigenform wird orange gestrichelt in der Grafik angezeigt.
       </p>
       <h4>Laststeigerung</h4>
       <p>
        Im Menü „Laststeigerung“ wird der Lastfall für mehrere Lastfaktoren nach den gewählten
        Theorien berechnet und eine Knotenverformung über dem Lastfaktor dargestellt
        (Last-Verformungs-Kurve). Die Werte können als CSV-Datei (Trennzeichen „;“, Dezimalkomma)
        für Excel gespeichert werden.
       </p>

       <v-divider class="divider"></v-divider>
       <h2>Bedienung</h2>
       <ul>
        <li>
         Grafik: Mausrad bzw. zwei Finger zum Zoomen, Ziehen zum Verschieben, Doppelklick bzw. Knopf
         oben rechts zum Einpassen.
        </li>
        <li>
         Werte an beliebiger Stelle: mit der Maus über einen Stab fahren bzw. auf einen Stab tippen.
        </li>
        <li>
         Der Halbkreis über der Tabelle ändert die Aufteilung zwischen Grafik und Tabelle
         (Doppelklick: zurücksetzen).
        </li>
        <li>Rückgängig/Wiederholen: Knöpfe in der Werkzeugleiste oder Strg+Z / Strg+Y.</li>
        <li>
         Das System wird automatisch im Browser gesichert und beim nächsten Öffnen
         wiederhergestellt. Zum Weitergeben bitte als Datei speichern.
        </li>
       </ul>

       <v-divider class="divider"></v-divider>
       <h2>Ergebnisse</h2>
       <h4>Knotenergebnisse</h4>
       <p>
        Als Knotenergebnisse werden die Verformungen aller Knoten in globaler Richtung ausgegeben.
        Zusätzlich werden die Freiheitsgrade der Gelenke ausgegeben (freigegebene Richtungen, bei u'
        und w' in lokaler Stabrichtung).
       </p>
       <p>
        Die Gelenkfreiheitsgrade werden gekennzeichnet durch „S[Stabnummer],A“ bzw.
        „S[Stabnummer],E“ für Stabanfang bzw. Stabende. Beispiel: „&phi;<sub>S1,E</sub>“ ist die
        Verdrehung des Endes von Stab 1.
       </p>
       <h4>Lagerkräfte</h4>
       <p>
        Die Lagerkräfte werden wie in RSTAB als Kraft des Tragwerks auf das Lager ausgegeben
        (positiv in Richtung der Lagerachsen). Die Summenzeile entspricht der Summe der Lasten. In
        der Grafik zeigen die Pfeile die tatsächliche Wirkrichtung der Auflagerreaktion.
       </p>
       <h4>Stabergebnisse</h4>
       <p>
        Als Stabergebnisse werden die Verformungen sowie Schnittgrößen entlang des Stabes für alle
        Ausgabepunkte (beeinflusst durch Stabteilung) ausgegeben.
       </p>
       <p>
        Standardmäßig werden die Normal- und Querkraft mit Bezug auf das unverformte System
        ausgegeben. Dies kann in den Einstellungen geändert werden.
       </p>
       <h4>Zwischenergebnisse</h4>
       <p>
        Über den Knopf <v-icon>mdi-table</v-icon> im Reiter "Ergebnisse" können zusätzliche
        Ergebnisse ausgegeben werden.
       </p>
       <p>Hierzu gehören</p>
       <ul>
        <li>Elementsteifigkeitsmatrizen</li>
        <li>Elementtransformationsmatrizen</li>
        <li>Systemsteifigkeitsmatrizen</li>
       </ul>

       <v-divider class="divider"></v-divider>
       <h2>Einstellungen</h2>
       <h4>Option „Stabkennzahl, unter der der kubische Ansatz verwendet wird“</h4>
       <p>
        Die Gleichungen des trigonometrischen Ansatzes (Sinus/Cosinus) führen bei kleinen
        Stabkennzahlen in ihrer ursprünglichen Form zu Auslöschung. Das Programm verwendet
        inzwischen eine numerisch stabile Formulierung (Reihenentwicklung für kleine &epsilon;), die
        nahtlos in die Theorie I. Ordnung übergeht. Eine Umschaltung ist deshalb nicht mehr nötig
        (Standard 0 = nie).
       </p>

       <h4>Option "maximale Anzahl an Iterationen für Theorie II. Ordnung"</h4>
       <p>
        Bei der Berechnunng nach Theorie II. Ordnung wird weiter iterativ gerechnet, bis der Fehler
        zur vorherigen Iteration eine gewisse Grenze unterschreitet.
       </p>
       <p>
        Um Unendlich-Schleifen zu vermeiden wird ab einer bestimmten Iterations-Anzahl die
        Berechnung mit einem Fehler abgebrochen. Dieser Wert kann festgelegt werden.
       </p>

       <h4>Option "Fehler für Abbruchkriterium bei Iteration nach Theorie II. Ordnung"</h4>
       <p>
        Bei der Berechnunng nach Theorie II. Ordnung wird weiter iterativ gerechnet, bis der Fehler
        zur vorherigen Iteration eine gewisse Grenze unterschreitet.
       </p>
       <p>
        Ein Fehler von 1,0 würde einer 100%igen Abweichung entsprechen, während ein Fehler von 0
        keiner Abweichung entspricht.
       </p>
       <p>
        Je kleiner dieser Wert ist, desto genauer sind die Ergebnisse. Die standardmäßig
        eingestellte Genauigkeit sollte für normale Fälle ausreichen.
       </p>

       <h4>Option "Schnittgrößenbezug für Theorie II. Ordnung"</h4>
       <p>
        Standardmäig werde die Schnittgrößen des Stabes mit Bezug auf die unverformte Achse
        ausgegeben. Mit dem aktivieren dieser Option werden die Schnittgrößen auf das verformte
        System bezogen.
       </p>
       <p>
        Die folgende Grafik veranschaulicht die verschiedenen Bezüge, wobei sich für das Moment
        keine Änderung ergibt.
       </p>
       <img
        :width="500"
        src="@/assets/images/Schnittgroessenbezug.png"
        alt="Koordinatensystem für Schnittgrößenbezug der Stabergebnisse"
       />
       <ul>
        <li>Linkes Bild: Option nicht aktiviert.</li>
        <li>Rechtes Bild: Option aktiviert.</li>
       </ul>

       <v-divider class="divider"></v-divider>
       <h2>Grafik speichern</h2>
       <p>
        Die Grafik kann als SVG (Scalable Vector Graphics, z. B. für Word oder Inkscape) oder als
        PNG heruntergeladen werden. Es wird der aktuelle Ausschnitt gespeichert.
       </p>

       <v-divider class="divider"></v-divider>
       <h2>Quellen</h2>
       <ul>
        <li>
         [1]: DIN e.V. 2010. DIN EN 1993-1-1: Eurocode 3: Bemessung und Konstruktion von Stahlbauten
         - Teil 1-1: Allgemeine Bemessungsregeln und Regeln für den Hochbau; Deutsche Fassung EN
         1993-1-1:2005 + AC:2009. Berlin : Beuth Verlag GmbH, 2010., Bild 5.4
        </li>
        <li>Zusätzliche Quellen sind in der Masterarbeit enthalten.</li>
       </ul>
      </div>
     </div>
    </v-card-item>
   </div>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
 import { computed } from "vue"

 /** Sichtbarkeit (v-model des Elternelements) */
 const props = defineProps<{ modelValue: boolean }>()
 const dialog = computed({
  get: () => props.modelValue,
  set: (wert: boolean) => emit("update:modelValue", wert),
 })
 const emit = defineEmits<{ (e: "update:modelValue", wert: boolean): void }>()
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

 h2 {
  padding-bottom: 10px;
 }

 h4 {
  padding-top: 10px;
 }

 li {
  margin-left: 14px;
  list-style-type: square;
 }
 .divider {
  margin-top: 20px;
  margin-bottom: 20px;
 }
</style>
