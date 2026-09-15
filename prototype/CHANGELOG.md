# Changelog

Ein Eintrag je Vokabularänderung und je Prüflauf — auch dann, wenn das
Ergebnis „unverändert" oder „Abruf fehlgeschlagen" lautet.

Format: Datum · Datei · Änderung · Quelle.

---

## 2026-09-15 · Chips und Feinschliff der Oberfläche

### Chips

- **Kennzeichen** · Aus vier Einzelklassen wird ein System: eine Grundform
  `.chip` und je Bedeutung eine Farbfamilie aus Schrift, Fläche und Kante.
  Der Text nennt die Bedeutung weiterhin ausdrücklich — Farbe schmückt, sie
  trägt nicht. Alle sieben Familien sind nachgerechnet und liegen zwischen
  5,9:1 und 11,6:1.
- **Datierung** · Der Chip an den Übergängen las sich als „Vorschlag aus
  Workshop 4 — nicht beschlossen" und datierte damit auf einen Termin, der
  vorbei ist. Jetzt „Vorschlag aus Workshop 4 · noch zu entscheiden": die
  Herkunft bleibt, der Status wird benannt. Ebenso „Entscheidung offen" →
  „noch zu entscheiden".
- **Namenskollision** · `.chip` war bereits für die abgeleiteten
  Bundesland-Werte vergeben; die alte Regel stand später im Stylesheet und
  überschrieb die neuen Familien. Statt auszuweichen sind die abgeleiteten
  Werte jetzt Teil desselben Systems (`.chip-abgeleitet`) — sie sind ja
  ebenfalls Chips.

### Feinschliff

- **Flächen** · Weichere Radien, zwei Schattenstufen statt harter Rahmen,
  mehr Luft in Karten und Feldern.
- **Navigation** · Segmentleiste statt vier einzelner Kästen: Die vier
  Ansichten gehören zusammen, und eine durchgehende Fläche zeigt das besser.
- **Auswahl** · Optionen haben jetzt eine anklickbare Fläche mit Hover- und
  Auswahlzustand; der Fortschrittsbalken wächst mit einer kurzen Bewegung.
- **Bewegung** · Alle Übergänge dauern 140 ms und betreffen nur Farbe,
  Schatten und Breite. Unter `prefers-reduced-motion: reduce` sind sie
  abgeschaltet.

### Ein Fund nebenbei

- **Kreuztabelle** · Der Punkt für die leere Kombination lag bei 1,76:1 und
  war damit für viele nicht wahrnehmbar — obwohl die Fußzeile ausdrücklich
  sagt, er stehe für eine leere Zelle. Jetzt 6:1, dafür kleiner gesetzt:
  sichtbar, aber leiser als jede belegte Zelle. Der Befund stammt aus einer
  Messung aller sichtbaren Texte, nicht aus dem Augenschein.

---

## 2026-09-15 · Durchsicht der veröffentlichten Seiten

Prüfung der vier Seiten auf Darstellungsfehler und der Inhalte auf innere
Stimmigkeit. Sechs Befunde, alle behoben.

- **Netzdarstellung** · Zwei Knoten trugen die Beschriftung „Reichweite" —
  die Reichweitenfelder der Varianten 2 und 3. Im Netz sah das wie ein Fehler
  aus statt wie die offene Entscheidung, die es abbildet. Variantenfelder
  tragen dort jetzt den Zusatz „(Variante N)". Das Formular bleibt unverändert:
  dort ist immer nur eine Variante sichtbar.
