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
   *
   * Die Wertelisten stehen nicht mehr hier, sondern je Vokabular in einer
   * eigenen Datei unter vocab/ — mit Version, Quelle, Abrufdatum und
   * Pruefstand. Dieses Modul referenziert sie nur noch ueber ihre id.
   *
   * Der Loader liefert bei optionen() nur nicht-veraltete Begriffe; die
   * Beschriftung eines veralteten Schluessels bleibt ueber beschriftung()
   * erreichbar, damit bestehende Datensaetze lesbar bleiben.
   * ------------------------------------------------------------------ */

  var V = global.EduVocab;

  function vok(id) { return V.optionen(id); }

  var BUNDESLAENDER = vok('bundeslaender');
  var RECHTSFORMEN = vok('rechtsformen');
  var STATUS = vok('organisationsstatus');
  var ADRESSTYPEN = vok('adresstypen');
  var HANDLUNGSFELDER = vok('handlungsfelder');
  var BILDUNGSABSCHNITTE = vok('bildungsabschnitte');
  var LERNFORMEN = vok('lernformen');
  var ZIELGRUPPENROLLEN = vok('zielgruppenrollen');
  var SDGS = vok('sdg');
  var VERWIRKLICHUNG = vok('verwirklichung');
  var SICHTBARKEIT = vok('sichtbarkeit');
  var REICHWEITEN = vok('reichweite');
  var HERKUNFTSQUELLEN = vok('herkunftsquellen');

  // Registerart je Rechtsform: steht als Attribut am jeweiligen Begriff.
  var REGISTERART_JE_RECHTSFORM = {};
  (V.vokabular('rechtsformen') || { concepts: [] }).concepts.forEach(function (b) {
    if (b.registerart) { REGISTERART_JE_RECHTSFORM[b.key] = b.registerart; }
  });

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
            checks: ['personalEmail'],
            provenance: true
          },
          {
            key: 'telephone',
            label: 'Telefon',
            type: 'tel',
            requirement: 'E',
            pending: true,
            help: 'Zentrale, organisationsbezogene Nummer.',
            placeholder: '+49 228 1234567',
            provenance: true
          },
          {
            key: 'addresses',
            label: 'Adresse / Standorte',
            type: 'repeatable',
            requirement: 'E',
            help: 'Wo ist die Organisation ansässig — nicht: wo wirkt sie?',
            entryLabel: 'Standort',
            addLabel: 'Standort hinzufügen',
            provenance: true,
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
            vokabular: 'rechtsformen',
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
            vokabular: 'organisationsstatus',
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
          },
          {
            key: 'gndId',
            label: 'GND-Kennung',
            type: 'text',
            requirement: 'O',
            experimental: true,
            help: 'Kennung in der Gemeinsamen Normdatei der Deutschen Nationalbibliothek. In Wikidata als Property P227 geführt.',
            placeholder: '2007744-0',
            pattern: '^[0-9X-]+$',
            patternMessage: 'Erwartet werden Ziffern, Bindestriche und ggf. ein X.',
            note: 'Nachschlagbar unter d-nb.info/gnd/ gefolgt von der Kennung.'
          },
          {
            key: 'lobbyregisterId',
            label: 'Lobbyregister-Kennung',
            type: 'text',
            requirement: 'O',
            experimental: true,
            help: 'Kennung im Lobbyregister des Deutschen Bundestages. In Wikidata als Property P10301 geführt.',
            placeholder: 'R001234',
            note: 'Nur relevant für im Lobbyregister des Bundestages eingetragene Organisationen.'
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
            vokabular: 'handlungsfelder',
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
            vokabular: 'bildungsabschnitte',
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
            vokabular: 'sdg',
            label: 'Nachhaltigkeitsziele (SDGs)',
            type: 'checkboxes',
            requirement: 'O',
            help: 'Auf welche der 17 Ziele zahlt die Arbeit am deutlichsten ein? Höchstens drei.',
            options: SDGS,
            max: 3,
            columns: 1
          },
          {
            key: 'learningFormats',
            label: 'Lernform / Schulform',
            type: 'checkboxes',
            requirement: 'O',
            proposal: true,
            vokabular: 'lernformen',
            help: 'Keine Bildungsphase, sondern die Form des Lernens oder die Schulform. Getrennt geführt, damit die Phasenachse eindeutig bleibt.',
            options: LERNFORMEN
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
            vokabular: 'reichweite',
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
   * Beispielprofile
   *
   * Erfundene Organisationen zum Vorfuehren im Workshop. Die Werte folgen
   * der internen Form des Formulars; leer gelassene Felder bleiben leer.
   * Die Organisations-ID und das Datum der letzten Aktualisierung vergibt
   * die Maske selbst.
   *
   * Die Wikidata-Kennung bleibt in allen Profilen leer: Eine QID verweist
   * immer auf eine reale Organisation und liesse sich fuer eine erfundene
   * nicht wahrheitsgemaess setzen.
   * ------------------------------------------------------------------ */

  var BEISPIELE = [
    {
      id: 'kleineInitiative',
      label: 'Kleine Initiative',
      summary: 'informell, lokal, ohne Registereintrag',
      data: {
        name: 'Lesebrücke Marzahn',
        url: 'https://www.lesebruecke-marzahn.example',
        email: 'kontakt@lesebruecke-marzahn.example',
        addresses: [
          { type: 'headquarters', streetAddress: '', postalCode: '12679', addressLocality: 'Berlin' }
        ],
        legalForm: 'informalGroup',
        status: 'active',
        description: 'Die Lesebrücke Marzahn bringt ehrenamtliche Lesepat:innen mit Grundschulkindern zusammen, die zu Hause wenig Gelegenheit zum Lesen haben. Einmal wöchentlich wird in kleinen Gruppen an zwei Schulen im Bezirk gelesen. Die Initiative arbeitet ohne feste Stellen und finanziert sich aus Spenden und einer Bezirksförderung.',
        fieldsOfAction: ['languageAndLiteracy', 'mentoring'],
        primaryFieldOfAction: 'languageAndLiteracy',
        educationStages: ['primary'],
        targetGroups: [
          { role: 'beneficiaries', label: 'Kinder der Jahrgangsstufen 1 bis 4' },
          { role: 'multipliers', label: 'Ehrenamtliche Lesepat:innen' }
        ],
        sdgs: ['4'],
        implementation: { value: 'operational', visibility: 'public' },
        scope: 'local',
        areasOfActivity: [{ key: '11000', label: 'Berlin' }]
      }
    },
    {
      id: 'mittlererVerein',
      label: 'Mittlerer Verein',
      summary: 'e. V. mit Registereintrag, zwei Standorte, landesweit',
      data: {
        name: 'Lernraum Nord — Initiative für Demokratiebildung e. V.',
        alternateName: 'Lernraum Nord',
        url: 'https://www.lernraum-nord.example',
        email: 'info@lernraum-nord.example',
        telephone: '+49 431 1234567',
        addresses: [
          { type: 'headquarters', streetAddress: 'Holstenstraße 12', postalCode: '24103', addressLocality: 'Kiel' },
          { type: 'office', streetAddress: 'Königstraße 47', postalCode: '23552', addressLocality: 'Lübeck' }
        ],
        legalForm: 'registeredAssociation',
        registerIds: { registerNumber: '6742', registerCourt: 'Amtsgericht Kiel' },
        status: 'active',
        description: 'Lernraum Nord begleitet Schulen in Schleswig-Holstein bei der Demokratiebildung. Der Verein qualifiziert Lehrkräfte, moderiert Klassenrats- und Beteiligungsprozesse und stellt frei nutzbare Materialien bereit. Ziel ist, dass Jugendliche Aushandlung und Mitbestimmung im Schulalltag praktisch erfahren und nicht nur als Unterrichtsthema kennenlernen. Getragen wird die Arbeit von 14 Hauptamtlichen und rund 60 Ehrenamtlichen.',
        fieldsOfAction: ['democracyEducation', 'civicEducation'],
        primaryFieldOfAction: 'democracyEducation',
        educationStages: ['lowerSecondary', 'upperSecondary', 'adultEducation'],
        targetGroups: [
          { role: 'multipliers', label: 'Lehrkräfte Sekundarstufe I' },
          { role: 'beneficiaries', label: 'Schülerinnen und Schüler der Jahrgänge 7 bis 10' }
        ],
        sdgs: ['4', '16'],
        implementation: { value: 'operational', visibility: 'public' },
        scope: 'state',
        areasOfActivity: [{ key: '01', label: 'Schleswig-Holstein' }]
      }
    },
    {
      id: 'bundesweiterTraeger',
      label: 'Bundesweiter Träger',
      summary: 'Stiftung ohne Registerfeld, fördernd, Angabe nur im Plattform-Austausch',
      data: {
        name: 'Stiftung Bildungschancen',
        alternateName: 'SBC',
        url: 'https://www.stiftung-bildungschancen.example',
        email: 'info@stiftung-bildungschancen.example',
        telephone: '+49 69 9876543',
        addresses: [
          { type: 'headquarters', streetAddress: 'Mainzer Landstraße 8', postalCode: '60329', addressLocality: 'Frankfurt am Main' },
          { type: 'postalAddress', streetAddress: 'Postfach 90 01 21', postalCode: '60441', addressLocality: 'Frankfurt am Main' }
        ],
        legalForm: 'foundation',
        status: 'active',
        description: 'Die Stiftung Bildungschancen fördert gemeinnützige Träger, die Jugendliche beim Übergang von der Schule in Ausbildung und Beruf begleiten. Sie vergibt Projektmittel, finanziert Qualifizierung in den geförderten Organisationen und wertet die Ergebnisse gemeinsam mit ihnen aus. Eigene Angebote führt die Stiftung nicht durch; sie versteht sich als Ko-Finanziererin und Lernpartnerin der Trägerlandschaft.',
        fieldsOfAction: ['careerOrientation', 'stemEducation', 'digitalEducation'],
        primaryFieldOfAction: 'careerOrientation',
        educationStages: ['lowerSecondary', 'upperSecondary', 'vocational'],
        targetGroups: [
          { role: 'institutions', label: 'Gemeinnützige Bildungsträger' },
          { role: 'policyMakers', label: 'Bildungsverwaltungen der Länder' }
        ],
        sdgs: ['4', '8', '10'],
        implementation: { value: 'funding', visibility: 'network' },
        scope: 'national'
      }
    }
  ];

  /* ------------------------------------------------------------------ *
   * Export
   * ------------------------------------------------------------------ */

  global.EduStandard = global.EduStandard || {};
  global.EduStandard.feldmodell = FELDMODELL;
  global.EduStandard.beispiele = BEISPIELE;
  global.EduStandard.vokabulare = {
    bundeslaender: BUNDESLAENDER,
    rechtsformen: RECHTSFORMEN,
    registerartJeRechtsform: REGISTERART_JE_RECHTSFORM,
    status: STATUS,
    adresstypen: ADRESSTYPEN,
    handlungsfelder: HANDLUNGSFELDER,
    bildungsabschnitte: BILDUNGSABSCHNITTE,
    lernformen: LERNFORMEN,
    zielgruppenrollen: ZIELGRUPPENROLLEN,
    sdgs: SDGS,
    verwirklichung: VERWIRKLICHUNG,
    sichtbarkeit: SICHTBARKEIT,
    reichweiten: REICHWEITEN,
    herkunftsquellen: HERKUNFTSQUELLEN,
    reichweitenMitGebieten: REICHWEITEN_MIT_GEBIETEN
  };
})(window);
