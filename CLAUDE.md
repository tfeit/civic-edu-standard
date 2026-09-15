# Arbeitskontext

Diese Datei beschreibt, wie in diesem Repositorium gearbeitet wird. Für den
fachlichen Stand: [README.md](README.md) und [SACHSTAND.md](SACHSTAND.md).

---

## Was hier liegt

```
SACHSTAND.md              Ergebniszusammenfassung, Version 0.1
BILDUNGSABSCHNITTE.md     Die zwei Bildungsmodelle, mit Übersetzung
HANDLUNGSFELDER.md        Die 23 Handlungsfelder, mit Abgrenzungen
schema/                   JSON-Schema-Fragmente
tools/                    Werkzeuge (Node, keine Abhängigkeiten)
docs/auftraege/           Die Aufträge, auf die Änderungen zurückgehen
prototype/                Der Klickdummy
  ├── index.html          Formular
  ├── schema.html         Datenmodell als Netz
  ├── simulation.html     Kreuztabelle
  ├── auswertung.html     Auswertungsansicht, druckbar
  ├── fields.js           Das Feldmodell — einzige Quelle für Felder
  ├── app.js              Der Renderer — kennt Typen, keine Felder
  ├── akteure.js          36 fiktive Organisationen
  ├── data/beispiel.json  Beispieldatensatz für die Auswertung
  ├── vocab/*.json        Die Vokabulare (Quelle)
  ├── vocab/*.js          Daraus erzeugt, für den Doppelklick-Betrieb
  ├── VOKABULARSTAND.md   Herkunft und Belastbarkeit je Vokabular
  └── CHANGELOG.md        Jede Vokabularänderung, jeder Prüflauf
```

---

## Fünf Regeln

**1 · Kein Build, kein Framework, keine CDN-Abhängigkeit.**
Der Prototyp muss per Doppelklick auf `index.html` laufen — ohne Server, ohne
Netz. Das ist keine Stilfrage: Er wird in Workshops gezeigt, in denen das WLAN
nicht trägt. Deshalb auch `.js` neben `.json`: Browser blockieren `fetch()` auf
`file://` mit CORS.

**2 · `app.js` kennt Typen, nicht Felder.**
Ein neues Feld entsteht durch einen Eintrag in `fields.js`, nicht durch
Code in `app.js`. Nur wenn ein Feld einen Bedienungstyp braucht, den es
noch nicht gibt, kommt ein Renderer dazu. Der Prüfstein: Eine Änderung an
`fields.js` oder `vocab/` muss sich im Formular *und* in der JSON-Vorschau
zeigen, ohne dass `app.js` angefasst wird.

**3 · Schlüssel sind stabil.**
Ein `key` wird nicht umbenannt. Wer ihn ändert, bricht jeden Datensatz, der
ihn führt. Terme werden nie gelöscht, sondern auf `deprecated: true` gesetzt.

> Diese Regel wurde bei den Handlungsfeldern und beim Organisationsstatus
> einmal gebrochen — begründet, dokumentiert und mit vollständiger
> Zuordnungstabelle im `CHANGELOG.md`. Das war vertretbar, weil beide Listen
> ausdrücklich Platzhalter waren. Es ist die Ausnahme, nicht der Anfang einer
> Praxis.

**4 · Herkunft vor Vollständigkeit.**
Jedes Vokabular trägt Version, Quelle, Abrufdatum und Prüfstand. Scheitert
ein Abruf, bleibt die Datei unverändert und der Fehlversuch wird mit Datum
vermerkt. **Nicht raten.** Ein nicht dokumentierter Prüflauf ist kein
Prüflauf.

**5 · Nichts ist beschlossen, und das muss man sehen.**
Unentschiedene Felder tragen ein Kennzeichen. Vorschläge aus der Recherche
sind als Vorschläge markiert. Definitionen im Entwurf sagen das im Tooltip.
Eine Sperre, wo nur ein Richtwert beschlossen ist, wird im Workshop als
Entscheidung missverstanden — deshalb weiche Grenzen statt harter.

---

## Werkzeuge

```
node tools/vokabular-einbetten.mjs             .js aus .json erzeugen
node tools/vokabular-einbetten.mjs --pruefen   melden, ob beide auseinanderlaufen
node tools/validate.mjs                        Beispieldatensatz prüfen
```

Beide laufen im Pages-Workflow, bevor veröffentlicht wird. Nach jeder
Änderung an `prototype/vocab/*.json` oder `prototype/data/*.json` muss
`vokabular-einbetten.mjs` laufen — sonst zeigt die Seite einen alten Stand.

---

## Gestaltung

Akzentfarbe `#1F3864`. Ruhige Typografie, keine Werbesprache, keine
Superlative. Sachliche Beschriftungen; wo eine Angabe unsicher ist, steht das
dabei. Nüchtern heißt nicht farblos: Die Chips dürfen bunt sein, die Flächen
dahinter bleiben ruhig.

