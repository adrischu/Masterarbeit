# PROGRAMMIEREN

## Knotentabelle, Stabtabelle usw.

- Mechanismen einbauen, sodass immer automatisch die nächste Knoten/Stabnummer für ein neues Objekt genommen wird.
- Nach Eingabe eines Objektes und bestätigen mit Enter oder Klick auf Button: Fokus immer automatisch wieder auf erstes Zeile der grün hinterlegten Zeile (oder zweite und Nummer automatisch hochzählen?!) legen.
- Eingabefelder in den Tabellen personalisieren (zB nur positive Werte über 0 annehmen für Nummern..E-Modul..Fläche..)

## Optik

- Library für Vuetify Icons runterladen, integrieren und in die Buttons zum hinzufügen oder löschen von Objekten (Knoten, Stäbe usw...) Icons hinzufügen

# EXTRAS

- In Eingabetabellen veränderbare (anklickbar) Parameter "Einheit" in den Tabellenkopf einbauen, mit denen man die Einheit mit der Werte eingelesen und ausgegeben werden, dynamisch ändern kann. (Soll am gespeicherten Objekt nichts ändern!!)

- Bei Eingabetabellen: Bisher wird editEvent immer dann getriggert, wenn der Fokus von einer Zelle genommen wird. Ändern, sodass nur getriggert wird wenn zusätzhlich der Wert sich verändert hat. (tempWert einführen)

- Button um `theme` zu wechseln. Info [hier](https://vuetifyjs.com/en/features/theme/#typescript).

- Bei Lastfällen die Zusatzoption "Kopie" hinzufügen. -> Stellt eine Kopie eines anderen Lastfalls dar. So können leicht verschiedene Theorien verglichen werden, während die Lasten jeweils nur bei einem Lastfall erstellt werden müssen.

# Fehlerüberprüfung

- Jeden Knoten darauf überprüfen, ob er Teil eines Stabes ist.
