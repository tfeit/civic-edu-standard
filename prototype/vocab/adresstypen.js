/*
 * Adresstypen
 *
 * Erzeugt aus adresstypen.json durch tools/vokabular-einbetten.mjs.
 * Nicht von Hand aendern — Aenderungen gehoeren in die JSON-Datei.
 */

EduVocab.register({
  "id": "adresstypen",
  "label": "Adresstypen",
  "version": "0.2.0",
  "status": "arbeitsstand",
  "quelle": {
    "bezeichnung": "Festlegung der Arbeitsgruppe KKAB, erweitert",
    "url": null,
    "abgerufen": "2026-09-15",
    "pruefstand": "unbestaetigt"
  },
  "concepts": [
    {
      "key": "headquarters",
      "label": "Sitz",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "office",
      "label": "Geschäftsstelle",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "branch",
      "label": "weiterer Standort",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "postalAddress",
      "label": "Postanschrift",
      "deprecated": false,
      "ersetztDurch": null
    }
  ]
});
