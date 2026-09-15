# Übergabe: Prototyp „Akteursprofil" nach Workshop 4

## 0 · Ausgangslage

Der Klickdummy unter `prototype/` existiert (statische HTML-Seite ohne Framework, Formular vollständig aus einem Feldmodell gerendert, Live-JSON-Vorschau, offline lauffähig). Workshop 4 hat vier Dinge verändert:

1. **GitHub Pages ist jetzt aktiviert** (Source: GitHub Actions). Der Prototyp soll deploybar sein und über die Pages-URL erreichbar werden — das war der Grund, warum er im Workshop nur lokal gezeigt werden konnte.
2. **Bildungsabschnitte sind ungeklärt.** Statt einer Liste gibt es zwei konkurrierende Modelle. Beide liegen jetzt als Vokabulardateien vor und müssen im Prototyp **umschaltbar** sein.
3. **Geografie wird am Formular getestet.** Die Arbeitsgruppe hat bewusst nicht entschieden, sondern beschlossen, die Varianten einzubauen und zu prüfen, was Ausfüllende verstehen.
4. **Der Prototyp hat zwei Zielgruppen.** Für ein datenaffines Publikum ist die JSON-Ansicht richtig. Für zivilgesellschaftliche Organisationen ist sie zu technisch — hier wird zusätzlich eine Auswertungsansicht gebraucht, die zeigt, was der Standard ermöglicht.

**Leitprinzip, unverändert:** Nichts hiervon ist beschlossen. Alle Vokabulare sind Arbeitsstand mit Quellenangabe und müssen im UI als solcher erkennbar sein.

---

## 1 · Mitgelieferte Dateien

Diese Dateien gehören nach `prototype/vocab/` beziehungsweise `schema/`:

```
vocab/bildungsstruktur-bereiche.json      Modell B, 6 Werte
vocab/bildungsabschnitte-lebenslang.json  Modell A, 11 Werte inkl. Auffangwert
vocab/isced-2011.json                     Referenzachse, wird nicht erfasst
vocab/crosswalk-bildungsabschnitte.json   Übersetzung A ↔ B ↔ ISCED, Übergänge, offene Punkte
vocab/handlungsfelder.json                23 Felder, ersetzt die bisherige Platzhalterliste
vocab/engagementfelder.json               Aggregationsreferenz, wird nicht erfasst
vocab/crosswalk-handlungsfelder.json      Aggregationsvorschlag je Handlungsfeld
schema/bildungsabschnitt.schema.json      JSON Schema Draft-07, gegen Testfälle validiert
BILDUNGSABSCHNITTE.md                     Dokumentation der Bildungsmodelle
HANDLUNGSFELDER.md                        Dokumentation der Handlungsfelder
```

**Beide Modelle sind vollständig.** Modell A hat 11 Werte (10 Abschnitte plus Auffangwert), Modell B hat 6. Die Begriffe stammen aus der Primärquelle; Definitionen, Beispiele und Negativbeispiele sind Entwürfe und tragen je Begriff `definitionStatus: "entwurf"`. Stelle diesen Status im UI dezent dar — ein kleiner Hinweis am Tooltip genügt: „Definition im Entwurf". Erfinde keine fehlenden Definitionen nach.

**Zusätzlich neu:** `vocab/handlungsfelder.json` mit 23 Feldern, `vocab/engagementfelder.json` als Aggregationsreferenz und `vocab/crosswalk-handlungsfelder.json`. Die Platzhalterliste für Handlungsfelder aus dem ersten Auftrag wird damit vollständig ersetzt.

---

## 2 · Aufgabe A — Bildungsabschnitte mit Modellumschaltung

Das Feld `educationStages` wird ersetzt durch die Struktur aus `schema/bildungsabschnitt.schema.json`:

```json
{
  "modell": "bildungsstruktur-bereiche",
  "werte": ["sekundarstufe_1", "sekundarstufe_2"],
  "uebergaenge": ["sek1_sek2"],
  "quelle": "selbstauskunft"
}
```

