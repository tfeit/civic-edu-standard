/*
 * Rechtsformen
 * Zur Entscheidung in WS 4: Mit dem bundesweiten Stiftungsregister fuehren rechtsfaehige Stiftungen eine Registerkennung. Die Vorgabe fuer diesen Arbeitsstand lautet "Stiftung: kein Registerfeld"; ob das Schema die Kennung erfasst, entscheidet die Arbeitsgruppe.
 *
 * Erzeugt aus rechtsformen.json durch tools/vokabular-einbetten.mjs.
 * Nicht von Hand aendern — Aenderungen gehoeren in die JSON-Datei.
 */

EduVocab.register({
  "id": "rechtsformen",
  "label": "Rechtsformen",
  "version": "0.3.0",
  "status": "arbeitsstand",
  "quelle": {
    "bezeichnung": "Festlegung der Arbeitsgruppe KKAB, erweitert um Rechtsformen des Bildungssektors",
    "url": null,
    "abgerufen": "2026-09-15",
    "pruefstand": "unbestaetigt"
  },
  "hinweis": "Zur Entscheidung in WS 4: Mit dem bundesweiten Stiftungsregister fuehren rechtsfaehige Stiftungen eine Registerkennung. Die Vorgabe fuer diesen Arbeitsstand lautet \"Stiftung: kein Registerfeld\"; ob das Schema die Kennung erfasst, entscheidet die Arbeitsgruppe.",
  "concepts": [
    {
      "key": "registeredAssociation",
      "label": "eingetragener Verein (e. V.)",
      "registerart": "VR",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "unincorporatedAssociation",
      "label": "nicht rechtsfähiger Verein",
      "registerart": null,
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "gGmbH",
      "label": "gGmbH",
      "registerart": "HRB",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "GmbH",
      "label": "GmbH",
      "registerart": "HRB",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "UG",
      "label": "gUG/UG",
      "registerart": "HRB",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "AG",
      "label": "gAG/AG",
      "registerart": "HRB",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "cooperative",
      "label": "gemeinnützige Genossenschaft (eG)",
      "registerart": "GnR",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "commercialCooperative",
      "label": "Genossenschaft (eG)",
      "registerart": "GnR",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "foundation",
      "label": "rechtsfähige Stiftung",
      "registerart": null,
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "dependentFoundation",
      "label": "nicht rechtsfähige (treuhänderische) Stiftung",
      "registerart": null,
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "eGbR",
      "label": "eingetragene GbR (eGbR)",
      "registerart": "GsR",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "partnership",
      "label": "Partnerschaftsgesellschaft (PartG, PartG mbB)",
      "registerart": "PR",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "commercialPartnership",
      "label": "Personenhandelsgesellschaft (OHG, KG)",
      "registerart": "HRA",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "publicLawCorporation",
      "label": "Körperschaft des öffentlichen Rechts",
      "registerart": null,
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "informalGroup",
      "label": "nicht eingetragene Initiative/Gruppe",
      "registerart": null,
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "naturalPerson",
      "label": "Einzelperson",
      "registerart": null,
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "foreignLegalForm",
      "label": "ausländische Rechtsform",
      "registerart": null,
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "other",
      "label": "andere",
      "registerart": null,
      "deprecated": false,
      "ersetztDurch": null
    }
  ]
});
