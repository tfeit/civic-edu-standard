# Changelog

Ein Eintrag je Vokabularänderung und je Prüflauf — auch dann, wenn das
Ergebnis „unverändert" oder „Abruf fehlgeschlagen" lautet.

Format: Datum · Datei · Änderung · Quelle.

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
