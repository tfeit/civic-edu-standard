/*
 * ISCED 2011 - Internationale Standardklassifikation des Bildungswesens
 * Referenzachse, keine Erfassungsliste. Wird im Akteursprofil nicht abgefragt, sondern über den Crosswalk abgeleitet. ISCED klassifiziert Bildungsprogramme nach Niveau und ist auf formale Bildung ausgelegt; non-formale und nachberufliche Angebote bildet es nur unzureichend ab. Labels vor Produktivnutzung gegen die Eurostat-Quelle verifizieren.
 *
 * Erzeugt aus isced-2011.json durch tools/vokabular-einbetten.mjs.
 * Nicht von Hand aendern — Aenderungen gehoeren in die JSON-Datei.
 */

EduVocab.register({
  "id": "isced-2011",
  "label": "ISCED 2011 - Internationale Standardklassifikation des Bildungswesens",
  "aliases": [
    "ISCED",
    "ISCED-P"
  ],
  "version": "1.0.0",
  "status": "referenz",
  "quelle": {
    "bezeichnung": "UNESCO ISCED 2011; maschinenlesbare Fassung als Eurostat-Vokabular",
    "url": "http://dd.eionet.europa.eu/vocabulary/eurostat/isced11/",
    "abgerufen": "2026-09-15",
    "pruefstand": "recherchiert",
    "pruefstandDetail": "recherchiert_nicht_abgerufen"
  },
  "hinweis": "Referenzachse, keine Erfassungsliste. Wird im Akteursprofil nicht abgefragt, sondern über den Crosswalk abgeleitet. ISCED klassifiziert Bildungsprogramme nach Niveau und ist auf formale Bildung ausgelegt; non-formale und nachberufliche Angebote bildet es nur unzureichend ab. Labels vor Produktivnutzung gegen die Eurostat-Quelle verifizieren.",
  "mehrfachauswahl": false,
  "concepts": [
    {
      "key": "ED0",
      "label": "Elementarbereich",
      "definition": "Frühkindliche Bildung vor dem Primarbereich."
    },
    {
      "key": "ED1",
      "label": "Primarbereich",
      "definition": "Grundlegende schulische Bildung."
    },
    {
      "key": "ED2",
      "label": "Sekundarbereich I",
      "definition": "Untere Sekundarbildung."
    },
    {
      "key": "ED3",
      "label": "Sekundarbereich II",
      "definition": "Obere Sekundarbildung, allgemeinbildend oder berufsbildend."
    },
    {
      "key": "ED4",
      "label": "Postsekundarer, nicht-tertiärer Bereich",
      "definition": "Bildungsgänge zwischen Sekundarbereich II und Tertiärbereich."
    },
    {
      "key": "ED5",
      "label": "Kurzes tertiäres Bildungsprogramm",
      "definition": "Kurze tertiäre Bildungsgänge, überwiegend berufsorientiert."
    },
    {
      "key": "ED6",
      "label": "Bachelor oder gleichwertig",
      "definition": "Erster tertiärer Abschluss."
    },
    {
      "key": "ED7",
      "label": "Master oder gleichwertig",
      "definition": "Zweiter tertiärer Abschluss."
    },
    {
      "key": "ED8",
      "label": "Promotion",
      "definition": "Höchster tertiärer Abschluss."
    }
  ]
});
