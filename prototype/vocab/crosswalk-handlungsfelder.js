/*
 * Aggregationsvorschlag: Handlungsfelder zu Sektorsystematiken
 * Die Aggregation wird nicht erfasst, sondern abgeleitet. Zweck: Anschlussfähigkeit an die Sektorstatistik der Zivilgesellschaftsforschung (Engagementfelder) und an die internationale Klassifikation gemeinnütziger Organisationen. Auf DCAT-Ebene ist das Datenthema fest EDUC. Jede Zuordnung ist ein Vorschlag und kann einzeln verworfen werden.
 *
 * Erzeugt aus crosswalk-handlungsfelder.json durch tools/vokabular-einbetten.mjs.
 * Nicht von Hand aendern — Aenderungen gehoeren in die JSON-Datei.
 */

EduVocab.register({
  "id": "crosswalk-handlungsfelder",
  "label": "Aggregationsvorschlag: Handlungsfelder zu Sektorsystematiken",
  "version": "0.1.0",
  "status": "vorschlag",
  "quelle": {
    "bezeichnung": "Eigener Zuordnungsvorschlag auf Basis der recherchierten Systematiken; nicht mit der Arbeitsgruppe abgestimmt",
    "url": null,
    "abgerufen": "2026-09-15",
    "pruefstand": "unbestaetigt"
  },
  "hinweis": "Die Aggregation wird nicht erfasst, sondern abgeleitet. Zweck: Anschlussfähigkeit an die Sektorstatistik der Zivilgesellschaftsforschung (Engagementfelder) und an die internationale Klassifikation gemeinnütziger Organisationen. Auf DCAT-Ebene ist das Datenthema fest EDUC. Jede Zuordnung ist ein Vorschlag und kann einzeln verworfen werden.",
  "achsen": {
    "leitachse": "handlungsfelder",
    "weitere": [
      "engagementfelder",
      "icnpo",
      "data-theme"
    ]
  },
  "konstanten": {
    "dataTheme": "http://publications.europa.eu/resource/authority/data-theme/EDUC"
  },
  "eintraege": [
    {
      "handlungsfeld": "bne",
      "engagementfeld": "Umwelt- und Naturschutz",
      "icnpo": "5",
      "sicherheit": "mittel",
      "hinweis": "Bildungsbezug spricht auch für Bildung und Erziehung; Doppelzuordnung möglich."
    },
    {
      "handlungsfeld": "bildungsmanagement",
      "engagementfeld": "Bildung und Erziehung",
      "icnpo": "2",
      "sicherheit": "hoch"
    },
    {
      "handlungsfeld": "bildungssystem",
      "engagementfeld": "Bildung und Erziehung",
      "icnpo": "2",
      "sicherheit": "hoch"
    },
    {
      "handlungsfeld": "digitale_transformation",
      "engagementfeld": "Bildung und Erziehung",
      "icnpo": "2",
      "sicherheit": "mittel"
    },
    {
      "handlungsfeld": "diversitaet",
      "engagementfeld": "Bürger- und Verbraucherinteressen",
      "icnpo": "7",
      "sicherheit": "niedrig",
      "hinweis": "Je nach Auslegung auch Bildung und Erziehung. Zu klären."
    },
    {
      "handlungsfeld": "engagementfoerderung",
      "engagementfeld": "Bürger- und Verbraucherinteressen",
      "icnpo": "8",
      "sicherheit": "hoch",
      "hinweis": "ICNPO-Gruppe 8 deckt Engagementförderung ausdrücklich ab."
    },
    {
      "handlungsfeld": "entwicklungszusammenarbeit",
      "engagementfeld": "Internationale Solidarität",
      "icnpo": "9",
      "sicherheit": "hoch"
    },
    {
      "handlungsfeld": "erzieherbildung",
      "engagementfeld": "Bildung und Erziehung",
      "icnpo": "2",
      "sicherheit": "hoch"
    },
    {
      "handlungsfeld": "familienbildung",
      "engagementfeld": "Bildung und Erziehung",
      "icnpo": "2",
      "sicherheit": "mittel",
      "hinweis": "Bei starkem Unterstützungscharakter auch Soziale Dienste."
    },
    {
      "handlungsfeld": "gesundheit_praevention",
      "engagementfeld": "Gesundheitswesen",
      "icnpo": "3",
      "sicherheit": "hoch"
    },
    {
      "handlungsfeld": "inklusion",
      "engagementfeld": "Soziale Dienste",
      "icnpo": "4",
      "sicherheit": "mittel",
      "hinweis": "Im Bildungskontext auch Bildung und Erziehung."
    },
    {
      "handlungsfeld": "integration_migration",
      "engagementfeld": "Soziale Dienste",
      "icnpo": "4",
      "sicherheit": "hoch"
    },
    {
      "handlungsfeld": "interkulturelle_bildung",
      "engagementfeld": "Bildung und Erziehung",
      "icnpo": "2",
      "sicherheit": "mittel"
    },
    {
      "handlungsfeld": "kulturelle_bildung",
      "engagementfeld": "Kultur",
      "icnpo": "1",
      "sicherheit": "hoch"
    },
    {
      "handlungsfeld": "lehrkraeftebildung",
      "engagementfeld": "Bildung und Erziehung",
      "icnpo": "2",
      "sicherheit": "hoch"
    },
    {
      "handlungsfeld": "mint_bildung",
      "engagementfeld": "Bildung und Erziehung",
      "icnpo": "2",
      "sicherheit": "hoch"
    },
    {
      "handlungsfeld": "persoenlichkeitsentwicklung",
      "engagementfeld": "Bildung und Erziehung",
      "icnpo": "2",
      "sicherheit": "hoch"
    },
    {
      "handlungsfeld": "politische_bildung",
      "engagementfeld": "Bildung und Erziehung",
      "icnpo": "7",
      "sicherheit": "mittel",
      "hinweis": "Systematiken weichen ab: die Sektorstatistik führt politische Bildung unter Bildung, die internationale Klassifikation unter Advocacy."
    },
    {
      "handlungsfeld": "sport_bewegung",
      "engagementfeld": "Sport",
      "icnpo": "1",
      "sicherheit": "hoch"
    },
    {
      "handlungsfeld": "sprachbildung",
      "engagementfeld": "Bildung und Erziehung",
      "icnpo": "2",
      "sicherheit": "hoch"
    },
    {
      "handlungsfeld": "stadt_quartiersentwicklung",
      "engagementfeld": "Gemeinschaftliche Versorgungsaufgaben",
      "icnpo": "6",
      "sicherheit": "mittel"
    },
    {
      "handlungsfeld": "wirtschaft",
      "engagementfeld": "Wirtschaftsverbände und Berufsorganisationen",
      "icnpo": "11",
      "sicherheit": "niedrig",
      "hinweis": "Als Bildungsthema eher Bildung und Erziehung; als Sektorbezug eher Wirtschaftsverbände. Zu klären."
    },
    {
      "handlungsfeld": "wissenschaft_forschung",
      "engagementfeld": "Wissenschaft und Forschung",
      "icnpo": "2",
      "sicherheit": "hoch",
      "hinweis": "ICNPO-Untergruppe Research innerhalb von Gruppe 2."
    }
  ]
});