**Im Formular:**

- Über dem Feld ein Umschalter zwischen den beiden Modellen, beschriftet mit den Labels aus den Vokabulardateien, nicht mit den Schlüsseln. Daneben ein Hinweis: „Zwei Systematiken stehen zur Entscheidung. Hier lassen sich beide ausprobieren."
- Beim Umschalten wird die Auswahl **verworfen**, nicht übersetzt — mit vorheriger Rückfrage. Begründung: Die Rückübersetzung von Modell A nach B ist bei „schulische Bildung" nicht möglich, eine automatische Umrechnung würde also falsche Sicherheit erzeugen. Genau dieser Punkt soll im Gespräch sichtbar werden. Zeige stattdessen nach dem Umschalten einen Hinweis, was eine Übersetzung geleistet hätte und wo sie bricht (aus `crosswalk-bildungsabschnitte.json`, Feld `hinweis`).
- Mehrfachauswahl, mindestens ein Wert.
- Jeder Wert bekommt einen Tooltip mit Definition und, sofern vorhanden, der ISCED-Entsprechung aus dem Crosswalk. Bei `quartaerbereich` lautet der Hinweis: „Kein internationales Äquivalent — eigenes Konzept der Arbeitsgruppe."
- Die Leitfrage steht als Hilfetext unter dem Feld: **„In welcher Bildungsphase stehen die Menschen, die unmittelbar an euren Angeboten teilnehmen?"** Dazu das Negativbeispiel: „Eine Organisation, die Lehrkräfte fortbildet, wählt Quartärbereich — nicht Schulbildung. Die Schülerinnen und Schüler erscheinen im Zielgruppenfeld."

**Übergänge (nur bei Modell B):**

- Eigene, optionale Mehrfachauswahl unterhalb der Bereiche, mit Badge „Vorschlag aus Workshop 4 — nicht beschlossen".
- Ein Übergang ist nur wählbar, wenn beide angrenzenden Bereiche ausgewählt sind (`voraussetzt` im Crosswalk). Nicht wählbare Übergänge werden deaktiviert dargestellt, mit Begründung im Tooltip — nicht ausgeblendet, weil sonst unklar bleibt, warum sie fehlen.
- Ausnahme: `sek2_erwerbstaetigkeit` setzt nur `sekundarstufe_2` voraus. Dieser Wert trägt zusätzlich den Hinweis aus `offenerPunkt` im Crosswalk.
- Bei Modell A ist die Übergangsauswahl nicht sichtbar (das Modell führt Übergänge als eigene Werte).

**Im JSON-Bereich** erscheint zusätzlich ein abgeleiteter Block, analog zum Bundesland bei der Geografie:

```json
"derived": { "isced": ["ED2", "ED3"], "iscedQualitaet": "mehrdeutig" }
```

Die Qualitätsstufe wird aus dem Crosswalk übernommen. Das zeigt im Gespräch, dass der Standard international anschlussfähig ist, ohne dass jemand ISCED ausfüllen muss.

---

## 2b · Aufgabe A2 — Handlungsfelder

Die Platzhalterliste wird durch `vocab/handlungsfelder.json` ersetzt (23 Werte, Definitionen als Entwurf, teilweise mit einem Zusatz in Klammern — der gehört in den Tooltip, nicht ins Label).

