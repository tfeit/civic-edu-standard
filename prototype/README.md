# Klickdummy „Akteursprofil“

Klickbare Eingabemaske zum Datenschema für Organisationsprofile. Sie macht das
Feldmodell aus der Perspektive einer ausfüllenden Organisation erfahrbar und
zeigt daneben den Datensatz, der dabei entsteht.

> **v0-Arbeitsstand.** Feldnamen, JSON-Schlüssel, Vokabulare und
> Verbindlichkeiten sind in Abstimmung. Vier Felder tragen das Kennzeichen
> „zur Entscheidung in WS 4“: Rufname, info@-Adresse, Telefon,
> Mutterorganisation. Die Liste der Handlungsfelder ist als Platzhalterliste
> gekennzeichnet.

## Starten

`index.html` im Browser öffnen — Doppelklick genügt. Kein Build, keine
Installation, keine Abhängigkeiten. Die Maske ist ohne Netzverbindung
vollständig bedienbar; lediglich die Wikidata-Suche fällt dann auf ein
einfaches Textfeld mit Musterprüfung zurück.

Für eine Bildschirmfreigabe eignet sich ein Fenster ab etwa 1200 px Breite.
Darunter rücken Formular und Vorschau untereinander.

## Aufbau

| Datei | Inhalt |
|---|---|
| `fields.js` | Das Feldmodell als Datenstruktur: Blöcke, Felder, Typen, Verbindlichkeit, Hilfetexte, Vokabulare |
| `app.js` | Renderer und Verhalten — kennt Feldtypen, nicht Felder |
| `index.html` | Rahmen: Banner, Kopf, zwei Spalten |
| `style.css` | Gestaltung |

Das Formular wird vollständig aus `fields.js` erzeugt. Eine Vokabular-Änderung
dort — ein weiteres Handlungsfeld, ein anderer Labeltext, ein zusätzliches
Feld — erscheint ohne weitere Codeänderung im Formular, in der Prüfung, im
Pflichtfeld-Zähler und im JSON. Das ist die tragende Architekturentscheidung:
Die Arbeitsgruppe kann am Vokabular arbeiten, ohne Anwendungscode anzufassen.

## Was die Maske zeigt

- **Drei Abschnitte:** A Identität · C Tätigkeitsprofil · D Wirkungsraum.
  Die Blöcke E und F (Angebote, Personen) sind zurückgestellt.
- **Live-JSON-Vorschau** rechts. Sie ist didaktisch zentral: Hinter dem
  Formular steht ein maschinenlesbares Austauschformat, keine Textdatei.
- **Pflichtfeld-Zähler** über sechs Pflichtfelder; drei davon sind beim Laden
  bereits belegt (ID, Status, Datum der letzten Aktualisierung).
- **Timer** oben rechts, startet bei der ersten Eingabe. Er unterstützt die
  Leitfrage „Kann eine kleine Initiative das in zehn Minuten ausfüllen?“ und
  bewertet nichts.
- **Konditionale Logik:** Registerfelder erscheinen je nach Rechtsform mit
  vorbelegter Registerart (e. V. → VR, Kapitalgesellschaften → HRB, eGbR →
  GsR, Genossenschaft → GnR); die Gebietsliste erscheint nur bei lokaler,
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

## Barrierefreiheit

Jede Eingabe hat eine eigene `<label for>`-Zuordnung, jeder Abschnitt ein
`fieldset` mit `legend`. Die Maske ist vollständig mit der Tastatur bedienbar,
der Fokus ist mit einer 3 px starken Kontur sichtbar. Verbindlichkeit und
Warnungen sind immer auch als Text ausgezeichnet, nie allein über Farbe.

## Nicht enthalten

Kein Backend, keine Speicherung — weder auf einem Server noch im Browser. Ein
Neuladen der Seite verwirft die Eingaben. Kein Schema-Validator, keine
Mehrsprachigkeit, keine Nutzerkonten.

## Selbsttest

Ein vollständiger Beispieldatensatz einer fiktiven Initiative wurde
automatisiert eingegeben, mit 60 ms je Zeichen (etwa 200 Zeichen pro Minute)
und 1,5 s Orientierungspause vor jedem Feld:

| | |
|---|---|
| Gemessene Dauer | 1:22 min |
| Berührte Felder | 24 |
| Getippte Zeichen | 692, davon 424 für die Kurzbeschreibung |
| Klicks und Auswahlen | 14 |
| Pflichtfelder | 6 von 6 |
| Schlüssel im Datensatz | 22 |

Der Wert misst die mechanische Eingabedauer bei bereits vorliegendem Text. Was
im Workshop tatsächlich Zeit kostet, ist die Verständigung über die Vokabulare
— welches Handlungsfeld, welcher Bildungsabschnitt, welche Zielgruppenrolle.
Die Eingabe selbst verbraucht das Zehn-Minuten-Budget nicht; die Klärung der
Kategorien verbraucht es. Genau dafür ist der Timer in der Maske gedacht.

Erzeugter Datensatz:

```json
{
  "id": "8c310f96-6519-423e-9489-5336d570e696",
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
    }
  ],
  "wikidataId": "Q116054",
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

## Lizenz

Es gilt die Lizenz des Repositoriums (CC BY 4.0, siehe `LICENSE` im
Wurzelverzeichnis). Für diesen Ordner wird keine eigene Lizenz gesetzt.
