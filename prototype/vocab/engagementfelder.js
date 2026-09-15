/*
 * Engagementfelder der Zivilgesellschaftsstatistik
 * Referenzachse für die Aggregation, keine Erfassungsliste. Wird im Akteursprofil nicht abgefragt.
 *
 * Erzeugt aus engagementfelder.json durch tools/vokabular-einbetten.mjs.
 * Nicht von Hand aendern — Aenderungen gehoeren in die JSON-Datei.
 */

EduVocab.register({
  "id": "engagementfelder",
  "label": "Engagementfelder der Zivilgesellschaftsstatistik",
  "version": "1.0.0",
  "status": "referenz",
  "quelle": {
    "bezeichnung": "Systematik der Engagementfelder aus der Zivilgesellschaftsforschung (16 Felder), an ICNPO angelehnt",
    "url": "https://www.ziviz.de/publikationen/ziviz-survey-2023-hauptbericht",
    "abgerufen": "2026-09-15",
    "pruefstand": "recherchiert",
    "pruefstandDetail": "recherchiert_nicht_abgerufen"
  },
  "hinweis": "Referenzachse für die Aggregation, keine Erfassungsliste. Wird im Akteursprofil nicht abgefragt.",
  "mehrfachauswahl": false,
  "concepts": [
    {
      "key": "kultur",
      "label": "Kultur"
    },
    {
      "key": "sport",
      "label": "Sport"
    },
    {
      "key": "freizeit_geselligkeit",
      "label": "Freizeit und Geselligkeit"
    },
    {
      "key": "wissenschaft_forschung",
      "label": "Wissenschaft und Forschung"
    },
    {
      "key": "bildung_erziehung",
      "label": "Bildung und Erziehung"
    },
    {
      "key": "gesundheitswesen",
      "label": "Gesundheitswesen"
    },
    {
      "key": "soziale_dienste",
      "label": "Soziale Dienste"
    },
    {
      "key": "bevoelkerungsschutz",
      "label": "Bevölkerungs- und Katastrophenschutz"
    },
    {
      "key": "umwelt_naturschutz",
      "label": "Umwelt- und Naturschutz"
    },
    {
      "key": "internationale_solidaritaet",
      "label": "Internationale Solidarität"
    },
    {
      "key": "buerger_verbraucherinteressen",
      "label": "Bürger- und Verbraucherinteressen"
    },
    {
      "key": "wirtschaftsverbaende",
      "label": "Wirtschaftsverbände und Berufsorganisationen"
    },
    {
      "key": "versorgungsaufgaben",
      "label": "Gemeinschaftliche Versorgungsaufgaben"
    },
    {
      "key": "kirchen_religion",
      "label": "Kirchen und religiöse Vereinigungen"
    },
    {
      "key": "medien",
      "label": "Medien"
    },
    {
      "key": "sonstiges",
      "label": "Sonstiges"
    }
  ]
});
