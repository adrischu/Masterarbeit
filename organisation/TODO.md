# SCHREIBEN

- Absatz zu "Stand der Forschung und Normung" fertig bearbeiten.
- Teil zur Untersuchung der Näherungsansätze und Stabilitätsuntersuchung schreiben
- Programmplausibilisierung schreiben
- Abstract deutsch
- Abstract englisch
- Teil für Benutzeroberfläche?

# PROGRAMMIEREN

- Lizenzen einfügen?

- Undefined in Lagerkraftarray untersuchen.

- Überprüfen ob alle Keys von v-for Schleifen einzigartig sind-

- Versionsabfrage beim Einlesen einer Systemdatei implementieren

- Recherchieren, ob es irgendwie zu legalen Problemen beim SPeichern von Dateien oder dem Upload von Dateien kommen kann. Wegen Datenschutz oder so....

- in d2beam wird bevor man die Seite verlässt ein Fenster aufgeploppt, das warnt dass nicht gespeichert ist. Implementieren!

## Statik

- Ermittlung der Knotenersatzlasten nach kubischem oder p-Delta Ansatz recherchieren und implementieren. -> aktuell nach Th1. So richtig?
- Evtl System einbauen, dass es erlaubt, Lasten automatisch zu steigern (von x bis xx in xxx abständen o.Ä.). Es könnten hier jeweils alle Theorien berechnet werden und dann Last-Verformungskurven anhand der Ergebnisse erstellt werden können.
- Aktuell werden Lagerfedern immer gewertet. Sie sollten aber nur gewertet werden wenn der entsprechende Freiheitsgrad NICHT gehalten ist.

## Knotentabelle, Stabtabelle usw.

- Mechanismen einbauen, sodass immer automatisch die nächste Knoten/Stabnummer für ein neues Objekt genommen wird.

- Nach Eingabe eines Objektes und bestätigen mit Enter oder Klick auf Button: Fokus immer automatisch wieder auf erstes Zeile der grün hinterlegten Zeile (oder zweite und Nummer automatisch hochzählen?!) legen.

- Eingabefelder in den Tabellen personalisieren (zB nur positive Werte über 0 annehmen für Nummern..E-Modul..Fläche..)

## Optik

# EXTRAS

- In Eingabetabellen veränderbare (anklickbar) Parameter "Einheit" in den Tabellenkopf einbauen, mit denen man die Einheit mit der Werte eingelesen und ausgegeben werden, dynamisch ändern kann. (Soll am gespeicherten Objekt nichts ändern!!)

- Name für Programm

- Bei Eingabetabellen: Bisher wird editEvent immer dann getriggert, wenn der Fokus von einer Zelle genommen wird. Ändern, sodass nur getriggert wird wenn zusätzhlich der Wert sich verändert hat. (tempWert einführen)

- Button um `theme` zu wechseln. Info [hier](https://vuetifyjs.com/en/features/theme/#typescript).

- Bei Lastfällen die Zusatzoption "Kopie" hinzufügen. -> Stellt eine Kopie eines anderen Lastfalls dar. So können leicht verschiedene Theorien verglichen werden, während die Lasten jeweils nur bei einem Lastfall erstellt werden müssen.

# Fehlerüberprüfung

- Jeden Knoten darauf überprüfen, ob er Teil eines Stabes ist.

- Fehler für Singuläre Steifigkeitsmatrix angeben.

TODO Besprechung:

- Schnittgrößenermittlung nach Näherungsansätzen soll funktionieren
- Abspeicherfunktion (Prog Rothe: Dateien.ts) -> speichern als json (muss async Funktion sein)
- (Vorverformungen)

Aufbau Masterarbeittext:

- Grundlegender Aufbau und Zusammenhang des Programmes soll erkärt werden.
- Vergleichsbeispiel mit RSTAB
- Herleitung der Formeln
-

# Ganz am Ende

- Rahmen von den FOrmeltabellen entfernen.
- Bei Literaturverweisen eckige Klammern statt runden Klammern verwendeen.
- Oberen und unteren Rand von FOrmeln einheitlich noch einmal überprüfen.
- Rechtschreibcheck
- Zeichensetzungscheck
- Alle Verweise checken.
