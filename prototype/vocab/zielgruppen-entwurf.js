/*
 * Zielgruppen (Entwurf für den Formulartest)
 * Entwurf zur Erprobung am Formular, keine Festlegung. Der Sachstand führt das Zielgruppenvokabular ausdrücklich als offene Frage. Die Liste ist bewusst kurz gehalten: Sie soll prüfbar machen, ob eine Auswahl gegenüber Freitext trägt und ob die Rollen gebraucht werden — nicht die Frage beantworten.
 *
 * Erzeugt aus zielgruppen-entwurf.json durch tools/vokabular-einbetten.mjs.
 * Nicht von Hand aendern — Aenderungen gehoeren in die JSON-Datei.
 */

EduVocab.register({
  "id": "zielgruppen-entwurf",
  "label": "Zielgruppen (Entwurf für den Formulartest)",
  "version": "0.1.0",
  "status": "entwurf",
  "quelle": {
    "bezeichnung": "Kein externes Vokabular. Zusammengetragen aus Begriffen, die in diesem Repositorium bereits vorkommen: den Beispielen und Negativbeispielen der Bildungsbereiche, den Handlungsfeldern und den drei Beispielprofilen.",
    "url": null,
    "abgerufen": "2026-09-16",
    "pruefstand": "unbestaetigt"
  },
  "hinweis": "Entwurf zur Erprobung am Formular, keine Festlegung. Der Sachstand führt das Zielgruppenvokabular ausdrücklich als offene Frage. Die Liste ist bewusst kurz gehalten: Sie soll prüfbar machen, ob eine Auswahl gegenüber Freitext trägt und ob die Rollen gebraucht werden — nicht die Frage beantworten.",
  "mehrfachauswahl": true,
  "concepts": [
    {
      "key": "vorschulkinder",
      "label": "Kinder im Vorschulalter",
      "rolle": "beneficiaries",
      "bildungsbereich": "elementarbereich",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "grundschulkinder",
      "label": "Kinder im Grundschulalter",
      "rolle": "beneficiaries",
      "bildungsbereich": "primarstufe",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "schueler_sek1",
      "label": "Schülerinnen und Schüler, Sekundarstufe I",
      "rolle": "beneficiaries",
      "bildungsbereich": "sekundarstufe_1",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "schueler_sek2",
      "label": "Schülerinnen und Schüler, Sekundarstufe II",
      "rolle": "beneficiaries",
      "bildungsbereich": "sekundarstufe_2",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "auszubildende",
      "label": "Auszubildende",
      "rolle": "beneficiaries",
      "bildungsbereich": "sekundarstufe_2",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "studierende",
      "label": "Studierende",
      "rolle": "beneficiaries",
      "bildungsbereich": "tertiaerbereich",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "erwachsene_weiterbildung",
      "label": "Erwachsene in Weiterbildung",
      "rolle": "beneficiaries",
      "bildungsbereich": "quartaerbereich",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "menschen_im_ruhestand",
      "label": "Menschen im Ruhestand",
      "rolle": "beneficiaries",
      "bildungsbereich": "quartaerbereich",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "familien",
      "label": "Familien",
      "rolle": "beneficiaries",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "lehrkraefte",
      "label": "Lehrkräfte",
      "rolle": "multipliers",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "paedagogische_fachkraefte",
      "label": "Pädagogische Fachkräfte in Kitas",
      "rolle": "multipliers",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "ausbildende",
      "label": "Ausbilderinnen und Ausbilder",
      "rolle": "multipliers",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "ehrenamtliche",
      "label": "Ehrenamtliche",
      "rolle": "multipliers",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "eltern",
      "label": "Eltern und Erziehungsberechtigte",
      "rolle": "multipliers",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "schulleitungen",
      "label": "Schulleitungen",
      "rolle": "multipliers",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "kindertageseinrichtungen",
      "label": "Kindertageseinrichtungen",
      "rolle": "institutions",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "schulen",
      "label": "Schulen",
      "rolle": "institutions",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "hochschulen",
      "label": "Hochschulen",
      "rolle": "institutions",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "bildungstraeger",
      "label": "Gemeinnützige Bildungsträger",
      "rolle": "institutions",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "bildungsverwaltungen",
      "label": "Bildungsverwaltungen",
      "rolle": "institutions",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    },
    {
      "key": "kommunen",
      "label": "Kommunen",
      "rolle": "institutions",
      "definitionStatus": "entwurf",
      "deprecated": false,
      "ersetztDurch": null
    }
  ]
});
