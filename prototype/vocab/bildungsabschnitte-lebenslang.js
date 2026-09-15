/*
 * Bildungsabschnitte im Sinne lebenslangen Lernens (Modell A)
 * Begriffe und Reihenfolge sind aus der Primärquelle übernommen. Definitionen, Beispiele und Negativbeispiele sind Entwürfe und noch nicht mit dem Netzwerk abgestimmt - sie tragen definitionStatus=entwurf.
 *
 * Erzeugt aus bildungsabschnitte-lebenslang.json durch tools/vokabular-einbetten.mjs.
 * Nicht von Hand aendern — Aenderungen gehoeren in die JSON-Datei.
 */

EduVocab.register({
  "id": "bildungsabschnitte-lebenslang",
  "label": "Bildungsabschnitte im Sinne lebenslangen Lernens (Modell A)",
  "aliases": [
    "Nettiefinder-Variante",
    "Lebenslanges Lernen"
  ],
  "version": "0.2.0",
  "status": "arbeitsstand",
  "quelle": {
    "bezeichnung": "Bildungsabschnitte des Nettiefinders (Netzwerk Stiftungen und Bildung), übernommen aus der Arbeitskarte im Miro-Board",
    "url": null,
    "abgerufen": "2026-09-15",
    "pruefstand": "bestaetigt"
  },
  "hinweis": "Begriffe und Reihenfolge sind aus der Primärquelle übernommen. Definitionen, Beispiele und Negativbeispiele sind Entwürfe und noch nicht mit dem Netzwerk abgestimmt - sie tragen definitionStatus=entwurf.",
  "mehrfachauswahl": true,
  "concepts": [
    {
      "key": "fruehkindliche_bildung",
      "label": "Frühkindliche Bildung",
      "definition": "Bildungsangebote für Kinder vor dem Schuleintritt, auch außerhalb institutioneller Betreuung.",
      "beispiele": [
        "Eltern-Kind-Gruppe mit Sprachförderung",
        "Vorlesepatenschaft für Kleinkinder"
      ],
      "negativbeispiel": "Angebote in einer Kindertageseinrichtung selbst - dafür ist der Wert Kita vorgesehen.",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "kita",
      "label": "Kita",
      "definition": "Bildungsangebote in Kindertageseinrichtungen und in der Kindertagespflege.",
      "beispiele": [
        "MINT-Werkstatt in der Kita",
        "Bewegungsprogramm im Kindergartenalltag"
      ],
      "negativbeispiel": "Fortbildung für pädagogische Fachkräfte. Maßgeblich ist, wo die unmittelbar Teilnehmenden stehen.",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "uebergang_kita_schule",
      "label": "Übergang Kita - Schule",
      "definition": "Angebote, die den Wechsel von der vorschulischen Betreuung in die Grundschule begleiten.",
      "beispiele": [
        "Vorschulprogramm zur Schulvorbereitung",
        "Kooperationsprojekt zwischen Kita und Grundschule"
      ],
      "negativbeispiel": "Ein Grundschulprogramm ab Jahrgangsstufe 2 - der Übergang ist dann abgeschlossen.",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "schulische_bildung",
      "label": "Schulische Bildung",
      "definition": "Bildungsangebote im schulischen Kontext über alle Jahrgangsstufen und Schulformen hinweg.",
      "beispiele": [
        "Leseförderung an Grundschulen",
        "Schülerlabor für die Mittelstufe"
      ],
      "negativbeispiel": "Duale Berufsausbildung - dafür ist berufliche Erstausbildung vorgesehen.",
      "definitionStatus": "entwurf",
      "hinweis": "Dieser Wert fasst Primarstufe, Sekundarstufe I und Sekundarstufe II zusammen. Die Zuordnungskarte löst ihn über Klammerzusätze auf; ohne diesen Zusatz ist die Stufe aus dem Wert nicht rekonstruierbar.",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "uebergang_schule_beruf",
      "label": "Übergang Schule - Beruf",
      "definition": "Angebote, die den Wechsel aus der Schule in Ausbildung oder Erwerbstätigkeit begleiten.",
      "beispiele": [
        "Berufsorientierung in der Abschlussklasse",
        "Bewerbungstraining mit Praktikumsvermittlung"
      ],
      "negativbeispiel": "Begleitung während der laufenden Ausbildung - das ist berufliche Erstausbildung.",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "berufliche_erstausbildung",
      "label": "Berufliche Erstausbildung",
      "definition": "Angebote für Menschen in einer ersten beruflichen Ausbildung, dual oder schulisch.",
      "beispiele": [
        "Mentoring für Auszubildende",
        "Stützunterricht an Berufsschulen"
      ],
      "negativbeispiel": "Umschulung nach abgeschlossener Erstausbildung - das ist berufsbezogene Bildung.",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "hochschule",
      "label": "Hochschule",
      "definition": "Bildungsangebote im Hochschulkontext, an Universitäten, Fachhochschulen und Berufsakademien.",
      "beispiele": [
        "Mentoring für Studierende der ersten Generation",
        "Studienorientierungsprogramm an einer Hochschule"
      ],
      "negativbeispiel": "Studienorientierung in der Oberstufe - das findet noch im schulischen Kontext statt.",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "berufsbezogene_bildung",
      "label": "Berufsbezogene Bildung",
      "definition": "Weiterbildung mit Bezug zur ausgeübten oder angestrebten Berufstätigkeit, nach abgeschlossener Erstausbildung.",
      "beispiele": [
        "Fortbildung für Lehrkräfte",
        "Qualifizierung von Fachkräften in der Jugendarbeit"
      ],
      "negativbeispiel": "Berufliche Erstausbildung - sie setzt keine vorherige Ausbildung voraus.",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "nebenberufliche_bildung",
      "label": "Nebenberufliche Bildung",
      "definition": "Weiterbildung, die neben einer Erwerbstätigkeit stattfindet und nicht unmittelbar auf sie bezogen ist.",
      "beispiele": [
        "Abendkurs zu politischer Bildung",
        "Qualifizierung für ein Ehrenamt neben dem Beruf"
      ],
      "negativbeispiel": "Eine Fortbildung, die der Arbeitgeber für die ausgeübte Tätigkeit anordnet - das ist berufsbezogene Bildung.",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "nachberufliche_bildung",
      "label": "Nachberufliche Bildung",
      "definition": "Bildungsangebote für Menschen nach dem Ende der Erwerbsphase.",
      "beispiele": [
        "Digitalkurs für Menschen über 65",
        "Seniorenstudium"
      ],
      "negativbeispiel": "Vorbereitung auf den Ruhestand während der Erwerbstätigkeit - das ist nebenberufliche Bildung.",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "sonstiges",
      "label": "Bildungsabschnitt Sonstiges",
      "definition": "Auffangwert für Angebote, die sich keinem der vorstehenden Abschnitte zuordnen lassen.",
      "beispiele": [],
      "negativbeispiel": null,
      "definitionStatus": "entwurf",
      "auffangwert": true,
      "hinweis": "Als Auffangwert nur mit Pflicht-Freitext sinnvoll, sonst wird er zum Abladeplatz und die Information geht verloren. Vorschlag zur Entscheidung.",
      "deprecated": false,
      "ersetztDurch": null
    }
  ]
});