- **Netzdarstellung** · Das Zielgruppenfeld erschien als Frage („Wer nimmt an
  euren Angeboten teil?"). Im Formular ist die Leitfrage richtig, als
  Knotenname war sie unbrauchbar. Das Feld trägt jetzt zusätzlich `kurz`.
- **Kreuztabelle** · Die Randspalte hieß „Summe", war aber keine: Sie zählt
  Akteure. Bei Mehrfachnennung auf der anderen Achse liegen die Zellen höher,
  bei Akteuren ohne Wert auf der anderen Achse liegt der Rand höher. Beides
  kam in den Beispieldaten vor — 8 der 36 Akteure haben kein Bundesland.
  Die Beschriftung lautet jetzt „Akteure", die Fußnote erklärt beide
  Richtungen; zuvor behauptete sie nur eine.
- **Auswertung** · Drei von sechs Blöcken zählten mehrfach, ohne es zu sagen.
  Der Hinweis fehlte bei Bundesland, Bildungsbereich und der abgeleiteten
  Aggregation. Ergänzt.
- **Auswertung** · Das Bundeslandraster führte das Saarland allein unter
  Bayern. Neu geordnet, sodass die Anordnung grob der Geografie folgt.
- **ISCED-Ableitung** · Bei gemischter Auswahl stand die Qualitätsstufe
  `keine_entsprechung` neben einem ausgewiesenen ISCED-Wert — etwa bei
  „Primarstufe und Quartärbereich". Die Qualitätsstufe bewertet jetzt die
  Bereiche, die tatsächlich übersetzt wurden; Bereiche ohne Entsprechung
  stehen daneben unter `iscedOhneEntsprechung`.

### Eine Lücke, die nicht gefüllt wird

- **data/beispiel.json** · Der Tertiärbereich steht in der Auswertung auf
  null. Der fiktive Akteursbestand wurde vor der Umstellung auf die
  Bildungsbereiche erzeugt und enthielt nie einen Wert, der dorthin führt —
  ein Artefakt der Datenerzeugung, keine Aussage über den Sektor. Weil die
  Auswertungsseite leere Zeilen ausdrücklich als Befund liest, wäre das
  irreführend. Der Fall steht jetzt unter `luecken` in der Datendatei und
  wird an der betroffenen Achse ausgewiesen. Nachträglich gefüllt wird er
  nicht: erfundene Einträge machten die Auswertung unehrlich.

### Datierung

- **Kennzeichen** · „zur Entscheidung in WS 4" hieß es an fünf Feldern und im
  Fußtext. Workshop 4 hat stattgefunden; die Felder sind laut Sachstand
  weiterhin offen, aber nicht mehr auf diesen Termin bezogen. Jetzt:
  „Entscheidung offen".

---

## 2026-09-15 · nach Workshop 4

### Bildungsabschnitte: aus einer Liste werden zwei Modelle

- **bildungsabschnitte.json** · Entfällt. Die Achterliste vermischte zwei
  Systematiken; Workshop 4 hat das festgestellt und beide getrennt vorgelegt.
  · *Arbeitskarte im Miro-Board*
- **bildungsstruktur-bereiche.json** · Neu, 6 Werte (Modell B). Formale
  Gliederung des Bildungssystems, trennscharf und an ISCED anschlussfähig.
  · *Arbeitskarte Bildungsstruktur, gestützt auf den Artikel Bildungssystem in
  Deutschland*
- **bildungsabschnitte-lebenslang.json** · Neu, 11 Werte (Modell A).
  Biografische Stationen mit zwei Übergängen und einem Auffangwert. · *Arbeitskarte
  im Miro-Board, Begriffe bestätigt*
- **crosswalk-bildungsabschnitte.json** · Neu. Übersetzung A ↔ B ↔ ISCED, fünf
  Übergänge mit Voraussetzungen, drei offene Punkte. Prüfstand
  `teilweise_bestaetigt`: A zu B ist gegen die Arbeitskarte bestätigt, die
  ISCED-Zuordnung ist recherchiert und nicht abgerufen.
- **isced-2011.json** · Ersetzt `isced.json`. Gleiche neun Stufen, neue id
  (`isced-2011`), Quelle jetzt als Eurostat-Vokabular benannt. Labels
  weiterhin nicht abgerufen. · *UNESCO ISCED 2011*
- **Schemafragment** · `schema/bildungsabschnitt.schema.json` neu. Das Feld
  trägt einen Modell-Diskriminator, damit beide Varianten parallel erfasst
  werden können. Die Übergabe nennt sieben Testfälle unter `examples`;
  enthalten sind drei. Die drei werden von `tools/validate.mjs` geprüft,
  weitere wurden nicht erfunden.

### Handlungsfelder: 23 bestätigte Begriffe

- **handlungsfelder.json** · Die Platzhalterliste mit 18 Begriffen ist durch
  die bestätigte Liste mit 23 Begriffen ersetzt. Damit ist die offene Frage
  aus der Matrix beantwortet: es sind 23, nicht 24. Die Schlüssel sind dabei
  von Englisch auf Deutsch gewechselt. · *Arbeitsliste der Arbeitsgruppe*

  **Das ist ein Schlüsselbruch und damit eine Ausnahme von der
  Stabilitätsregel.** Er ist vertretbar, weil die bisherige Liste
  ausdrücklich ein Platzhalter war und kein Bestandsdatensatz außerhalb
  dieses Repositoriums darauf aufsetzt. Die Zuordnung ist vollständig
  dokumentiert:

  | bisher | neu | Güte | Begründung |
  |---|---|---|---|
| `antiDiscrimination` | `diversitaet` | eindeutig | Antidiskriminierungstraining steht als Beispiel bei Diversitaet. |
| `careerOrientation` | `—` | entfaellt | Berufsorientierung ist laut Negativbeispiel bei Wirtschaft ausdruecklich kein Handlungsfeld, sondern ein Bildungsabschnitt. |
| `civicEducation` | `politische_bildung` | eindeutig | Gleiche Bezeichnung. |
| `culturalEducation` | `kulturelle_bildung` | eindeutig | Gleiche Bezeichnung. |
| `democracyEducation` | `politische_bildung` | eindeutig | Demokratiebildung steht in der neuen Liste als Zusatz bei Politische Bildung. |
| `digitalEducation` | `digitale_transformation` | unscharf | Medienkompetenz steht in der Definition; Digitale Transformation ist aber breiter angelegt. |
| `economicLiteracy` | `wirtschaft` | unscharf | Finanzbildung steht als Beispiel bei Wirtschaft. Was das Feld genau meint, ist laut HANDLUNGSFELDER.md selbst noch offen. |
| `environmentalEducation` | `bne` | eindeutig | Umweltbildung und Natur stehen als Zusatz bei BNE. |
| `familyEducation` | `familienbildung` | eindeutig | Gleiche Bezeichnung. |
| `healthEducation` | `gesundheit_praevention` | eindeutig | Gleiche Bezeichnung. |
| `inclusion` | `inklusion` | eindeutig | Gleiche Bezeichnung. |
| `interculturalEducation` | `interkulturelle_bildung` | eindeutig | Gleiche Bezeichnung. |
| `languageAndLiteracy` | `sprachbildung` | eindeutig | Lese- und Schreibfoerderung sind Teil der Definition von Sprachbildung. |
| `mentoring` | `persoenlichkeitsentwicklung` | unscharf | Mentoring zur Staerkung von Selbstwirksamkeit steht als Beispiel dort. Mentoring ist aber eher ein Format als ein Handlungsfeld. |
| `stemEducation` | `mint_bildung` | eindeutig | Gleiche Bezeichnung. |
| `sustainabilityEducation` | `bne` | eindeutig | Gleiche Bezeichnung. |
| `violencePrevention` | `gesundheit_praevention` | unscharf | Naechstliegender Wert. Die neue Liste kennt kein eigenes Feld fuer Gewaltpraevention. |
| `volunteering` | `engagementfoerderung` | eindeutig | Gleiche Bezeichnung. |

  Die als *unscharf* markierten Zuordnungen sind Setzungen für die
  Beispieldaten, keine fachliche Festlegung. `careerOrientation` entfällt
  ersatzlos: Das Negativbeispiel bei „Wirtschaft" ordnet Berufsorientierung
  ausdrücklich den Bildungsabschnitten zu, nicht den Handlungsfeldern. Ein
  Beispielakteur hatte nur dieses Feld und trägt jetzt „Wirtschaft".

- **engagementfelder.json** · Ersetzt `ziviz-engagementfelder.json`. Gleiche
  16 Felder, neue id (`engagementfelder`), Prüfstand von `bestaetigt` auf
  `recherchiert` gesenkt — der Hauptbericht wurde nicht abgerufen.
- **crosswalk-handlungsfelder.json** · Neu, 23 Zuordnungen zu Engagementfeld
  und ICNPO-Gruppe, DCAT-Datenthema konstant `EDUC`. Status `vorschlag`; je
  Zeile eine Sicherheitsangabe (14 hoch, 7 mittel, 2 niedrig).
- **crosswalks.json** · Nicht mehr geladen, nach `vocab/archiv/` verschoben.
  Die Datei enthält den dokumentierten Prüflauf gegen openeduhub vom
  15.09.2026 und bleibt als Beleg erhalten.

### Nach der Review reduzierte Listen

- **organisationsstatus.json** · Von fünf auf drei Werte: `aktiv`, `ruhend`,
  `aufgeloest`. `in_gruendung` und `in_aufloesung` bleiben als
  `deprecated: true` mit `ersetztDurch` stehen. Die Schlüssel sind dabei von
  Englisch auf Deutsch umgestellt — die Übergabe nennt sie ausdrücklich so.
  Zuordnung: `active`→`aktiv`, `dormant`→`ruhend`, `ended`→`aufgeloest`,
  `founding`→`in_gruendung`, `dissolving`→`in_aufloesung`. · *Workshop 4*
- **zielgruppenrollen.json** · Auf drei Rollen reduziert. `policyMakers` und
  `funders` sind `deprecated`, weil sie keine Teilnahmerolle beschreiben. Die
  Schlüssel der drei bleibenden Rollen sind **unverändert** — hier war kein
  Bruch nötig. · *Workshop 4*

### Neu für den Formulartest

- **raumgliederung.json** · Neu, 32 Einträge für das Trichterprinzip. Die 16
  Länderschlüssel stammen aus `bundeslaender.json`, die 16 Gemeindeschlüssel
  sind recherchiert. **Prüflauf gescheitert:** Der Abruf des amtlichen
  Gemeindeverzeichnisses wurde am 15.09.2026 von der Egress-Richtlinie der
  Arbeitsumgebung mit HTTP 403 abgelehnt. Die Datei bleibt auf
  `pruefstand: "recherchiert"` stehen; es wurde nichts geraten.
- **reichweite-grob.json** · Neu, 4 Werte für Variante 3 des Formulartests.
  Setzung der Arbeitsgruppe, nicht beschlossen.

### Formatänderung

- **alle** · Die `.json` ist jetzt die Quelle, die `.js` wird daraus erzeugt
  (`tools/vokabular-einbetten.mjs`). Damit sind die Vokabulare für
  Prüfwerkzeuge und andere Plattformen ohne Umweg über den Browser lesbar,
  ohne dass die Offline-Tauglichkeit verlorengeht. Inhaltlich hat sich beim
  Umbau nichts geändert: alle 17 vorhandenen Dateien ergaben nach dem
  Erzeugen denselben Datensatz wie zuvor.
- **quelle.pruefstand** · Zwei Werte ergänzt (`teilweise_bestaetigt`,
  `recherchiert`). Wo die Lieferung einen freieren Wortlaut trug, steht
  dieser jetzt in `quelle.pruefstandDetail`; der Wortlaut ist erhalten, der
  maschinenprüfbare Wert daneben.

### Prüfläufe

- **15.09.2026 · Gemeindeverzeichnis (destatis)** · Abruf gescheitert, HTTP
  403 durch die Egress-Richtlinie. Keine Änderung an der Datei.
- **15.09.2026 · Verweisprüfung** · Neu im Loader: Zeigt eine Zuordnung in
  einem Crosswalk auf einen Schlüssel, den es nicht gibt, oder fehlt einem
  Handlungsfeld die Aggregation, wird das in der Seite gemeldet. Gegenprobe
  mit absichtlich verbogenen Zielen: drei Mängel korrekt erkannt.
- **15.09.2026 · Schema- und Vokabularprüfung** · `tools/validate.mjs`
  eingeführt. Gegenprobe mit fünf absichtlich eingebauten Verstößen: alle
  fünf erkannt, Exitcode 1.

---

## 2026-09-15

### Vokabulare ausgelagert

- **alle** · Die Wertelisten sind aus `fields.js` nach `vocab/` gewandert,
  je Vokabular eine Datei mit Version, Quelle, Abrufdatum und Prüfstand.
  `fields.js` referenziert sie nur noch über ihre id. · *Architekturänderung
  aus Auftrag 2*
- **Dateiformat** · Die Dateien tragen die Endung `.js` und rufen
  `EduVocab.register(...)` mit dem vereinbarten JSON-Objekt auf. Grund:
  Browser blockieren `fetch()` auf `file://` mit CORS, echte `.json`-Dateien
  wären beim Öffnen per Doppelklick nicht ladbar. Der Inhalt unterhalb von
  `register(` ist wörtlich das vereinbarte Format. · *geprüft und mit der
  Projektleitung abgestimmt*

### Neue Vokabulare

- **ziviz-engagementfelder.js** · Neu, 16 Felder, Reihenfolge und Wortlaut
  wie vorgelegt. · *ZiviZ-Survey 2023, Hauptbericht*
- **icnpo-gruppen.js** · Neu, 12 Gruppen plus vier Untergruppen von Gruppe 2.
  Englische Originalbezeichnung in `label_en`. · *ICNPO, Salamon/Anheier 1997*
- **isced.js** · Neu, 9 Stufen ED0 bis ED8. · *ISCED 2011 (UNESCO UIS)*
- **lernformen.js** · Neu, 4 Konzepte aus `educationalContext`, die keine
  Bildungsphasen sind. Als Vorschlag gekennzeichnet. · *openeduhub*
- **herkunftsquellen.js** · Neu, 4 Quellenarten für Kontaktdaten. · *Ableitung
  aus der Rechtsrecherche (Art. 14 DSGVO)*
- **crosswalks.js** · Neu. Handlungsfeld → ZiviZ, ICNPO, DCAT-Datenthema;
  Bildungsabschnitt → ISCED, educationalContext, je mit Qualitätsvermerk.

### Prüfläufe

- **lernformen.js, crosswalks.js** · Lauf 1 erfolgreich. Die zwölf Slugs von
  `educationalContext` sind bestätigt. Vier der fünf als unsicher markierten
  Labels haben sich bestätigt; **`grundschule` trägt das prefLabel
  „Primarstufe", nicht „Grundschule"** — Label übernommen, Slug unverändert.
  Zusätzlich ISCED-Bezüge über `skos:exactMatch` gewonnen und in
  `crosswalks.js` vermerkt. · *raw.githubusercontent.com/openeduhub/oeh-metadata-vocabs*
- **isced.js** · Lauf 2 fehlgeschlagen. `dd.eionet.europa.eu` ist aus der
  Arbeitsumgebung nicht erreichbar. Keine Änderung, `pruefstand` bleibt
  `abgeleitet`.
- **Wikidata-Properties** · Lauf 3 fehlgeschlagen. `wikidata.org` ist aus der
  Arbeitsumgebung gesperrt (403). P227 und P10301 unverändert aus der
  Recherche übernommen, im Prototyp nur als Hinweistext geführt.
- **ziviz-engagementfelder.js** · Lauf 4 fehlgeschlagen. `ziviz.de` und
  `stifterverband.org` sind gesperrt. Keine Änderung.

### Korrekturen während der Einarbeitung

- **handlungsfelder.js** · Der Schlüssel des ersten Begriffs war beim
  Auslagern versehentlich von `democracyEducation` auf `demokratiebildung`
  geändert worden. Zurückgesetzt, bevor etwas veröffentlicht wurde —
  Schlüssel sind stabil, eine Änderung hätte 11 bestehende Datensätze
  gebrochen.
- **ziviz-engagementfelder.js** · Bei Bindestrich-Komposita entstanden
  doppelte Unterstriche im Schlüssel (`umwelt__und_naturschutz`).
  Zusammengezogen, bevor die Datei in Gebrauch war.

### Nachweis

- **Deprecated-Logik** · An `healthEducation` testweise nachgewiesen: Der
  Begriff verschwindet aus der Auswahl, bleibt in einem bestehenden Datensatz
  sichtbar, nennt den Ersatzbegriff und lässt sich gezielt entfernen. Testfall
  anschließend zurückgesetzt; die Datei ist identisch mit dem Stand davor.
