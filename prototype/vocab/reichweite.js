/*
 * Reichweite
 *
 * Erzeugt aus reichweite.json durch tools/vokabular-einbetten.mjs.
 * Nicht von Hand aendern — Aenderungen gehoeren in die JSON-Datei.
 */

EduVocab.register({
  "id": "reichweite",
  "label": "Reichweite",
  "version": "0.1.0",
  "status": "arbeitsstand",
  "quelle": {
    "bezeichnung": "Festlegung der Arbeitsgruppe KKAB",
    "url": null,
    "abgerufen": "2026-09-15",
    "pruefstand": "unbestaetigt"
  },
  "concepts": [
    {
      "key": "local",
      "label": "lokal",
      "hint": "Gemeinde, Stadtteil, Ort",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "regional",
      "label": "regional",
      "hint": "mehrere Gemeinden oder Kreise unterhalb der Landesebene",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "state",
      "label": "landesweit",
      "hint": "ein oder mehrere ganze Bundesländer",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "national",
      "label": "bundesweit",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "international",
      "label": "international",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "locationIndependent",
      "label": "ortsunabhängig",
      "hint": "rein digital",
      "deprecated": false,
      "ersetztDurch": null
    }
  ]
});
