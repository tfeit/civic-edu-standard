/*
 * Lernform / Schulform — Vorschlag aus der Recherche.
 *
 * Vier Konzepte aus educationalContext, die keine Bildungsphasen sind.
 * Die deutschen Labels sind die kanonischen prefLabel@de aus der Quelle,
 * im Verifikationslauf vom 2026-09-15 bestaetigt.
 */

EduVocab.register({
    "id": "lernformen",
    "label": "Lernform / Schulform",
    "version": "0.1.0",
    "status": "vorschlag",
    "quelle": {
      "bezeichnung": "openeduhub, Vokabular educationalContext (SKOS, CC0); prefLabel@de woertlich uebernommen",
      "url": "https://raw.githubusercontent.com/openeduhub/oeh-metadata-vocabs/master/educationalContext.ttl",
      "abgerufen": "2026-09-15",
      "pruefstand": "bestaetigt"
    },
    "hinweis": "Vorschlag aus der Recherche, nicht beschlossen. Diese vier Konzepte sind in educationalContext enthalten, sind aber keine Bildungsphasen und wuerden die Phasenachse verunreinigen.",
    "concepts": [
      {
        "key": "schule",
        "label": "Schule",
        "definition": "Oberbegriff für schulische Kontexte, keine Bildungsphase.",
        "quellSlug": "schule",
        "deprecated": false,
        "ersetztDurch": null
      },
      {
        "key": "foerderschule",
        "label": "Förderschule",
        "definition": "Schulform, keine Bildungsphase.",
        "quellSlug": "foerderschule",
        "deprecated": false,
        "ersetztDurch": null
      },
      {
        "key": "fernunterricht",
        "label": "Fernunterricht",
        "definition": "Lernmodus: räumlich getrennt, medial vermittelt.",
        "quellSlug": "fernunterricht",
        "deprecated": false,
        "ersetztDurch": null
      },
      {
        "key": "informelles_lernen",
        "label": "Informelles Lernen",
        "definition": "Lernmodus: außerhalb formaler Bildungsgänge.",
        "quellSlug": "informelles_lernen",
        "deprecated": false,
        "ersetztDurch": null
      }
    ]
  });
