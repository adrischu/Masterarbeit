# Stabteilung

- Ist es normal einen Stab in mehrere Elemente aufzuteilen? REMFEM und Prog. Rothe verwenden Stabteilung nur im Sinne von Ausgabe-Teilung. RStab verwendet tatsächlich Stabteilung -> aus einem Stab werden zB 10 Elemente.

  - Eine Verallgemeinerung der Frage wäre: Wo genau ist der Unterschied zwischen dem WGV und der FEM

- Wie sehen die DGL für die Näherungsansätze aus?

- Gibt es eine Formatvorlage für Masterarbeiten für MSWord?

- Formatvorlage für Plakat?

- Wozu ist die mehrfache Iteration der Berechnung bei Theorie 2 Ordnung nötig. FÜr mich sieht es so aus als ob sich in den einzelnen Berechnungsschritten nichts mehr ändert.

- Schnittgrößenermittlung bei Näherungsansätzen?

- Spezifische Ausgabe?

  - Steifigkeitsmatrizen?
  - Iterationsschritte?

- Als weitere Lastoptionen bisher nur Vorverformungen geplant. (Vorverkrümmung, Schiefstellung)
  - Vorverformung über Eigenform?

# Gelöst

- Ist es normal einen Stab in mehrere Elemente aufzuteilen? REMFEM und Prog. Rothe verwenden Stabteilung nur im Sinne von Ausgabe-Teilung. RStab verwendet tatsächlich Stabteilung -> aus einem Stab werden zB 10 Elemente.
  -> Für die exakte Lösung ist dies egal, für Näherungsansaätze wird das Verfahren genauer je mehr Elemente
