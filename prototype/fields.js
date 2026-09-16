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

  /*
   * Bildungsabschnitte: Nach Workshop 4 stehen zwei Systematiken zur
   * Entscheidung. Beide sind hier hinterlegt, damit sie im Formular
   * gegeneinander ausprobiert werden koennen. Welche in Version 1.0 gilt,
   * ist nicht entschieden.
   */
  var BILDUNGSMODELLE = [
    {
      id: 'bildungsstruktur-bereiche',
      label: (V.vokabular('bildungsstruktur-bereiche') || {}).label || 'Bildungsbereiche',
      kurz: 'Bildungsbereiche',
      options: vok('bildungsstruktur-bereiche'),
      mitUebergaengen: true
    },
    {
      id: 'bildungsabschnitte-lebenslang',
      label: (V.vokabular('bildungsabschnitte-lebenslang') || {}).label || 'Bildungsabschnitte',
      kurz: 'Bildungsabschnitte (lebenslanges Lernen)',
      options: vok('bildungsabschnitte-lebenslang'),
      mitUebergaengen: false
    }
  ];
  var ZIELGRUPPENROLLEN = vok('zielgruppenrollen');
  var ZIELGRUPPEN_ENTWURF = vok('zielgruppen-entwurf');

  /*
   * Zielgruppen je Rolle. Die Zuordnung steht am Begriff selbst, damit die
   * Liste an einer Stelle gepflegt wird und nicht zweimal.
   */
  function zielgruppenJeRolle(rolle) {
    if (!rolle) { return []; }
    return ZIELGRUPPEN_ENTWURF.filter(function (o) {
      var b = V.begriff('zielgruppen-entwurf', o.value);
      return b && b.rolle === rolle;
    });
  }
  var SDGS = vok('sdg');
  var VERWIRKLICHUNG = vok('verwirklichung');
  var SICHTBARKEIT = vok('sichtbarkeit');
  var REICHWEITEN = vok('reichweite');
  var HERKUNFTSQUELLEN = vok('herkunftsquellen');
  var REICHWEITE_GROB = vok('reichweite-grob');
  var RAUMGLIEDERUNG = vok('raumgliederung');

  // Registerart je Rechtsform: steht als Attribut am jeweiligen Begriff.
  var REGISTERART_JE_RECHTSFORM = {};
  (V.vokabular('rechtsformen') || { concepts: [] }).concepts.forEach(function (b) {
    if (b.registerart) { REGISTERART_JE_RECHTSFORM[b.key] = b.registerart; }
  });

  /*
   * Aggregationshinweise zu den Handlungsfeldern.
   *
   * Der Crosswalk ordnet jedes Handlungsfeld einem Engagementfeld der
   * Zivilgesellschaftsstatistik und einer ICNPO-Gruppe zu. Wo diese Zuordnung
   * unsicher ist, gehoert der Grund an den Wert — sonst bleibt die offene
   * Stelle im Gespraech unsichtbar.
   */
  var HF_ZUORDNUNG = {};
  ((V.vokabular('crosswalk-handlungsfelder') || {}).eintraege || []).forEach(function (e) {
    HF_ZUORDNUNG[e.handlungsfeld] = e;
  });

  function handlungsfeldHinweise(option) {
    var e = HF_ZUORDNUNG[option.value];
    if (!e) { return []; }
    var zeilen = ['Wird aggregiert zu: ' + e.engagementfeld + ' (ICNPO ' + e.icnpo + ').'];
    if (e.sicherheit === 'niedrig' && e.hinweis) {
      zeilen.push('Zuordnung unsicher: ' + e.hinweis);
    }
    return zeilen;
  }

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
            note: 'Beendete Organisationen bleiben im Bestand — nur so bleiben vergangene Kooperationen nachvollziehbar.',
            options: STATUS,
            default: 'aktiv',
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
            help: 'Bannerbild, wie man es von Profilseiten kennt. Viele Organisationen haben keines — das Feld darf leer bleiben.',
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

        /*
         * Das Zielgruppenvokabular ist nicht entschieden. Statt eine Liste zu
         * setzen, stehen drei Fassungen zur Erprobung nebeneinander — dasselbe
         * Vorgehen wie bei der Geografie in Block D. Der Waehler betrifft nur
         * die Zielgruppen und steht deshalb bei ihnen, nicht am Blockkopf.
         */
        varianten: {
          hinweis: 'Drei Fassungen des Zielgruppenfeldes stehen zur Erprobung. Welche in '
            + 'Version 1.0 gilt, ist offen — die Liste in Variante 2 und 3 ist ein Entwurf.',
          werte: [
            { id: 1, label: 'Rolle plus Freitext', beschreibung: 'Der heutige Stand: Rolle auswählen, Bezeichnung frei eintragen.' },
            { id: 2, label: 'Rolle plus Auswahl', beschreibung: 'Rolle auswählen, dann die Zielgruppe aus der Liste dieser Rolle.' },
            { id: 3, label: 'eine Liste ohne Rollen', beschreibung: 'Alles in einer Liste. Die Rolle wird abgeleitet, nicht gefragt.' }
          ],
          bewertung: {
            frage: 'Wie war diese Fassung auszufüllen?',
            optionen: [
              { value: 'verstaendlich', label: 'verständlich' },
              { value: 'unklar', label: 'unklar' },
              { value: 'zu_aufwendig', label: 'zu aufwendig' }
            ]
          }
        },
        fields: [
          {
            key: 'fieldsOfAction',
            vokabular: 'handlungsfelder',
            label: 'Handlungsfelder',
            type: 'checkboxes',
            requirement: 'P',
            help: 'In welchen Feldern ist die Organisation tätig?',
            options: HANDLUNGSFELDER,
            optionHinweise: handlungsfeldHinweise,
            min: 1,
            // Weiche Grenze: Die Obergrenze von fünf ist ein Vorschlag aus der
            // Vokabulararbeit, kein Beschluss. Eine Sperre wuerde im Workshop
            // als Entscheidung missverstanden. Ab der sechsten Nennung
            // erscheint deshalb nur ein Hinweis.
            softMax: 5,
            softMaxHinweis: 'Je mehr Felder, desto weniger sagt die Angabe aus.'
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
            type: 'stageModel',
            requirement: 'E',
            pending: true,
            help: 'In welcher Bildungsphase stehen die Menschen, die unmittelbar an euren Angeboten teilnehmen?',
            note: 'Eine Organisation, die Lehrkräfte fortbildet, wählt Quartärbereich — nicht Schulbildung. '
              + 'Die Schülerinnen und Schüler erscheinen im Zielgruppenfeld.',
            modelle: BILDUNGSMODELLE,
            modellHinweis: 'Zwei Systematiken stehen zur Entscheidung. Hier lassen sich beide ausprobieren.',
            crosswalk: 'crosswalk-bildungsabschnitte',
            min: 1
          },
          {
            key: 'targetGroups',
            jsonKey: 'targetGroups',
            label: 'Wer nimmt an euren Angeboten teil?',
            // Im Formular steht die Leitfrage, weil sie das Feld erhebbar
            // macht. In der Netzdarstellung waere eine Frage als Knotenname
            // unbrauchbar — dort gilt der Feldname.
            kurz: 'Zielgruppen',
            type: 'repeatable',
            requirement: 'E',
            variante: 1,
            pending: true,
            help: 'Erfasst wird die Primärzielgruppe: wer unmittelbar beteiligt ist, nicht wo mittelbar Wirkung entsteht.',
            note: 'Eine Person kann mehrere Rollen haben. Maßgeblich ist, in welcher Rolle sie an eurem '
              + 'Angebot teilnimmt — „Lehrkräfte und Kinder“ sind zwei Einträge.',
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
            key: 'targetGroupsAuswahl',
            jsonKey: 'targetGroups',
            // Der stabile Schluessel neben der Beschriftung ist der ganze
            // Unterschied zum Freitext — er gehoert deshalb in die Vorschau.
            alsDatensatz: function (eintraege) {
              return eintraege.map(function (e) {
                return { role: e.role, value: e.value, label: V.beschriftung('zielgruppen-entwurf', e.value) };
              });
            },
            label: 'Wer nimmt an euren Angeboten teil?',
            kurz: 'Zielgruppen',
            type: 'repeatable',
            requirement: 'E',
            variante: 2,
            pending: true,
            help: 'Erst die Rolle, dann die Zielgruppe aus der Liste dieser Rolle.',
            note: 'Die Liste ist ein Entwurf für diesen Test, keine Festlegung. Sie ist bewusst kurz: '
              + 'Sie soll prüfbar machen, ob eine Auswahl gegenüber Freitext trägt — nicht die Frage '
              + 'beantworten, welche Zielgruppen der Standard führt.',
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
                key: 'value',
                label: 'Zielgruppe',
                type: 'abhaengigeAuswahl',
                optionsFrom: 'role',
                optionenFuer: zielgruppenJeRolle
              }
            ]
          },
          {
            key: 'targetGroupsFlach',
            jsonKey: 'targetGroups',
            alsDatensatz: function (schluessel) {
              return schluessel.map(function (k) {
                return { value: k, label: V.beschriftung('zielgruppen-entwurf', k) };
              });
            },
            label: 'Wer nimmt an euren Angeboten teil?',
            kurz: 'Zielgruppen',
            type: 'checkboxes',
            requirement: 'E',
            variante: 3,
            pending: true,
            help: 'Eine Liste ohne Rollen. Ankreuzen, was zutrifft.',
            note: 'Die Rolle wird nicht gefragt, sondern aus dem Wert abgeleitet und im '
              + 'Austauschformat mitgegeben. Diese Variante prüft, ob die Unterscheidung zwischen '
              + 'Endbegünstigten, Fachkräften und Institutionen beim Ausfüllen gebraucht wird.',
            options: ZIELGRUPPEN_ENTWURF,
            optionZusatz: function (option) {
              var b = V.begriff('zielgruppen-entwurf', option.value);
              return b ? V.beschriftung('zielgruppenrollen', b.rolle) : null;
            },
            columns: 1
          },
          {
            key: 'sdgs',
            vokabular: 'sdg',
            label: 'Nachhaltigkeitsziele (SDGs)',
            type: 'checkboxes',
            requirement: 'O',
            help: 'Auf welche der 17 Ziele zahlt die Arbeit am deutlichsten ein?',
            options: SDGS,
            // Wie bei den Handlungsfeldern: keine Sperre, weil keine Obergrenze
            // beschlossen ist. Stattdessen die Frage nach dem primaeren Ziel.
            softMax: 3,
            softMaxHinweis: 'Je mehr Ziele, desto weniger sagt die Angabe aus. Welches ist das primäre?',
            columns: 1
          },
          {
            key: 'primarySdg',
            label: 'Primäres Nachhaltigkeitsziel',
            type: 'derivedSelect',
            requirement: 'O',
            help: 'Auf welches der gewählten Ziele zahlt die Arbeit am deutlichsten ein?',
            optionsFrom: 'sdgs',
            emptyHint: 'Bitte zuerst Nachhaltigkeitsziele auswählen.'
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

        /*
         * Workshop 4 hat die geografische Aufloesung bewusst nicht entschieden,
         * sondern beschlossen, die Varianten am Formular zu pruefen. Der Wahl
         * hier gilt nur der Erprobung: Er steht fuer die Arbeitsgruppe da und
         * hat auf den Datensatz keine Wirkung ausser der, welche Felder
         * ausgefuellt werden.
         */
        varianten: {
          hinweis: 'Drei Varianten stehen zur Erprobung. Welche in Version 1.0 gilt, ist offen.',
          werte: [
            { id: 1, label: 'Trichterprinzip', beschreibung: 'Nur den präzisesten Raum angeben; die übergeordneten Ebenen ergeben sich daraus.' },
            { id: 2, label: 'Stufe plus Gebiet', beschreibung: 'Reichweitenstufe und Gebietsliste getrennt.' },
            { id: 3, label: 'grobe Stufe', beschreibung: 'Vier Werte, keine Gebietsangabe.' }
          ],
          bewertung: {
            frage: 'Wie war diese Variante auszufüllen?',
            optionen: [
              { value: 'verstaendlich', label: 'verständlich' },
              { value: 'unklar', label: 'unklar' },
              { value: 'zu_aufwendig', label: 'zu aufwendig' }
            ]
          }
        },
        fields: [
          {
            key: 'spatialFunnel',
            vokabular: 'raumgliederung',
            label: 'Wo wirkt die Organisation?',
            type: 'funnel',
            requirement: 'P',
            variante: 1,
            help: 'Den präzisesten Raum eingeben — Land, Kreis oder Gemeinde. Die übergeordneten Ebenen ergeben sich daraus.',
            note: 'Demonstrationsmaterial: alle 16 Länder, dazu eine Auswahl an Gemeinden. '
              + 'Keine vollständige Raumgliederung, kein externer Dienst.',
            options: RAUMGLIEDERUNG,
            placeholder: 'Bonn, Sachsen, 05315 …'
          },
          {
            key: 'scope',
            vokabular: 'reichweite',
            label: 'Reichweite',
            type: 'select',
            requirement: 'P',
            variante: 2,
            help: 'Wie weit reicht die Arbeit räumlich?',
            note: 'Gebiet und Reichweite sind nicht dasselbe: Wer in Bonn tätig ist, ist nicht automatisch '
              + 'landesweit tätig. Bei lokal, regional und landesweit erscheint darunter eine Gebietsliste.',
            options: REICHWEITEN
          },
          {
            key: 'scopeCoarse',
            vokabular: 'reichweite-grob',
            label: 'Reichweite',
            type: 'select',
            requirement: 'P',
            variante: 3,
            help: 'Wie weit reicht die Arbeit räumlich?',
            note: 'Diese Variante erhebt kein Gebiet. Sie prüft, ob Einfachheit die Ausfüllquote erhöht.',
            options: REICHWEITE_GROB
          },
          {
            key: 'areasOfActivity',
            variante: 2,
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
            variante: 2,
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
        status: 'aktiv',
        description: 'Die Lesebrücke Marzahn bringt ehrenamtliche Lesepat:innen mit Grundschulkindern zusammen, die zu Hause wenig Gelegenheit zum Lesen haben. Einmal wöchentlich wird in kleinen Gruppen an zwei Schulen im Bezirk gelesen. Die Initiative arbeitet ohne feste Stellen und finanziert sich aus Spenden und einer Bezirksförderung.',
        fieldsOfAction: ['sprachbildung', 'persoenlichkeitsentwicklung'],
        primaryFieldOfAction: 'sprachbildung',
        educationStages: {
          modell: 'bildungsstruktur-bereiche',
          werte: ['primarstufe'],
          quelle: 'selbstauskunft'
        },
        targetGroups: [
          { role: 'beneficiaries', label: 'Kinder der Jahrgangsstufen 1 bis 4' },
          { role: 'multipliers', label: 'Ehrenamtliche Lesepat:innen' }
        ],
        // Dieselben Zielgruppen in den beiden Entwurfsfassungen. Der Vergleich
        // zeigt auch, was dabei verlorengeht: „Jahrgangsstufen 1 bis 4“ wird
        // zum gröberen „Kinder im Grundschulalter“.
        targetGroupsAuswahl: [
          { role: 'beneficiaries', value: 'grundschulkinder' },
          { role: 'multipliers', value: 'ehrenamtliche' }
        ],
        targetGroupsFlach: ['grundschulkinder', 'ehrenamtliche'],
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
        status: 'aktiv',
        description: 'Lernraum Nord begleitet Schulen in Schleswig-Holstein bei der Demokratiebildung. Der Verein qualifiziert Lehrkräfte, moderiert Klassenrats- und Beteiligungsprozesse und stellt frei nutzbare Materialien bereit. Ziel ist, dass Jugendliche Aushandlung und Mitbestimmung im Schulalltag praktisch erfahren und nicht nur als Unterrichtsthema kennenlernen. Getragen wird die Arbeit von 14 Hauptamtlichen und rund 60 Ehrenamtlichen.',
        fieldsOfAction: ['politische_bildung', 'lehrkraeftebildung'],
        primaryFieldOfAction: 'politische_bildung',
        // Der Verein qualifiziert Lehrkraefte und arbeitet mit Schulklassen:
        // beide Bereiche stehen nebeneinander, dazu der Uebergang dazwischen.
        educationStages: {
          modell: 'bildungsstruktur-bereiche',
          werte: ['sekundarstufe_1', 'sekundarstufe_2', 'quartaerbereich'],
          uebergaenge: ['sek1_sek2'],
          quelle: 'selbstauskunft'
        },
        targetGroups: [
          { role: 'multipliers', label: 'Lehrkräfte Sekundarstufe I' },
          { role: 'beneficiaries', label: 'Schülerinnen und Schüler der Jahrgänge 7 bis 10' }
        ],
        targetGroupsAuswahl: [
          { role: 'multipliers', value: 'lehrkraefte' },
          { role: 'beneficiaries', value: 'schueler_sek1' }
        ],
        targetGroupsFlach: ['lehrkraefte', 'schueler_sek1'],
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
        status: 'aktiv',
        description: 'Die Stiftung Bildungschancen fördert gemeinnützige Träger, die Jugendliche beim Übergang von der Schule in Ausbildung und Beruf begleiten. Sie vergibt Projektmittel, finanziert Qualifizierung in den geförderten Organisationen und wertet die Ergebnisse gemeinsam mit ihnen aus. Eigene Angebote führt die Stiftung nicht durch; sie versteht sich als Ko-Finanziererin und Lernpartnerin der Trägerlandschaft.',
        fieldsOfAction: ['wirtschaft', 'mint_bildung', 'digitale_transformation'],
        primaryFieldOfAction: 'wirtschaft',
        // Berufsorientierung ist in der neuen Liste kein Handlungsfeld mehr,
        // sondern erscheint ueber den Bildungsbereich und den Uebergang.
        educationStages: {
          modell: 'bildungsstruktur-bereiche',
          werte: ['sekundarstufe_1', 'sekundarstufe_2'],
          uebergaenge: ['sek1_sek2', 'sek2_erwerbstaetigkeit'],
          quelle: 'selbstauskunft'
        },
        targetGroups: [
          { role: 'institutions', label: 'Gemeinnützige Bildungsträger' },
          { role: 'institutions', label: 'Bildungsverwaltungen der Länder' }
        ],
        targetGroupsAuswahl: [
          { role: 'institutions', value: 'bildungstraeger' },
          { role: 'institutions', value: 'bildungsverwaltungen' }
        ],
        targetGroupsFlach: ['bildungstraeger', 'bildungsverwaltungen'],
        sdgs: ['4', '8', '10'],
        primarySdg: '4',
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
    bildungsmodelle: BILDUNGSMODELLE,
    // Auswertungsachse: die Bildungsbereiche. Sie sind die Leitachse des
    // Crosswalks und tragen als einzige eine ISCED-Entsprechung.
    bildungsbereiche: BILDUNGSMODELLE[0].options,
    zielgruppenrollen: ZIELGRUPPENROLLEN,
    zielgruppenEntwurf: ZIELGRUPPEN_ENTWURF,
    sdgs: SDGS,
    verwirklichung: VERWIRKLICHUNG,
    sichtbarkeit: SICHTBARKEIT,
    reichweiten: REICHWEITEN,
    reichweiteGrob: REICHWEITE_GROB,
    raumgliederung: RAUMGLIEDERUNG,
    herkunftsquellen: HERKUNFTSQUELLEN,
    reichweitenMitGebieten: REICHWEITEN_MIT_GEBIETEN
  };
})(window);
