/*
 * Bildungsabschnitte — Phasenachse der Arbeitsgruppe.
 *
 * Die Achterliste bleibt unveraendert. Lernformen und Schulformen gehoeren
 * bewusst NICHT hierher, sondern in lernformen.js.
 */

EduVocab.register({
    "id": "bildungsabschnitte",
    "label": "Bildungsabschnitte",
    "version": "0.2.0",
    "status": "arbeitsstand",
    "quelle": {
      "bezeichnung": "Achterliste der Arbeitsgruppe KKAB",
      "url": null,
      "abgerufen": "2026-09-15",
      "pruefstand": "unbestaetigt"
    },
    "hinweis": "Unveraendert aus Auftrag 1. Der Crosswalk nach ISCED und educationalContext steht in crosswalks.js, die Qualitaet der Zuordnung je Abschnitt dort vermerkt.",
    "concepts": [
      {
        "key": "earlyChildhood",
        "label": "frühkindliche Bildung",
        "tooltip": "ISCED ED0 · Elementarbereich",
        "deprecated": false,
        "ersetztDurch": null
      },
      {
        "key": "primary",
        "label": "Primarstufe",
        "tooltip": "ISCED ED1 · Primarbereich",
        "deprecated": false,
        "ersetztDurch": null
      },
      {
        "key": "lowerSecondary",
        "label": "Sekundarstufe I",
        "tooltip": "ISCED ED2 · Sekundarbereich I",
        "deprecated": false,
        "ersetztDurch": null
      },
      {
        "key": "upperSecondary",
        "label": "Sekundarstufe II",
        "tooltip": "ISCED ED3, teils ED4 — die Abgrenzung ist nicht trennscharf",
        "deprecated": false,
        "ersetztDurch": null
      },
      {
        "key": "vocational",
        "label": "berufliche Bildung",
        "tooltip": "ISCED ED3 bis ED5 — spannt mehrere Stufen",
        "deprecated": false,
        "ersetztDurch": null
      },
      {
        "key": "tertiary",
        "label": "Hochschulbildung",
        "tooltip": "ISCED ED5 bis ED8 — aggregiert mehrere Stufen",
        "deprecated": false,
        "ersetztDurch": null
      },
      {
        "key": "adultEducation",
        "label": "Erwachsenen- und Weiterbildung",
        "tooltip": "Keine feste ISCED-Stufe",
        "deprecated": false,
        "ersetztDurch": null
      },
      {
        "key": "postRetirement",
        "label": "nachberufliche Bildung",
        "tooltip": "Kein internationales Äquivalent — eigenes Konzept der Arbeitsgruppe",
        "deprecated": false,
        "ersetztDurch": null
      }
    ]
  });
