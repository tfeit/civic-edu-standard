# Klickdummy „Akteursprofil“

Drei Seiten zum Datenschema für Organisationsprofile: eine klickbare
Eingabemaske, die das Feldmodell aus der Perspektive einer ausfüllenden
Organisation erfahrbar macht; eine Netzdarstellung des Modells; und eine
Kreuztabelle, die zeigt, was mit gemeinsamen Feldern auswertbar wird.

> **v0-Arbeitsstand.** Feldnamen, JSON-Schlüssel, Vokabulare und
> Verbindlichkeiten sind in Abstimmung. Vier Felder tragen das Kennzeichen
> „zur Entscheidung in WS 4“: Rufname, info@-Adresse, Telefon,
> Mutterorganisation. Die Liste der Handlungsfelder ist als Platzhalterliste
> gekennzeichnet.

## Die drei Seiten

| Seite | Was sie zeigt |
|---|---|
| `index.html` | **Formular** — die Eingabemaske. Sachlich gehalten: sie simuliert echte Arbeit und soll nicht ablenken. |
| `schema.html` | **Datenmodell** — Netzdarstellung, umschaltbar zwischen Schemastruktur und Akteursnetz. |
| `simulation.html` | **Verschneidung** — zwei Merkmale gegeneinander gelegt, als Kreuztabelle. |

## Starten

`index.html` im Browser öffnen — Doppelklick genügt. Kein Build, keine
Installation, keine Abhängigkeiten. Die Maske ist ohne Netzverbindung
vollständig bedienbar; lediglich die Wikidata-Suche fällt dann auf ein
einfaches Textfeld mit Musterprüfung zurück.

Für eine Bildschirmfreigabe eignet sich ein Fenster ab etwa 1200 px Breite.
Darunter rücken Formular und Vorschau untereinander.

Zum Verschicken an die Teilnehmenden: Der Workflow `.github/workflows/static.yml`
veröffentlicht diesen Ordner als Wurzel der GitHub-Pages-Adresse des
Repositoriums. Der Dummy ist damit ohne Unterpfad erreichbar; die übrigen
Repositoriumsdateien erscheinen dort nicht.

## Aufbau

| Datei | Inhalt |
|---|---|
| `fields.js` | Das Feldmodell als Datenstruktur: Blöcke, Felder, Typen, Verbindlichkeit, Hilfetexte, Vokabulare — dazu die drei Beispielprofile |
| `akteure.js` | 36 erfundene Akteure, schemakonform — Grundlage für Netz und Kreuztabelle |
| `app.js` | Renderer und Verhalten des Formulars — kennt Feldtypen, nicht Felder |
| `netz.js` | Kraftlayout und SVG-Zeichnung für die Netzdarstellung |
| `schema.js` | Die beiden Netzansichten |
| `simulation.js` | Kreuztabelle und Filter |
| `style.css` | Gestaltung aller drei Seiten |

Das Formular wird vollständig aus `fields.js` erzeugt. Eine Vokabular-Änderung
dort — ein weiteres Handlungsfeld, ein anderer Labeltext, ein zusätzliches
Feld — erscheint ohne weitere Codeänderung im Formular, in der Prüfung, im
Pflichtfeld-Zähler und im JSON. Das ist die tragende Architekturentscheidung:
Die Arbeitsgruppe kann am Vokabular arbeiten, ohne Anwendungscode anzufassen.

## Was die Maske zeigt

- **Drei Abschnitte:** A Identität · C Tätigkeitsprofil · D Wirkungsraum.
  Die Blöcke E und F (Angebote, Personen) sind zurückgestellt.
- **Live-JSON-Vorschau** rechts. Sie ist didaktisch zentral: Hinter dem
  Formular steht ein maschinenlesbares Austauschformat, keine Textdatei. Das
  Feld, in dem gerade gearbeitet wird, ist in der Vorschau hervorgehoben und
  über der Vorschau benannt — so ist die Zuordnung von Formularfeld zu
  JSON-Schlüssel unmittelbar sichtbar.
- **Pflichtfeld-Zähler** über sechs Pflichtfelder; drei davon sind beim Laden
  bereits belegt (ID, Status, Datum der letzten Aktualisierung). Darunter je
  Abschnitt ein Sprungverweis mit Fortschrittsangabe.
- **Timer** oben rechts, startet bei der ersten Eingabe. Er unterstützt die
  Leitfrage „Kann eine kleine Initiative das in zehn Minuten ausfüllen?“ und
  bewertet nichts. Beispieldaten und Leeren setzen ihn zurück, weil gemessen
  werden soll, was von Hand eingegeben wird.
