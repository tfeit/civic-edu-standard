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
dabei.

| Zweck | Farbe | Einsatz |
|---|---|---|
| Akzent | `#1F3864` | Pflichtkennzeichen, Balken, aktive Auswahl |
| Akzent hell | `#E8ECF4` | Hinweisflächen, gewählte Optionen |
| Linie | `#D2D5DB` | Trennlinien, Umrandungen |
| Warnung | `#B58900` / `#FDF6E3` | weiche Grenzen |

**Farbe trägt nie allein.** Das Pflichtkennzeichen hat Text, Sternchen *und*
eine gefüllte Fläche; optionale Felder tragen ein sichtbares Label
„optional". In der Review wurde ein optionales Feld für ein Pflichtfeld
gehalten — daher die dreifache Kennzeichnung.

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

---

## Sprache

Deutsch, auch in Commit-Nachrichten und Code-Kommentaren. Kommentare
begründen Entscheidungen, sie beschreiben nicht, was der Code ohnehin sagt.
Wo eine Lösung nicht offensichtlich ist, gehört der Grund dazu — besonders
dort, wo etwas absichtlich *nicht* gemacht wurde.

Commits klein und thematisch geschnitten.