**Grundfarben**

| Zweck | Farbe | Einsatz |
|---|---|---|
| Akzent | `#1F3864` | Pflicht-Chip, Balken, aktive Auswahl |
| Akzent hell | `#E8ECF4` | Hinweisflächen, gewählte Optionen |
| Linie | `#DFE2E8` | Trennlinien, Umrandungen |

**Chips — eine Familie je Bedeutung**

Alle Chips teilen eine Grundform (`.chip`) und tragen eine Familienklasse.
Jede Familie ist ein Dreiklang aus Schrift, Fläche und Kante.

| Klasse | Bedeutung | Schrift auf Fläche |
|---|---|---|
| `.chip-pflicht` | Pflichtangabe | `#FFFFFF` auf `#1F3864` — 11,6:1 |
| `.chip-empfohlen` | empfohlen | `#185C4A` auf `#E4F2ED` — 6,8:1 |
| `.chip-optional` | optional | `#5A5E66` auf `#F1F3F6` — 5,9:1 |
| `.chip-berechnet` | wird berechnet | `#4B3A7A` auf `#EEEAF8` — 8,1:1 |
| `.chip-offen` | noch zu entscheiden | `#8A4B00` auf `#FDF0DF` — 6,1:1 |
| `.chip-vorschlag` | Vorschlag, nicht beschlossen | `#1F5A78` auf `#E3F1F8` — 6,5:1 |
| `.chip-abgeleitet` | abgeleiteter Wert | `#1F3864` auf `#E8ECF4` — 9,8:1 |

Die Werte sind nachgerechnet, nicht geschätzt. Neue Familien nur mit
gemessenem Kontrast über 4,5:1 aufnehmen.

**Farbe trägt nie allein.** Jeder Chip nennt seine Bedeutung im Text. Das
Pflichtkennzeichen hat zusätzlich Sternchen und gefüllte Fläche; optionale
Felder tragen ein sichtbares Label „optional". In der Review wurde ein
optionales Feld für ein Pflichtfeld gehalten — daher die mehrfache
Kennzeichnung.

**Bewegung ist Zugabe.** Übergänge dauern 140 ms und betreffen nur Farbe,
Schatten und Breite. Unter `prefers-reduced-motion: reduce` werden sie
abgeschaltet — das ist keine Kür, Bewegung kann Schwindel auslösen.

**Datierung.** Kennzeichen nennen keinen Termin. „zur Entscheidung in WS 4"
war nach dem vierten Workshop falsch datiert; „noch zu entscheiden" bleibt
richtig, solange die Frage offen ist.

---

## Barrierefreiheit

Nicht verhandelbar, weil die Zielgruppe zivilgesellschaftliche
Organisationen sind:

- Jedes Bedienelement hat eine Beschriftung, jede Gruppe eine
  Gruppenbeschriftung
- Fieldsets für zusammengehörige Felder
- Vollständige Tastaturbedienung, sichtbarer Fokus (3 px)
- Keine reine Farbcodierung
- Tabellen mit `th[scope]` — die Tabelle ist die Darstellung, nicht ein
  Anhang zum Diagramm
- Überschriftenfolge ohne Sprünge, genau eine `h1` je Seite

---

## Vor jeder Übergabe prüfen

Diese Punkte werden von Hand nachgestellt, nicht nur automatisch:

- [ ] Alle vier Seiten öffnen sich per Doppelklick, ohne Konsolenfehler
- [ ] Der Vokabular-Loader meldet null Mängel
- [ ] Ein vollständiges Profil lässt sich in unter zehn Minuten ausfüllen
- [ ] Der Modellwechsel bei den Bildungsabschnitten fragt nach und erklärt,
      was eine Übersetzung geleistet hätte
- [ ] Übergänge sind nur wählbar, wenn beide angrenzenden Bereiche gewählt
      sind; die nicht wählbaren stehen deaktiviert da, mit Begründung
- [ ] Die drei Geografie-Varianten schalten sauber um; `_test` erscheint in
      der Vorschau, aber nicht im Kopierten
- [ ] Der Ausdruck der Auswertung auf A4 ist ohne Navigation lesbar
- [ ] `node tools/validate.mjs` läuft durch
- [ ] `node tools/vokabular-einbetten.mjs --pruefen` meldet keine Abweichung
- [ ] Kein Text unter 4,5:1 Kontrast (bzw. 3:1 bei großer Schrift)

---

## Sprache

Deutsch, auch in Commit-Nachrichten und Code-Kommentaren. Kommentare
begründen Entscheidungen, sie beschreiben nicht, was der Code ohnehin sagt.
Wo eine Lösung nicht offensichtlich ist, gehört der Grund dazu — besonders
dort, wo etwas absichtlich *nicht* gemacht wurde.

Commits klein und thematisch geschnitten.