- **Konditionale Logik:** Registerfelder erscheinen je nach Rechtsform mit
  vorbelegter Registerart; die Gebietsliste erscheint nur bei lokaler,
  regionaler oder landesweiter Reichweite; der Schwerpunkt ist nur aus den
  angekreuzten Handlungsfeldern wählbar.
- **Plausibilitätsprüfungen als Hinweise, nie als Blocker:** personenbezogen
  wirkende E-Mail-Adresse, mehr als ein Standort vom Typ „Sitz“, leere
  Gebietsliste bei lokaler oder regionaler Reichweite, Gebietsliste bei
  bundesweiter Reichweite.

Zwei Lesarten der Spezifikation seien offengelegt: „genau ein Sitz“ ist als
Warnhinweis umgesetzt, nicht als erzwungene Korrektur — die Maske greift
nirgends in eine Eingabe ein. Das Feld „Detaillierte Beschreibung“ ist
bewusst nicht enthalten (Vorschlag: nicht in v1.0).

## Beispieldaten

Die Seitenspalte bietet drei erfundene Organisationen an, die zusammen die
Spannweite des Schemas abdecken:

| Profil | Was daran zu sehen ist |
|---|---|
| **Kleine Initiative** | nicht eingetragene Gruppe, lokal, ohne Registerfelder, ohne Straßenangabe, ohne Wikidata-Kennung |
| **Mittlerer Verein** | e. V. mit Registerkennung (VR), Sitz und Geschäftsstelle, landesweite Reichweite mit Bundesland-Berechnung |
| **Bundesweiter Träger** | rechtsfähige Stiftung ohne Registerfeld, fördernd statt operativ, Angabe nur im Plattform-Austausch, bundesweit — die Gebietsliste entfällt |

Die Profile stehen als Daten in `fields.js` und lassen sich dort ohne
Codeänderung anpassen. Die Wikidata-Kennung bleibt in allen dreien leer: Eine
QID verweist stets auf eine reale Organisation und ließe sich für eine
erfundene nicht wahrheitsgemäß setzen.

## Zwischenspeicherung

Eingaben bleiben im Browser erhalten und überstehen ein Neuladen. Sie werden
ausschließlich lokal abgelegt (`localStorage`) und verlassen das Gerät nicht;
es gibt keinen Server. Ein Knopf verwirft den Zwischenstand. Wo der Browser
die Ablage verweigert — privates Fenster, gesperrte Website-Daten —, arbeitet
die Maske unverändert weiter und weist einmal darauf hin.

## Eingabekomfort bei wiederholbaren Gruppen

Der Kopf jeder Eintragskarte zeigt eine Kurzfassung der Angaben, damit bei
mehreren Standorten oder Zielgruppen erkennbar bleibt, welcher Eintrag welcher
ist. Ein entfernter Eintrag lässt sich an derselben Stelle wiederherstellen.
Strg + Eingabetaste (auf macOS Cmd + Eingabetaste) legt aus einem Feld der
Gruppe heraus einen weiteren Eintrag an.

## Vokabulare

Gegenüber dem ersten Durchgang erweitert:

- **Rechtsformen** (18): ergänzt um nicht rechtsfähigen Verein, Genossenschaft
  ohne Gemeinnützigkeit, nicht rechtsfähige (treuhänderische) Stiftung,
  Partnerschaftsgesellschaft, Personenhandelsgesellschaft, Körperschaft des
  öffentlichen Rechts und ausländische Rechtsform.
- **Registerarten:** ergänzt um PR (Partnerschaftsregister) und HRA, jeweils
  mit der zugehörigen Rechtsform.
- **Handlungsfelder** (18, weiterhin Platzhalterliste): ergänzt um
  interkulturelle Bildung, ökonomische Bildung und Finanzbildung,
  Antidiskriminierung und Diversität, Gewaltprävention und Konfliktbearbeitung,
  Eltern- und Familienbildung, Umweltbildung und Naturerfahrung.
- **Adresstypen:** ergänzt um Geschäftsstelle und Postanschrift.
- **Zielgruppenrollen:** ergänzt um politische Entscheidungsträger:innen und
  Fördergebende.