- **Mehrfachauswahl mit weicher Obergrenze.** Das Vokabular führt `empfohleneObergrenze: 5`. Keine harte Sperre: Ab der sechsten Nennung erscheint ein ruhiger Hinweis („Je mehr Felder, desto weniger sagt die Angabe aus"), die Auswahl bleibt möglich. Grund: Die Obergrenze ist ein Vorschlag, kein Beschluss — eine Sperre würde im Workshop als Entscheidung missverstanden.
- **Schwerpunktfeld.** `empfohlenerSchwerpunkt: true` — ein zusätzliches Auswahlfeld, nur aus den angekreuzten Feldern wählbar. Dieselbe Mechanik wie beim Primärziel der Nachhaltigkeitsziele; beide Felder sollten sich gleich verhalten.
- **Abgeleitete Aggregation im JSON**, analog zur ISCED-Ableitung bei den Bildungsabschnitten:

```json
"derived": { "engagementfelder": ["Bildung und Erziehung", "Kultur"], "icnpo": ["2", "1"], "dataTheme": "EDUC" }
```

Die Aggregation wird **nicht abgefragt**. Zeige sie nur in der Vorschau, grau hinterlegt, mit dem Hinweis „abgeleitet, nicht erfasst".
- Bei Zuordnungen mit `sicherheit: "niedrig"` (derzeit zwei) erscheint im Tooltip der zugehörige `hinweis` aus dem Crosswalk. Das macht die offenen Stellen im Gespräch sichtbar, statt sie zu verstecken.

## 3 · Aufgabe B — Geografie als Testumgebung

Die Arbeitsgruppe hat **nicht** entschieden und will am Formular prüfen, was verständlich ist. Baue deshalb drei Varianten, umschaltbar über einen kleinen Variantenwähler am Blockkopf (für die Arbeitsgruppe sichtbar, im JSON ohne Wirkung):

**Variante 1 — Trichterprinzip.** Ein Suchfeld über administrative Ebenen. Man gibt den präzisesten Raum an; alle übergeordneten Ebenen ergeben sich daraus und werden als abgeleitete Chips angezeigt. Wer „Bonn" eingibt, bekommt NRW und Deutschland automatisch. Für den Prototyp genügt eine eingebettete Liste: alle 16 Bundesländer vollständig, dazu eine kleine Auswahl an Kreisen und Gemeinden als Demonstrationsmaterial — klar als solche gekennzeichnet, kein Anspruch auf Vollständigkeit, kein externer Dienst.

**Variante 2 — Stufe plus Gebiet.** Zwei getrennte Felder: eine Reichweitenstufe (lokal · regional · landesweit · bundesweit · international · ortsunabhängig) und darunter eine Gebietsliste, die nur bei den ersten drei Stufen erscheint. Das ist die Variante, die dem Einwand aus dem Workshop Rechnung trägt: Wer nur in einer Stadt tätig ist, ist nicht automatisch landesweit tätig.

**Variante 3 — grobe Stufe.** Nur vier Werte: lokal · regional · national · supranational. Keine Gebietsangabe. Die minimalistische Variante, die prüft, ob Einfachheit die Ausfüllquote erhöht.

Jede Variante erzeugt ein Bewertungsfeld darunter: drei Knöpfe „verständlich · unklar · zu aufwendig" plus ein Notizfeld. Die Bewertungen sammeln sich in der JSON-Vorschau unter einem Schlüssel `_test`, der beim Kopieren ausgeschlossen wird. So lässt sich der Formulartest aus dem Workshop direkt auswerten, ohne Backend.

Über dem Block ein Satz zur Abgrenzung: **„Wo wirkt die Organisation — getrennt von der Frage, wo sie ansässig ist."**

---

## 4 · Aufgabe C — Anpassungen aus der Review

**Status.** Werteliste reduzieren. Grund: „in Gründung" ist schwer pflegbar und vermutlich nicht handlungsrelevant; entscheidend ist aktiv gegenüber aufgelöst. Neue Liste in `vocab/organisationsstatus.json`: `aktiv` (Standard) · `ruhend` · `aufgeloest`. Die Werte `in_gruendung` und `in_aufloesung` bleiben als `deprecated: true` in der Datei stehen, mit `ersetztDurch`. Am Feld ein Hilfetext: „Beendete Organisationen bleiben im Bestand — nur so bleiben vergangene Kooperationen nachvollziehbar."

**Verbindlichkeit sichtbar machen.** In der Review wurde ein optionales Feld für ein Pflichtfeld gehalten. Die Kennzeichnung muss deutlicher werden: Pflichtfelder mit Markierung **und** Textlabel, optionale Felder mit sichtbarem Label „optional", nicht nur durch Abwesenheit. Kein Verlass auf Farbe allein.

**Nachhaltigkeitsziele.** Keine feste Obergrenze setzen — sie ist nicht beschlossen. Stattdessen: Mehrfachauswahl ohne Limit, aber ein zusätzliches Auswahlfeld **Primärziel**, das nur aus den angekreuzten Zielen wählbar ist. Ab der vierten Nennung erscheint ein ruhiger Hinweis: „Je mehr Ziele, desto weniger sagt die Angabe aus. Welches ist das primäre?" Das ist die im Workshop diskutierte Alternative zur Begrenzung und lässt sich am Prototyp unmittelbar erproben.

**Zielgruppen.** Die Leitfrage wird zur Feldbeschriftung: **„Wer nimmt an euren Angeboten teil?"** Je Eintrag eine Rolle und eine Bezeichnung. Rollenwerte: Endbegünstigte · Multiplikator:innen und Fachkräfte · Institutionen. Hinweis unter dem Feld: „Eine Person kann mehrere Rollen haben. Maßgeblich ist, in welcher Rolle sie an eurem Angebot teilnimmt — ‚Lehrkräfte und Kinder' sind zwei Einträge."

**Cover.** Unverändert optional, aber mit dem Hilfetext: „Bannerbild, wie man es von Profilseiten kennt. Viele Organisationen haben keines — das Feld darf leer bleiben."

---

## 5 · Aufgabe D — Auswertungsansicht

Neu. Zweck: zeigen, was der Standard ermöglicht, für Menschen, die mit einem Austauschformat nichts anfangen können.

- Eine zweite Seite `prototype/auswertung.html`, vom Formular aus verlinkt und zurück.
- Inhalt: eine Handvoll Auswertungen über einen eingebetteten Beispieldatensatz — Verteilung nach Bildungsabschnitt, nach Reichweitenstufe, nach Handlungsfeld, nach Rechtsform; dazu eine schlichte Deutschlandkarte oder ersatzweise ein Balkendiagramm je Bundesland.
- Der Beispieldatensatz wird später durch echte Daten ersetzt. Baue jetzt eine Datei `prototype/data/beispiel.json` mit **klar als fiktiv gekennzeichneten** Einträgen (10–15 genügen), die dem Schema entsprechen, und lies die Ansicht ausschließlich daraus. Kein Hardcoding von Zahlen in der Seite.
- **Druckbarkeit ist Anforderung, nicht Kür:** Ein Print-Stylesheet, das die Ansicht auf A4 sauber umbricht, Navigation ausblendet und Diagramme in Graustufen lesbar hält. Die Ansicht soll ausgedruckt und in einer Runde herumgegeben werden können.
- Keine externen Diagrammbibliotheken — Inline-SVG genügt und hält die Offline-Tauglichkeit.
- Über der Ansicht ein Satz, der den Zweck benennt: „Was sichtbar wird, wenn Organisationsdaten einer gemeinsamen Struktur folgen. Beispieldaten, frei erfunden."

---

## 6 · Aufgabe E — Deployment und Validierung

**GitHub Pages.** Pages ist auf Source „GitHub Actions" gestellt. Lege einen Workflow `.github/workflows/pages.yml` an, der den Inhalt von `prototype/` als statische Site veröffentlicht — Standard-Actions für Upload und Deploy, kein Build-Schritt. Prüfe, dass alle Pfade relativ sind, damit die Seite unter einem Unterpfad funktioniert.

**Schema-Validierung als Prüfschritt.** Ein kleines Skript `tools/validate.mjs`, das den Beispieldatensatz gegen `schema/bildungsabschnitt.schema.json` prüft und bei Abweichung mit Fehlercode endet. Optional im selben Workflow als vorgelagerter Job. Die Schemadatei wurde bereits gegen sieben Testfälle validiert; die Fälle sind im Schema unter `examples` dokumentiert und können als Grundlage dienen.

**Exportfunktion.** Im Formular ein Knopf, der den aktuellen Datensatz als `.json` herunterlädt. Das ist der Weg, auf dem aus dem Prototyp erzeugte Beispiele in die weitere Arbeit gelangen.

---

## 7 · Was unverändert bleibt

Offline-Tauglichkeit ohne Build-Toolchain und ohne externe Abhängigkeiten · Rendering vollständig aus Feldmodell und Vokabulardateien · keine Vokabulare inline im Code · stabile Schlüssel getrennt vom Label · `deprecated` statt Löschung · Live-JSON-Vorschau mit Kopierfunktion · Pflichtfeldzähler · Zehn-Minuten-Timer · Herkunftsangaben bei Kontaktdaten · Badges bei unbeschlossenen Feldern · Barrierefreiheit (Label-Zuordnung, Fieldsets, Tastaturbedienung, sichtbarer Fokus, keine reine Farbcodierung) · Akzentfarbe `#1F3864`, ruhige Typografie, keine Werbesprache · zurückgestellte Blöcke bleiben draußen.

**Das härteste Abnahmekriterium bleibt:** Eine kleine Initiative muss das Formular in unter zehn Minuten ausfüllen können. Alle Erweiterungen dieses Auftrags sind so zu bauen, dass sie das nicht gefährden — Varianten und Testfelder sind Werkzeuge für die Arbeitsgruppe, nicht Teil des Ausfüllwegs. Wenn beides kollidiert, gewinnt die Ausfüllbarkeit.

---

## 8 · Definition of Done

1. Die vier Vokabulardateien und das Schema liegen im Repository und werden vom Loader validiert.
2. Bildungsabschnitte sind zwischen beiden Modellen umschaltbar; das Verwerfen der Auswahl beim Wechsel ist erklärt, nicht stillschweigend.
3. Übergänge funktionieren nur bei Modell B, mit korrekter Voraussetzungsprüfung und sichtbarer Begründung bei deaktivierten Werten.
4. Der abgeleitete ISCED-Block erscheint in der JSON-Vorschau, mit Qualitätsstufe.
5. Handlungsfelder nutzen die 23er-Liste, weiche Obergrenze und Schwerpunktfeld funktionieren, die Aggregation erscheint abgeleitet im JSON.
5a. Entwurfsstatus von Definitionen ist im UI erkennbar; fehlende Definitionen erzeugen keine leeren Tooltips.
6. Drei Geografie-Varianten sind umschaltbar, jede mit Bewertungsfeld; die Bewertungen landen unter `_test` und werden beim Kopieren ausgeschlossen.
7. Status, Verbindlichkeitskennzeichnung, Primärziel-Logik, Zielgruppen-Leitfrage und Cover-Hilfetext sind umgesetzt.
8. `auswertung.html` existiert, liest aus `data/beispiel.json`, und der Ausdruck auf A4 ist lesbar.
9. Der Pages-Workflow läuft durch; die Seite ist über die Pages-URL erreichbar.
10. `tools/validate.mjs` prüft den Beispieldatensatz und schlägt bei Verstoß fehl.
11. `VOKABULARSTAND.md` ist um die sieben neuen Dateien ergänzt, inklusive der offenen Prüfpunkte: die ungeprüfte Zuschreibung „KMK" bei Modell B, die nicht abgerufenen ISCED- und Engagementfeld-Labels, der Entwurfsstatus aller Definitionen, die drei offenen Punkte im Bildungs-Crosswalk und der Vorschlagsstatus des Handlungsfeld-Crosswalks.
12. `CHANGELOG.md` dokumentiert jede Vokabularänderung mit Datum und Quelle.
13. Commits klein und thematisch geschnitten, Nachrichten auf Deutsch.
