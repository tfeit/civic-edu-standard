/*
 * Herkunft der Angabe
 * Vorschlag aus der Recherche, nicht beschlossen.
 *
 * Erzeugt aus herkunftsquellen.json durch tools/vokabular-einbetten.mjs.
 * Nicht von Hand aendern — Aenderungen gehoeren in die JSON-Datei.
 */

EduVocab.register({
  "id": "herkunftsquellen",
  "label": "Herkunft der Angabe",
  "version": "0.1.0",
  "status": "vorschlag",
  "quelle": {
    "bezeichnung": "Ableitung aus der Rechtsrecherche (Art. 14 DSGVO, Fall Bisnode Polska UODO 15.03.2019)",
    "url": null,
    "abgerufen": "2026-09-15",
    "pruefstand": "abgeleitet"
  },
  "hinweis": "Vorschlag aus der Recherche, nicht beschlossen.",
  "concepts": [
    {
      "key": "selbstauskunft",
      "label": "Selbstauskunft",
      "urlNoetig": false,
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "impressum",
      "label": "Impressum",
      "urlNoetig": true,
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "register",
      "label": "öffentliches Register",
      "urlNoetig": true,
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "sonstige",
      "label": "sonstige öffentliche Quelle",
      "urlNoetig": true,
      "deprecated": false,
      "ersetztDurch": null
    }
  ]
});
