/*
 * Zielgruppenrollen
 *
 * Erzeugt aus zielgruppenrollen.json durch tools/vokabular-einbetten.mjs.
 * Nicht von Hand aendern — Aenderungen gehoeren in die JSON-Datei.
 */

EduVocab.register({
  "id": "zielgruppenrollen",
  "label": "Zielgruppenrollen",
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
      "key": "beneficiaries",
      "label": "Endbegünstigte",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "multipliers",
      "label": "Multiplikator:innen/Fachkräfte",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "institutions",
      "label": "Institutionen",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "policyMakers",
      "label": "politische Entscheidungsträger:innen",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "funders",
      "label": "Fördergebende",
      "deprecated": false,
      "ersetztDurch": null
    }
  ]
});
