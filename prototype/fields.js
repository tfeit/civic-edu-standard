/*
 * Feldmodell "Akteursprofil" — v0-Arbeitsstand.
 *
 * Diese Datei ist die einzige Quelle fuer Felder, Reihenfolge, Verbindlichkeit,
 * Hilfetexte und Vokabulare. Das Formular und die JSON-Vorschau werden
 * vollstaendig aus dieser Struktur erzeugt; eine Aenderung hier erscheint ohne
 * weitere Codeaenderung in beidem.
 *
 * Verbindlichkeit (requirement):
 *   P = Pflicht, E = empfohlen, O = optional, B = berechnet
 *
 * JSON-Schluesselnamen sind v0-Arbeitsstand (englisch, camelCase) und stehen
 * ebenso wie die Vokabulare in Abstimmung.
 */

(function (global) {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Vokabulare
   * ------------------------------------------------------------------ */

  // Amtliche Laenderschluessel (erste zwei Stellen des Regionalschluessels).
  var BUNDESLAENDER = [
    { value: '01', label: 'Schleswig-Holstein' },
    { value: '02', label: 'Hamburg' },
    { value: '03', label: 'Niedersachsen' },
    { value: '04', label: 'Bremen' },
    { value: '05', label: 'Nordrhein-Westfalen' },
    { value: '06', label: 'Hessen' },
    { value: '07', label: 'Rheinland-Pfalz' },
    { value: '08', label: 'Baden-Württemberg' },
    { value: '09', label: 'Bayern' },
    { value: '10', label: 'Saarland' },
    { value: '11', label: 'Berlin' },
    { value: '12', label: 'Brandenburg' },
    { value: '13', label: 'Mecklenburg-Vorpommern' },
    { value: '14', label: 'Sachsen' },
    { value: '15', label: 'Sachsen-Anhalt' },
    { value: '16', label: 'Thüringen' }
  ];

  var RECHTSFORMEN = [
    { value: 'registeredAssociation', label: 'eingetragener Verein (e. V.)' },
    { value: 'unincorporatedAssociation', label: 'nicht rechtsfähiger Verein' },
    { value: 'gGmbH', label: 'gGmbH' },
    { value: 'GmbH', label: 'GmbH' },
    { value: 'UG', label: 'gUG/UG' },
    { value: 'AG', label: 'gAG/AG' },
    { value: 'cooperative', label: 'gemeinnützige Genossenschaft (eG)' },
    { value: 'commercialCooperative', label: 'Genossenschaft (eG)' },
    { value: 'foundation', label: 'rechtsfähige Stiftung' },
    { value: 'dependentFoundation', label: 'nicht rechtsfähige (treuhänderische) Stiftung' },
    { value: 'eGbR', label: 'eingetragene GbR (eGbR)' },
    { value: 'partnership', label: 'Partnerschaftsgesellschaft (PartG, PartG mbB)' },
    { value: 'commercialPartnership', label: 'Personenhandelsgesellschaft (OHG, KG)' },
    { value: 'publicLawCorporation', label: 'Körperschaft des öffentlichen Rechts' },
    { value: 'informalGroup', label: 'nicht eingetragene Initiative/Gruppe' },
    { value: 'naturalPerson', label: 'Einzelperson' },
    { value: 'foreignLegalForm', label: 'ausländische Rechtsform' },
    { value: 'other', label: 'andere' }
  ];

  // Registerart je Rechtsform. Rechtsformen ohne Eintrag bekommen kein
  // Registerfeld: nicht rechtsfaehiger Verein, Stiftung, treuhaenderische
  // Stiftung, Koerperschaft des oeffentlichen Rechts, informelle Gruppe,
  // Einzelperson, auslaendische Rechtsform, andere.
  //
  // Zur Entscheidung in WS 4: Mit dem bundesweiten Stiftungsregister fuehren
  // rechtsfaehige Stiftungen eine Registerkennung. Die Vorgabe fuer diesen
  // Arbeitsstand lautet "Stiftung: kein Registerfeld"; ob das Schema die
  // Kennung kuenftig erfasst, ist von der Arbeitsgruppe zu klaeren und der
  // Rechtsstand dabei zu pruefen. Umgesetzt waere es mit einer Zeile hier:
  //   foundation: 'SR'
  var REGISTERART_JE_RECHTSFORM = {
    registeredAssociation: 'VR',
    gGmbH: 'HRB',
    GmbH: 'HRB',
    UG: 'HRB',
    AG: 'HRB',
    eGbR: 'GsR',
    cooperative: 'GnR',
    commercialCooperative: 'GnR',
    partnership: 'PR',
    commercialPartnership: 'HRA'
  };

  var STATUS = [
    { value: 'founding', label: 'in Gründung' },
    { value: 'active', label: 'aktiv' },
    { value: 'dormant', label: 'ruhend' },
    { value: 'dissolving', label: 'in Auflösung' },
    { value: 'ended', label: 'beendet' }
  ];

  var ADRESSTYPEN = [
    { value: 'headquarters', label: 'Sitz' },
    { value: 'office', label: 'Geschäftsstelle' },
    { value: 'branch', label: 'weiterer Standort' },
    { value: 'postalAddress', label: 'Postanschrift' }
  ];

  // Platzhalterliste — Konsolidierung in Workshop 4.
  var HANDLUNGSFELDER = [
    { value: 'democracyEducation', label: 'Demokratiebildung' },
    { value: 'stemEducation', label: 'MINT-Bildung' },
    { value: 'culturalEducation', label: 'kulturelle Bildung' },
    { value: 'sustainabilityEducation', label: 'Bildung für nachhaltige Entwicklung' },
    { value: 'careerOrientation', label: 'Berufsorientierung' },
    { value: 'languageAndLiteracy', label: 'Sprach- und Leseförderung' },
    { value: 'digitalEducation', label: 'digitale Bildung und Medienkompetenz' },
    { value: 'mentoring', label: 'Mentoring und Patenschaften' },
    { value: 'civicEducation', label: 'politische Bildung' },
    { value: 'healthEducation', label: 'Gesundheitsbildung' },
    { value: 'volunteering', label: 'Engagementförderung' },
    { value: 'inclusion', label: 'Inklusion' },
    { value: 'interculturalEducation', label: 'interkulturelle Bildung' },
    { value: 'economicLiteracy', label: 'ökonomische Bildung und Finanzbildung' },
    { value: 'antiDiscrimination', label: 'Antidiskriminierung und Diversität' },
    { value: 'violencePrevention', label: 'Gewaltprävention und Konfliktbearbeitung' },
    { value: 'familyEducation', label: 'Eltern- und Familienbildung' },
    { value: 'environmentalEducation', label: 'Umweltbildung und Naturerfahrung' }
  ];

  var BILDUNGSABSCHNITTE = [
    { value: 'earlyChildhood', label: 'frühkindliche Bildung' },
    { value: 'primary', label: 'Primarstufe' },
    { value: 'lowerSecondary', label: 'Sekundarstufe I' },
    { value: 'upperSecondary', label: 'Sekundarstufe II' },
    { value: 'vocational', label: 'berufliche Bildung' },
    { value: 'tertiary', label: 'Hochschulbildung' },
    { value: 'adultEducation', label: 'Erwachsenen- und Weiterbildung' },
    { value: 'postRetirement', label: 'nachberufliche Bildung' }
  ];

  var ZIELGRUPPENROLLEN = [
    { value: 'beneficiaries', label: 'Endbegünstigte' },
    { value: 'multipliers', label: 'Multiplikator:innen/Fachkräfte' },
    { value: 'institutions', label: 'Institutionen' },
    { value: 'policyMakers', label: 'politische Entscheidungsträger:innen' },
    { value: 'funders', label: 'Fördergebende' }
  ];

  var SDGS = [
    { value: '1', label: '1 · Keine Armut' },
    { value: '2', label: '2 · Kein Hunger' },
    { value: '3', label: '3 · Gesundheit und Wohlergehen' },
    { value: '4', label: '4 · Hochwertige Bildung' },
    { value: '5', label: '5 · Geschlechtergleichheit' },
    { value: '6', label: '6 · Sauberes Wasser und Sanitäreinrichtungen' },
    { value: '7', label: '7 · Bezahlbare und saubere Energie' },
    { value: '8', label: '8 · Menschenwürdige Arbeit und Wirtschaftswachstum' },
    { value: '9', label: '9 · Industrie, Innovation und Infrastruktur' },
    { value: '10', label: '10 · Weniger Ungleichheiten' },
    { value: '11', label: '11 · Nachhaltige Städte und Gemeinden' },
    { value: '12', label: '12 · Nachhaltige/r Konsum und Produktion' },
    { value: '13', label: '13 · Maßnahmen zum Klimaschutz' },
    { value: '14', label: '14 · Leben unter Wasser' },
    { value: '15', label: '15 · Leben an Land' },
    { value: '16', label: '16 · Frieden, Gerechtigkeit und starke Institutionen' },
    { value: '17', label: '17 · Partnerschaften zur Erreichung der Ziele' }
  ];

  var VERWIRKLICHUNG = [
    { value: 'operational', label: 'operativ' },
    { value: 'funding', label: 'fördernd' },
    { value: 'both', label: 'beides' }
  ];

  var SICHTBARKEIT = [
    { value: 'public', label: 'öffentlich' },
    { value: 'network', label: 'nur Plattform-Austausch' }
  ];

  var REICHWEITEN = [
    { value: 'local', label: 'lokal', hint: 'Gemeinde, Stadtteil, Ort' },
    { value: 'regional', label: 'regional', hint: 'mehrere Gemeinden oder Kreise unterhalb der Landesebene' },
    { value: 'state', label: 'landesweit', hint: 'ein oder mehrere ganze Bundesländer' },
    { value: 'national', label: 'bundesweit', hint: '' },
    { value: 'international', label: 'international', hint: '' },
    { value: 'locationIndependent', label: 'ortsunabhängig', hint: 'rein digital' }
  ];

  // Reichweiten, bei denen eine Gebietsliste erfasst wird.
  var REICHWEITEN_MIT_GEBIETEN = ['local', 'regional', 'state'];

  /* ------------------------------------------------------------------ *
   * Blöcke und Felder
   * ------------------------------------------------------------------ */

  var FELDMODELL = {
    version: 'v0-Arbeitsstand',
    blocks: [
      {
        id: 'A',
        title: 'A · Identität',
        intro: 'Wer ist der Akteur — und woran erkennen ihn andere Systeme als denselben wieder?',
        fields: [
          {
            key: 'id',
            label: 'Organisations-ID',
            type: 'uuid',
            requirement: 'P',
            systemAssigned: true,
            help: 'Wird vom System vergeben — daran erkennen Systeme denselben Akteur.'
          },
          {
            key: 'name',
            label: 'Name',
            type: 'text',
            requirement: 'P',
            help: 'Wie heißt der Akteur offiziell?',
            placeholder: 'Deutsche Kinder- und Jugendstiftung GmbH'
          },
          {
            key: 'alternateName',
            label: 'Rufname / Kurzform',
            type: 'text',
            requirement: 'O',
            pending: true,
            help: 'Gebräuchliche Kurzform, genau eine.',
            placeholder: 'DKJS'
          },
          {
            key: 'url',
            label: 'Website',
            type: 'url',
            requirement: 'E',
            help: 'Wo informiert der Akteur selbst über sich?',
            placeholder: 'https://www.beispiel.de',
            pattern: '^https://\\S+$',
            patternMessage: 'Bitte die vollständige Adresse inklusive https:// angeben.'
          },
          {
            key: 'email',
            label: 'info@-Adresse',
            type: 'email',
            requirement: 'E',
            pending: true,
            help: 'Unter welcher Adresse ist die Organisation als solche erreichbar?',
            placeholder: 'info@beispiel.de',
            note: 'Bitte funktionsbezogen (info@, kontakt@) — keine persönlichen Adressen.',
            checks: ['personalEmail']
          },
          {
            key: 'telephone',
            label: 'Telefon',
            type: 'tel',
            requirement: 'E',
            pending: true,
            help: 'Zentrale, organisationsbezogene Nummer.',
            placeholder: '+49 228 1234567'
          },
          {
            key: 'addresses',
            label: 'Adresse / Standorte',
            type: 'repeatable',
            requirement: 'E',
            help: 'Wo ist die Organisation ansässig — nicht: wo wirkt sie?',
            entryLabel: 'Standort',
            addLabel: 'Standort hinzufügen',
            checks: ['singleHeadquarters'],
            subfields: [
              {
                key: 'type',
                label: 'Typ',
                type: 'select',
                options: ADRESSTYPEN,
                default: 'headquarters'
              },
              {
                key: 'streetAddress',
                label: 'Straße und Hausnummer',
                type: 'text',
                optional: true,
                placeholder: 'Musterstraße 1'
              },
              {
                key: 'postalCode',
                label: 'PLZ',
                type: 'text',
                inputmode: 'numeric',
                placeholder: '53111',
                pattern: '^\\d{5}$',
                patternMessage: 'Fünf Ziffern erwartet.'
              },
              {
                key: 'addressLocality',
                label: 'Ort',
                type: 'text',
                placeholder: 'Bonn'
              }
            ]
          },
          {
            key: 'wikidataId',
            label: 'Wikidata-Kennung',
            type: 'wikidata',
            requirement: 'E',
            help: 'Gibt es die Organisation bereits in Wikidata? Die Kennung verbindet den Eintrag mit anderen Datenquellen.',
            placeholder: 'Suche nach dem Organisationsnamen oder QID',
            pattern: '^Q\\d+$',
            patternMessage: 'Erwartet wird eine QID, zum Beispiel Q316688.'
          },
          {
            key: 'legalForm',
            label: 'Rechtsform',
            type: 'select',
            requirement: 'E',
            help: 'In welcher Rechtsform handelt die Organisation?',
            options: RECHTSFORMEN
          },
          {
            key: 'registerIds',
            label: 'Registerkennung',
            type: 'conditionalGroup',
            requirement: 'O',
            help: 'Unter welcher Nummer ist die Organisation eingetragen?',
            note: 'Nummern sind nur je Gericht eindeutig — bitte das Registergericht mit angeben.',
            visibleWhen: { field: 'legalForm', inKeysOf: REGISTERART_JE_RECHTSFORM },
            derivedFrom: { field: 'legalForm', map: REGISTERART_JE_RECHTSFORM, target: 'registerType' },
            subfields: [
              {
                key: 'registerType',
                label: 'Registerart',
                type: 'text',
                derived: true
              },
              {
                key: 'registerNumber',
                label: 'Nummer',
                type: 'text',
                placeholder: '1234'
              },
              {
                key: 'registerCourt',
                label: 'Registergericht',
                type: 'text',
                requiredInGroup: true,
                placeholder: 'Amtsgericht Bonn'
              }
            ]
          },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            requirement: 'P',
            help: 'Ist dieser Akteur derzeit handlungsfähig?',
            options: STATUS,
            default: 'active',
            allowEmpty: false
          },
          {
            key: 'lastManualUpdate',
            label: 'Letzte Aktualisierung',
            type: 'date',
            requirement: 'P',
            help: 'Wann wurden diese Angaben zuletzt geprüft?',
            defaultToday: true,
            note: 'Zählt nur bei manueller Bestätigung — nicht bei automatischen Änderungen.'
          },
          {
            key: 'logo',
            label: 'Logo',
            type: 'url',
            requirement: 'O',
            help: 'URL einer Bilddatei (PNG/SVG, möglichst quadratisch).',
            placeholder: 'https://www.beispiel.de/logo.svg'
          },
          {
            key: 'cover',
            label: 'Cover',
            type: 'url',
            requirement: 'O',
            help: 'Querformatiges Titelbild (URL).',
            placeholder: 'https://www.beispiel.de/titelbild.jpg'
          },
          {
            key: 'description',
            label: 'Kurzbeschreibung',
            type: 'textarea',
            requirement: 'E',
            help: 'Was tut der Akteur, für wen, mit welchem Ziel — in wenigen Sätzen?',
            softMin: 300,
            softMax: 500,
            hardMax: 800,
            rows: 6
          },
          {
            key: 'parentOrganization',
            label: 'Mutterorganisation',
            type: 'text',
            requirement: 'O',
            pending: true,
            help: 'Ist die Organisation Teil einer übergeordneten Organisation?',
            placeholder: 'Q316688',
            pattern: '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|Q\\d+)$',
            patternMessage: 'Erwartet wird eine Organisations-ID oder eine Wikidata-QID (Q…).',
            note: 'Referenz, kein Freitext. Ohne referenzierbare Mutter bleibt das Feld leer — das ist kein Fehler.'
          }
        ]
      },
      {
        id: 'C',
        title: 'C · Tätigkeitsprofil',
        intro: 'Was tut die Organisation inhaltlich — und mit wem hat sie es unmittelbar zu tun?',
        fields: [
          {
            key: 'fieldsOfAction',
            label: 'Handlungsfelder',
            type: 'checkboxes',
            requirement: 'P',
            help: 'In welchen Feldern ist die Organisation tätig? Mindestens eines, höchstens fünf.',
            options: HANDLUNGSFELDER,
            min: 1,
            max: 5,
            placeholderList: true
          },
          {
            key: 'primaryFieldOfAction',
            label: 'Schwerpunkt',
            type: 'derivedSelect',
            requirement: 'O',
            help: 'Welches der gewählten Handlungsfelder trägt den größten Teil der Arbeit?',
            optionsFrom: 'fieldsOfAction',
            emptyHint: 'Bitte zuerst Handlungsfelder auswählen.'
          },
          {
            key: 'educationStages',
            label: 'Bildungsabschnitte',
            type: 'checkboxes',
            requirement: 'E',
            help: 'In welcher Bildungsphase stehen die Menschen, die unmittelbar teilnehmen? Beispiel: Lehrkräftefortbildung = Erwachsenen- und Weiterbildung.',
            options: BILDUNGSABSCHNITTE
          },
          {
            key: 'targetGroups',
            label: 'Zielgruppen',
            type: 'repeatable',
            requirement: 'E',
            help: 'Wen erreicht die Organisation unmittelbar?',
            note: 'Rollen nicht mischen — „Lehrkräfte und Kinder“ sind zwei Einträge.',
            entryLabel: 'Zielgruppe',
            addLabel: 'Zielgruppe hinzufügen',
            subfields: [
              {
                key: 'role',
                label: 'Rolle',
                type: 'select',
                options: ZIELGRUPPENROLLEN,
                default: 'beneficiaries'
              },
              {
                key: 'label',
                label: 'Bezeichnung',
                type: 'text',
                placeholder: 'Lehrkräfte Sekundarstufe I'
              }
            ]
          },
          {
            key: 'sdgs',
            label: 'Nachhaltigkeitsziele (SDGs)',
            type: 'checkboxes',
            requirement: 'O',
            help: 'Auf welche der 17 Ziele zahlt die Arbeit am deutlichsten ein? Höchstens drei.',
            options: SDGS,
            max: 3,
            columns: 1
          },
          {
            key: 'implementation',
            label: 'Verwirklichung',
            type: 'radioWithVisibility',
            requirement: 'E',
            help: 'Setzt die Organisation selbst um, fördert sie andere — oder beides?',
            options: VERWIRKLICHUNG,
            visibilityLabel: 'Sichtbarkeit dieser Angabe',
            visibilityOptions: SICHTBARKEIT,
            visibilityDefault: 'public',
            note: 'Die Sichtbarkeit steuert, ob die Angabe veröffentlicht oder nur zwischen den Plattformen ausgetauscht wird.'
          }
        ]
      },
      {
        id: 'D',
        title: 'D · Wirkungsraum',
        intro: 'Wo wirkt die Organisation — getrennt von der Frage, wo sie ansässig ist.',
        fields: [
          {
            key: 'scope',
            label: 'Reichweite',
            type: 'select',
            requirement: 'P',
            help: 'Wie weit reicht die Arbeit räumlich?',
            options: REICHWEITEN
          },
          {
            key: 'areasOfActivity',
            label: 'Wirkungsgebiete',
            type: 'repeatable',
            requirement: 'E',
            help: 'Welche Gebiete sind das konkret?',
            note: '2 Stellen = Bundesland, 5 = Kreis, 8/12 = Gemeinde.',
            entryLabel: 'Gebiet',
            addLabel: 'Gebiet hinzufügen',
            visibleWhen: { field: 'scope', in: REICHWEITEN_MIT_GEBIETEN },
            checks: ['areaKeys'],
            stampToday: 'validAt',
            subfields: [
              {
                key: 'key',
                label: 'Amtlicher Schlüssel',
                type: 'text',
                inputmode: 'numeric',
                placeholder: '05315',
                pattern: '^(\\d{2}|\\d{5}|\\d{8}|\\d{12})$',
                patternMessage: 'Erwartet werden 2, 5, 8 oder 12 Ziffern.'
              },
              {
                key: 'label',
                label: 'Ortsbezeichnung',
                type: 'text',
                placeholder: 'Köln'
              }
            ]
          },
          {
            key: 'activeInStates',
            label: 'Aktiv in (Bundesland)',
            type: 'computedChips',
            requirement: 'B',
            help: 'Wird aus den ersten zwei Stellen der Wirkungsgebiete berechnet — ohne Gebiete bleibt das Feld leer.',
            computedFrom: 'areasOfActivity',
            emptyHint: 'Noch keine Wirkungsgebiete erfasst.'
          }
        ]
      }
    ]
  };

  /* ------------------------------------------------------------------ *
   * Export
   * ------------------------------------------------------------------ */

  global.EduStandard = global.EduStandard || {};
  global.EduStandard.feldmodell = FELDMODELL;
  global.EduStandard.vokabulare = {
    bundeslaender: BUNDESLAENDER,
    rechtsformen: RECHTSFORMEN,
    registerartJeRechtsform: REGISTERART_JE_RECHTSFORM,
    status: STATUS,
    adresstypen: ADRESSTYPEN,
    handlungsfelder: HANDLUNGSFELDER,
    bildungsabschnitte: BILDUNGSABSCHNITTE,
    zielgruppenrollen: ZIELGRUPPENROLLEN,
    sdgs: SDGS,
    verwirklichung: VERWIRKLICHUNG,
    sichtbarkeit: SICHTBARKEIT,
    reichweiten: REICHWEITEN,
    reichweitenMitGebieten: REICHWEITEN_MIT_GEBIETEN
  };
})(window);