**Offen für WS 4:** Mit dem bundesweiten Stiftungsregister führen rechtsfähige
Stiftungen eine Registerkennung. Die Vorgabe für diesen Arbeitsstand lautet
„Stiftung: kein Registerfeld“, und so ist es umgesetzt. Ob das Schema die
Kennung künftig erfasst, ist von der Arbeitsgruppe zu entscheiden; der
Rechtsstand sollte dabei geprüft werden. In `fields.js` ist die Stelle
vermerkt — umgesetzt wäre es mit einer Zeile.

## Barrierefreiheit

Jede Eingabe hat eine eigene `<label for>`-Zuordnung, jeder Abschnitt ein
`fieldset` mit `legend`. Die Maske ist vollständig mit der Tastatur bedienbar,
der Fokus ist mit einer 3 px starken Kontur sichtbar. Verbindlichkeit und
Warnungen sind immer auch als Text ausgezeichnet, nie allein über Farbe. Der
aktive Abschnitt in der Navigation ist zusätzlich zur Farbe an der Schriftstärke
erkennbar. Die Hervorhebung in der JSON-Vorschau wiederholt lediglich, was der
sichtbare Fokus und die Zeile über der Vorschau bereits benennen.

## Nicht enthalten

Kein Backend, keine Speicherung auf Servern, kein Schema-Validator, keine
Mehrsprachigkeit, keine Nutzerkonten. Der Akteursbestand hinter Netz und
Kreuztabelle ist erfunden: 36 Organisationen mit Namen aus festen Bausteinen,
deterministisch erzeugt. Ein Bezug zu realen Organisationen besteht nicht, und
die Einträge tragen aus demselben Grund keine Wikidata-Kennung.

## Selbsttest

Ein vollständiger Beispieldatensatz — dieselbe Organisation wie im Profil
„Mittlerer Verein“ — wurde automatisiert eingegeben, mit 60 ms je Zeichen
(etwa 200 Zeichen pro Minute) und 1,5 s Orientierungspause vor jedem Feld:

| | |
|---|---|
| Gemessene Dauer | 1:30 min |
| Berührte Felder | 28 |
| Getippte Zeichen | 710, davon 424 für die Kurzbeschreibung |
| Klicks und Auswahlen | 16 |
| Pflichtfelder | 6 von 6 |
| Schlüssel im Datensatz | 21 |

Der Wert misst die mechanische Eingabedauer bei bereits vorliegendem Text. Was
im Workshop tatsächlich Zeit kostet, ist die Verständigung über die Vokabulare
— welches Handlungsfeld, welcher Bildungsabschnitt, welche Zielgruppenrolle.
Die Eingabe selbst verbraucht das Zehn-Minuten-Budget nicht; die Klärung der
Kategorien verbraucht es. Genau dafür ist der Timer in der Maske gedacht.

Erzeugter Datensatz:

```json
{
  "id": "36dd08f5-287a-4618-8737-4c41576cacaf",
  "name": "Lernraum Nord — Initiative für Demokratiebildung e. V.",
  "alternateName": "Lernraum Nord",
  "url": "https://www.lernraum-nord.example",
  "email": "info@lernraum-nord.example",
  "telephone": "+49 431 1234567",
  "addresses": [
    {
      "type": "headquarters",
      "streetAddress": "Holstenstraße 12",
      "postalCode": "24103",
      "addressLocality": "Kiel"
    },
    {
      "type": "office",
      "streetAddress": "Königstraße 47",
      "postalCode": "23552",
      "addressLocality": "Lübeck"
    }
  ],
  "legalForm": "registeredAssociation",
  "registerIds": {
    "registerType": "VR",
    "registerNumber": "6742",
    "registerCourt": "Amtsgericht Kiel"
  },
  "status": "active",
  "lastManualUpdate": "2026-09-15",
  "description": "Lernraum Nord begleitet Schulen in Schleswig-Holstein bei der Demokratiebildung. Der Verein qualifiziert Lehrkräfte, moderiert Klassenrats- und Beteiligungsprozesse und stellt frei nutzbare Materialien bereit. Ziel ist, dass Jugendliche Aushandlung und Mitbestimmung im Schulalltag praktisch erfahren und nicht nur als Unterrichtsthema kennenlernen. Getragen wird die Arbeit von 14 Hauptamtlichen und rund 60 Ehrenamtlichen.",
  "fieldsOfAction": [
    "democracyEducation",
    "civicEducation"
  ],
  "primaryFieldOfAction": "democracyEducation",
  "educationStages": [
    "lowerSecondary",
    "upperSecondary",
    "adultEducation"
  ],
  "targetGroups": [
    {
      "role": "multipliers",
      "label": "Lehrkräfte Sekundarstufe I"
    },
    {
      "role": "beneficiaries",
      "label": "Schülerinnen und Schüler der Jahrgänge 7 bis 10"
    }
  ],
  "sdgs": [
    "4",
    "16"
  ],
  "implementation": {
    "value": "operational",
    "visibility": "public"
  },
  "scope": "state",
  "areasOfActivity": [
    {
      "key": "01",
      "label": "Schleswig-Holstein",
      "validAt": "2026-09-15"
    }
  ],
  "activeInStates": [
    {
      "key": "01",
      "label": "Schleswig-Holstein"
    }
  ]
}```

