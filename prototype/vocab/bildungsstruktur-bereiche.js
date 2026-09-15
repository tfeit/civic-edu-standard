/*
 * Bildungsbereiche (Modell B)
 * Die Bezeichnung KMK aus Workshop 4 ist nicht belegt; die Quellkarte verweist auf den Wikipedia-Artikel zum Bildungssystem in Deutschland. Neutrale Bezeichnung daher Bildungsbereiche. Die Quellkarte führt Primarstufe und Sekundarstufe I unter einer gemeinsamen Überschrift, unterscheidet sie aber in den Einträgen - dieses Vokabular führt sie als zwei Werte. Zu bestätigen.
 *
 * Erzeugt aus bildungsstruktur-bereiche.json durch tools/vokabular-einbetten.mjs.
 * Nicht von Hand aendern — Aenderungen gehoeren in die JSON-Datei.
 */

EduVocab.register({
  "id": "bildungsstruktur-bereiche",
  "label": "Bildungsbereiche (Modell B)",
  "aliases": [
    "KMK-Bildungsstruktur",
    "Bildungsstufenmodell"
  ],
  "version": "0.2.0",
  "status": "arbeitsstand",
  "quelle": {
    "bezeichnung": "Arbeitskarte Bildungsstruktur im Miro-Board, gestützt auf den Artikel Bildungssystem in Deutschland",
    "url": "https://de.wikipedia.org/wiki/Bildungssystem_in_Deutschland",
    "abgerufen": "2026-09-15",
    "pruefstand": "bestaetigt",
    "pruefstandDetail": "bestaetigt_gegen_arbeitskarte"
  },
  "hinweis": "Die Bezeichnung KMK aus Workshop 4 ist nicht belegt; die Quellkarte verweist auf den Wikipedia-Artikel zum Bildungssystem in Deutschland. Neutrale Bezeichnung daher Bildungsbereiche. Die Quellkarte führt Primarstufe und Sekundarstufe I unter einer gemeinsamen Überschrift, unterscheidet sie aber in den Einträgen - dieses Vokabular führt sie als zwei Werte. Zu bestätigen.",
  "mehrfachauswahl": true,
  "concepts": [
    {
      "key": "elementarbereich",
      "label": "Elementarbereich",
      "definition": "Bildung, Erziehung und Betreuung vor dem Schuleintritt, überwiegend in Kindertageseinrichtungen und in der Kindertagespflege.",
      "beispiele": [
        "Sprachförderprogramm in Kindertageseinrichtungen",
        "MINT-Werkstatt für Vorschulkinder"
      ],
      "negativbeispiel": "Fortbildung für pädagogische Fachkräfte in Kitas. Maßgeblich ist, wo die unmittelbar Teilnehmenden stehen, nicht wo die Wirkung ankommt - das wäre Quartärbereich.",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "primarstufe",
      "label": "Primarstufe",
      "definition": "Grundschulbildung, je nach Land die Jahrgangsstufen 1 bis 4 beziehungsweise 1 bis 6.",
      "beispiele": [
        "Leseförderung an Grundschulen",
        "Programm zur Demokratiebildung im Grundschulalter"
      ],
      "negativbeispiel": "Ein Angebot, das ausschließlich den Wechsel von der Kita in die Schule begleitet. Dafür ist das Übergangsattribut vorgesehen, gemeinsam mit den beiden angrenzenden Bereichen.",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "sekundarstufe_1",
      "label": "Sekundarstufe I",
      "definition": "Weiterführende schulische Bildung bis zum mittleren Abschluss, in der Regel die Jahrgangsstufen 5 bis 10, über alle Schulformen hinweg.",
      "beispiele": [
        "Berufsorientierung ab Jahrgangsstufe 8",
        "Schülerlabor für die Mittelstufe"
      ],
      "negativbeispiel": "Duale Berufsausbildung. Sie zählt zur Sekundarstufe II, auch wenn die Teilnehmenden altersmäßig nahe liegen.",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "sekundarstufe_2",
      "label": "Sekundarstufe II",
      "definition": "Gymnasiale Oberstufe, berufsbildende Schulen, duale Berufsausbildung, Fachoberschulen, Berufsfachschulen sowie Abendschulen und Kollegs.",
      "beispiele": [
        "Begleitprogramm für Auszubildende im ersten Lehrjahr",
        "Studien- und Berufsorientierung in der Oberstufe"
      ],
      "negativbeispiel": "Fachschule oder Meisterqualifizierung. Diese bauen auf einer abgeschlossenen Erstausbildung auf und zählen zum Tertiärbereich.",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "tertiaerbereich",
      "label": "Tertiärer Bereich",
      "definition": "Hochschulbildung an Universitäten und Fachhochschulen sowie Bildungsgänge an Berufsakademien und Fachschulen, die auf einer abgeschlossenen Erstausbildung aufbauen.",
      "beispiele": [
        "Mentoring für Studierende der ersten Generation",
        "Vorbereitungskurs auf die Meisterprüfung"
      ],
      "negativbeispiel": "Allgemeine Erwachsenenbildung ohne Abschlussbezug, etwa ein offener Sprachkurs. Das ist Quartärbereich.",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "quartaerbereich",
      "label": "Quartärer Bereich",
      "definition": "Weiterbildung nach Abschluss einer ersten Bildungs- oder Ausbildungsphase, beruflich wie allgemein, einschließlich der Bildungsangebote im Ruhestand.",
      "beispiele": [
        "Digitalkurs für Menschen über 65",
        "Berufsbegleitende Fortbildung für Lehrkräfte"
      ],
      "negativbeispiel": "Berufliche Erstausbildung. Sie gehört in die Sekundarstufe II, weil sie keine vorausgegangene Ausbildung voraussetzt.",
      "deprecated": false,
      "ersetztDurch": null
    }
  ]
});