## Datenmodell im Netz

Zwei Ansichten auf denselben Gegenstand, über einen Umschalter erreichbar.

**Schemastruktur.** Jeder Knoten ist ein Feld, die Farbe zeigt den Block. Die
Blöcke sind selbst Knoten — ohne sie zerfiele die Darstellung in drei
Punktwolken, denn das Feldmodell hat nur wenige konditionale Kanten. Diese
wenigen sind die eigentliche Aussage und deshalb kräftiger gezeichnet, mit
Pfeilspitze: Rechtsform blendet die Registerkennung ein, Reichweite die
Wirkungsgebiete, Handlungsfelder speisen die Auswahl des Schwerpunkts,
Wirkungsgebiete berechnen das Bundesland.

Die Kanten werden aus `fields.js` abgeleitet, nicht von Hand gezeichnet. Wer
dort eine Abhängigkeit ergänzt, sieht sie hier ohne weiteres Zutun.

**Akteursnetz.** Jeder kleine Knoten ist ein Datensatz. Die großen Knoten sind
die Schlüssel, über die Datensätze verschiedener Verbände zusammenfinden:
Bundesland und Handlungsfeld. Das ist der Ertrag des Standards als Bild.

Die Farbbedeutung ist in beiden Ansichten dieselbe — blau für Identität und
Akteur, orange für Tätigkeit und Handlungsfeld, grün für Raum und Bundesland.
Dieselben drei Farben markieren im Formular die Abschnitte A, C und D.

Das Layout ist deterministisch: gleicher Seed, gleiche Anordnung. Die Grafik
sieht bei jedem Aufruf gleich aus, was das Erklären erleichtert.

## Verschneidung

Zwei Merkmale gegeneinander gelegt, die Zahl der Akteure je Kombination.
Zeilen und Spalten sind frei wählbar aus sieben Merkmalen; zwei Filter
schränken den Bestand zusätzlich ein. Ein Klick auf eine Zelle zeigt, welche
Akteure dahinterstehen.

Die Darstellung ist eine echte HTML-Tabelle mit Zeilen- und Spaltenköpfen.
Die Tabellenansicht ist damit kein Zusatz zur Grafik, sondern die Grafik
selbst: Jede Zelle trägt ihre Zahl im Text, die Farbe wiederholt sie nur. Ohne
Farbwahrnehmung bleibt alles lesbar.

Zur Farbskala: eine Farbe, hell nach dunkel, für Menge — nie ein Farbkreis.
Bei kleinen Höchstwerten bekommt jeder Akteur eine eigene Stufe, sonst färbte
eine Zelle mit drei Akteuren im dunkelsten Ton und täuschte Menge vor. Die
Skala zeigt genau die Stufen, die vorkommen.

Bei mehrwertigen Merkmalen — ein Akteur kann mehrere Handlungsfelder haben —
zählt er in mehreren Zellen. Die Fußzeile weist darauf hin, sonst wirken die
Summen falsch.

## Farben

Die drei Datenfarben sind gegen die Zeichenfläche geprüft: Helligkeitsband,
Chroma, Kontrast (alle ≥ 3:1) und Unterscheidbarkeit bei Rot-Grün-Sehschwäche
über alle Paare, simuliert nach Machado-Oliveira-Fernandes.

| Rolle | Farbe | Kontrast |
|---|---|---|
| Identität / Akteur · Block A | `#2a78d6` | 4,30:1 |
| Tätigkeit / Handlungsfeld · Block C | `#eb6834` | 3,12:1 |
| Raum / Bundesland · Block D | `#199e70` | 3,32:1 |

Die Akzentfarbe `#1F3864` bleibt dem Bedienrahmen vorbehalten — Kopfzeile,
Schaltflächen, Fokus — und trägt nie Daten.

## Lizenz

Es gilt die Lizenz des Repositoriums (CC BY 4.0, siehe `LICENSE` im
Wurzelverzeichnis). Für diesen Ordner wird keine eigene Lizenz gesetzt.
