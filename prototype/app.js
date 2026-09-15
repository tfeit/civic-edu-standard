/*
 * Klickdummy "Akteursprofil" — Renderer und Verhalten.
 *
 * Diese Datei kennt Feldtypen, nicht Felder. Welche Felder es gibt, in welcher
 * Reihenfolge, mit welchen Vokabularen und welcher Verbindlichkeit, steht
 * ausschliesslich in fields.js.
 */

(function () {
  'use strict';

  var MODELL = window.EduStandard.feldmodell;
  var VOK = window.EduStandard.vokabulare;

  /* ------------------------------------------------------------- Helfer */

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    var bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < 16; i++) { bytes[i] = Math.floor(Math.random() * 256); }
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    var hex = [];
    for (var j = 0; j < 16; j++) { hex.push((bytes[j] + 0x100).toString(16).slice(1)); }
    return hex.slice(0, 4).join('') + '-' + hex.slice(4, 6).join('') + '-' +
      hex.slice(6, 8).join('') + '-' + hex.slice(8, 10).join('') + '-' + hex.slice(10, 16).join('');
  }

  function heute() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var t = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + t;
  }

  function el(tag, attrs, kinder) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (name) {
        var wert = attrs[name];
        if (wert === null || wert === undefined || wert === false) { return; }
        if (name === 'text') { node.textContent = wert; return; }
        if (name === 'class') { node.className = wert; return; }
        if (wert === true) { node.setAttribute(name, ''); return; }
        node.setAttribute(name, wert);
      });
    }
    (kinder || []).forEach(function (kind) {
      if (kind) { node.appendChild(kind); }
    });
    return node;
  }

  function leer(wert) {
    if (wert === null || wert === undefined) { return true; }
    if (typeof wert === 'string') { return wert.trim() === ''; }
    if (Array.isArray(wert)) { return wert.length === 0; }
    if (typeof wert === 'object') { return Object.keys(wert).length === 0; }
    return false;
  }

  function beschriftung(optionen, wert) {
    for (var i = 0; i < optionen.length; i++) {
      if (optionen[i].value === wert) { return optionen[i].label; }
    }
    return wert;
  }

  function optionsText(option) {
    return option.hint ? option.label + ' — ' + option.hint : option.label;
  }

  /* -------------------------------------------------------------- Zustand */

  var zustand = {};        // Feldschlüssel -> Wert
  var herkunft = {};       // Feldschlüssel -> { quelle, quellenUrl, erfasstAm }
  var knoten = {};         // Feldschlüssel -> DOM-Referenzen
  var wikidataAus = false; // Autosuggest nicht erreichbar

  function alleFelder() {
    var liste = [];
    MODELL.blocks.forEach(function (block) {
      block.fields.forEach(function (feld) { liste.push(feld); });
    });
    return liste;
  }

  function initZustand() {
    alleFelder().forEach(function (feld) {
      switch (feld.type) {
        case 'uuid':
          zustand[feld.key] = uuid();
          break;
        case 'checkboxes':
          zustand[feld.key] = [];
          break;
        case 'repeatable':
          zustand[feld.key] = [neuerEintrag(feld)];
          break;
        case 'conditionalGroup':
          zustand[feld.key] = {};
          break;
        case 'radioWithVisibility':
          zustand[feld.key] = { value: '', visibility: feld.visibilityDefault || 'public' };
          break;
        case 'computedChips':
          zustand[feld.key] = [];
          break;
        case 'date':
          zustand[feld.key] = feld.defaultToday ? heute() : (feld.default || '');
          break;
        default:
          zustand[feld.key] = feld.default || '';
      }
    });
  }

  function neuerEintrag(feld) {
    var eintrag = {};
    feld.subfields.forEach(function (teil) {
      eintrag[teil.key] = teil.default || '';
    });
    if (feld.provenance) { eintrag._herkunft = { quelle: '', quellenUrl: '' }; }
    return eintrag;
  }

  /* -------------------------------------------------------- Herkunft */

  /*
   * Eingeklappte Herkunftsangabe. Sie existiert, weil ein spaeteres
   * Verzeichnis uebernommener Kontaktdaten dokumentieren muss, woher sie
   * stammen — ohne diese Angabe traegt die Interessenabwaegung nicht.
   * Zugeklappt, damit das Formular nicht laenger wirkt.
   */
  function herkunftsBlock(traeger, id) {
    var quellen = VOK.herkunftsquellen;
    var huelle = el('details', { class: 'herkunft' });
    huelle.appendChild(el('summary', { text: 'Herkunft der Angabe' }));

    var auswahlId = id + '-herkunft-quelle';
    var urlId = id + '-herkunft-url';

    var auswahl = el('select', { id: auswahlId });
    auswahl.appendChild(el('option', { value: '', text: '— keine Angabe —' }));
    quellen.forEach(function (o) {
      auswahl.appendChild(el('option', { value: o.value, text: o.label }));
    });
    auswahl.value = traeger.quelle || '';

    var urlFeld = el('input', {
      type: 'url', id: urlId, placeholder: 'https://…', autocomplete: 'off'
    });
    urlFeld.value = traeger.quellenUrl || '';

    var urlZeile = el('div', { class: 'teilfeld' }, [
      el('label', { for: urlId, text: 'Quellen-Adresse (optional)' }),
      urlFeld
    ]);

    var hinweis = el('p', { class: 'hinweis herkunft-hinweis' });

    function nachfuehren() {
      var gewaehlt = auswahl.value;
      var begriff = null;
      quellen.forEach(function (o) { if (o.value === gewaehlt) { begriff = o; } });
      var fremd = !!gewaehlt && gewaehlt !== 'selbstauskunft';
      urlZeile.hidden = !fremd;
      hinweis.textContent = fremd
        ? 'Bei Übernahme aus öffentlichen Quellen gelten Informationspflichten nach Art. 14 DSGVO. Herkunft und Datum werden mitgespeichert.'
        : '';
      if (begriff) { void begriff; }
    }

    auswahl.addEventListener('change', function () {
      traeger.quelle = auswahl.value;
      if (!traeger.quelle) { traeger.quellenUrl = ''; urlFeld.value = ''; }
      nachfuehren();
      aktualisiere();
    });
    urlFeld.addEventListener('input', function () {
      traeger.quellenUrl = urlFeld.value;
      aktualisiere();
    });

    huelle.appendChild(el('div', { class: 'herkunft-felder' }, [
      el('div', { class: 'teilfeld' }, [
        el('label', { for: auswahlId, text: 'Quelle' }),
        auswahl
      ]),
      urlZeile
    ]));
    huelle.appendChild(hinweis);
    nachfuehren();
    return huelle;
  }

  /* ------------------------------------------------- Kennzeichen / Badges */

  var KENNZEICHEN = {
    P: { text: 'Pflicht', klasse: 'kennzeichen pflicht', stern: true },
    E: { text: 'empfohlen', klasse: 'kennzeichen', stern: false },
    O: { text: 'optional', klasse: 'kennzeichen', stern: false },
    B: { text: 'berechnet', klasse: 'kennzeichen', stern: false }
  };

  function kennzeichenKnoten(feld) {
    var k = KENNZEICHEN[feld.requirement] || KENNZEICHEN.O;
    var text = k.stern ? '* ' + k.text : k.text;
    if (feld.requirement === 'P' && feld.systemAssigned) {
      text = '* Pflicht, systemvergeben';
    }
    return el('span', { class: k.klasse, text: text });
  }

  function badgeWs4() {
    return el('span', { class: 'badge-ws4', text: 'zur Entscheidung in WS 4' });
  }

  // Felder aus der Vokabularrecherche: als Vorschlag kenntlich, nicht als
  // beschlossener Bestandteil des Schemas.
  function badgeVorschlag() {
    return el('span', { class: 'badge-vorschlag', text: 'Vorschlag aus Recherche — nicht beschlossen' });
  }

  /* ------------------------------------------------------ Feld-Grundgerüst */

  function feldRahmen(feld, steuerelement, optionen) {
    optionen = optionen || {};
    var id = 'fld-' + feld.key;
    var hilfeId = id + '-hilfe';
    var hinweisId = id + '-hinweis';
    var fehlerId = id + '-fehler';

    var kopfKinder = [];
    if (optionen.gruppenLabel) {
      kopfKinder.push(el('span', { class: 'gruppen-label', id: id + '-label', text: feld.label }));
    } else {
      kopfKinder.push(el('label', { for: id, text: feld.label }));
    }
    kopfKinder.push(kennzeichenKnoten(feld));
    if (feld.pending) { kopfKinder.push(badgeWs4()); }
    if (feld.experimental || feld.proposal) { kopfKinder.push(badgeVorschlag()); }

    var kinder = [el('div', { class: 'feld-kopf' }, kopfKinder)];
    if (feld.help) { kinder.push(el('p', { class: 'hilfe', id: hilfeId, text: feld.help })); }
    if (feld.placeholderList) {
      kinder.push(el('p', { class: 'badge-platzhalter', text: 'Platzhalterliste — Vokabular in Konsolidierung' }));
    }
    kinder.push(steuerelement);
    if (feld.note) { kinder.push(el('p', { class: 'hinweis', id: hinweisId, text: feld.note })); }

    var fehler = el('p', { class: 'feld-fehler', id: fehlerId, role: 'status' });
    kinder.push(fehler);

    var wrapper = el('div', { class: 'feld', 'data-feld': feld.key }, kinder);

    var beschrieben = [];
    if (feld.help) { beschrieben.push(hilfeId); }
    if (feld.note) { beschrieben.push(hinweisId); }
    beschrieben.push(fehlerId);

    knoten[feld.key] = knoten[feld.key] || {};
    knoten[feld.key].wrapper = wrapper;
    knoten[feld.key].fehler = fehler;
    knoten[feld.key].beschrieben = beschrieben.join(' ');

    return wrapper;
  }

  function setzeBeschreibung(feld, eingabe) {
    eingabe.setAttribute('aria-describedby', knoten[feld.key].beschrieben);
  }

  /* -------------------------------------------------------- Feld-Renderer */

  var renderer = {};

  renderer.uuid = function (feld) {
    var eingabe = el('input', {
      type: 'text',
      id: 'fld-' + feld.key,
      value: zustand[feld.key],
      readonly: true,
      'aria-readonly': 'true'
    });
    var wrapper = feldRahmen(feld, eingabe);
    setzeBeschreibung(feld, eingabe);
    knoten[feld.key].eingabe = eingabe;
    return wrapper;
  };

  function einfachesFeld(typ) {
    return function (feld) {
      var eingabe = el('input', {
        type: typ,
        id: 'fld-' + feld.key,
        value: zustand[feld.key] || '',
        placeholder: feld.placeholder || null,
        inputmode: feld.inputmode || null,
        autocomplete: 'off'
      });
      eingabe.addEventListener('input', function () {
        zustand[feld.key] = eingabe.value;
        aktualisiere();
      });

      var steuerung = eingabe;
      if (feld.provenance) {
        herkunft[feld.key] = herkunft[feld.key] || { quelle: '', quellenUrl: '' };
        steuerung = el('div', {}, [eingabe, herkunftsBlock(herkunft[feld.key], 'fld-' + feld.key)]);
      }

      var wrapper = feldRahmen(feld, steuerung);
      setzeBeschreibung(feld, eingabe);
      knoten[feld.key].eingabe = eingabe;
      return wrapper;
    };
  }

  renderer.text = einfachesFeld('text');
  renderer.url = einfachesFeld('url');
  renderer.email = einfachesFeld('email');
  renderer.tel = einfachesFeld('tel');
  renderer.date = einfachesFeld('date');

  renderer.textarea = function (feld) {
    var eingabe = el('textarea', {
      id: 'fld-' + feld.key,
      rows: feld.rows || 5,
      maxlength: feld.hardMax || null,
      placeholder: feld.placeholder || null
    });
    eingabe.value = zustand[feld.key] || '';
    var zaehler = el('p', { class: 'zeichenzaehler', 'aria-live': 'off' });
    var huelle = el('div', {}, [eingabe, zaehler]);

    eingabe.addEventListener('input', function () {
      zustand[feld.key] = eingabe.value;
      aktualisiere();
    });

    var wrapper = feldRahmen(feld, huelle);
    setzeBeschreibung(feld, eingabe);
    knoten[feld.key].eingabe = eingabe;
    knoten[feld.key].zaehler = zaehler;
    return wrapper;
  };

  renderer.select = function (feld) {
    var eingabe = el('select', { id: 'fld-' + feld.key });
    if (feld.allowEmpty !== false) {
      eingabe.appendChild(el('option', { value: '', text: '— bitte wählen —' }));
    }
    feld.options.forEach(function (option) {
      eingabe.appendChild(el('option', { value: option.value, text: optionsText(option) }));
    });
    eingabe.value = zustand[feld.key] || '';
    eingabe.addEventListener('change', function () {
      zustand[feld.key] = eingabe.value;
      aktualisiere();
    });
    var wrapper = feldRahmen(feld, eingabe);
    setzeBeschreibung(feld, eingabe);
    knoten[feld.key].eingabe = eingabe;
    return wrapper;
  };

  renderer.derivedSelect = function (feld) {
    var eingabe = el('select', { id: 'fld-' + feld.key });
    eingabe.addEventListener('change', function () {
      zustand[feld.key] = eingabe.value;
      aktualisiere();
    });
    var wrapper = feldRahmen(feld, eingabe);
    setzeBeschreibung(feld, eingabe);
    knoten[feld.key].eingabe = eingabe;
    return wrapper;
  };

  renderer.checkboxes = function (feld) {
    var liste = el('div', {
      class: 'optionsliste' + (feld.columns === 1 ? ' einspaltig' : ''),
      role: 'group',
      'aria-labelledby': 'fld-' + feld.key + '-label'
    });
    var kaestchen = [];

    feld.options.forEach(function (option, index) {
      var boxId = 'fld-' + feld.key + '-' + index;
      var box = el('input', { type: 'checkbox', id: boxId, value: option.value });
      var optionsKinder = [box, el('span', { text: option.label })];
      if (option.tooltip) {
        // Die ISCED-Entsprechung steht am Begriff selbst; sie ist im Workshop
        // die entscheidende Information und darf nicht nur im Tooltip stecken.
        optionsKinder.push(el('span', { class: 'option-zusatz', text: option.tooltip }));
      }
      var beschriftungsKnoten = el('label', {
        class: 'option' + (option.tooltip ? ' option-mit-zusatz' : ''),
        for: boxId,
        title: option.tooltip || null
      }, optionsKinder);
      box.addEventListener('change', function () {
        var werte = zustand[feld.key];
        if (box.checked) {
          if (feld.max && werte.length >= feld.max) { box.checked = false; return; }
          if (werte.indexOf(option.value) === -1) { werte.push(option.value); }
        } else {
          var pos = werte.indexOf(option.value);
          if (pos !== -1) { werte.splice(pos, 1); }
        }
        aktualisiere();
      });
      kaestchen.push({ box: box, huelle: beschriftungsKnoten, value: option.value });
      liste.appendChild(beschriftungsKnoten);
    });

    var zaehler = el('p', { class: 'auswahlzaehler', 'aria-live': 'polite' });
    var veraltet = el('ul', { class: 'veraltete-werte', hidden: true });
    var huelle = el('div', {}, [liste, veraltet, zaehler]);
    var wrapper = feldRahmen(feld, huelle, { gruppenLabel: true });
    liste.setAttribute('aria-describedby', knoten[feld.key].beschrieben);
    knoten[feld.key].kaestchen = kaestchen;
    knoten[feld.key].zaehler = zaehler;
    knoten[feld.key].veraltet = veraltet;
    return wrapper;
  };

  renderer.radioWithVisibility = function (feld) {
    var gruppe = el('div', {
      class: 'radiogruppe',
      role: 'radiogroup',
      'aria-labelledby': 'fld-' + feld.key + '-label'
    });
    feld.options.forEach(function (option, index) {
      var radioId = 'fld-' + feld.key + '-' + index;
      var radio = el('input', { type: 'radio', id: radioId, name: 'fld-' + feld.key, value: option.value });
      radio.addEventListener('change', function () {
        if (radio.checked) {
          zustand[feld.key].value = option.value;
          aktualisiere();
        }
      });
      gruppe.appendChild(el('label', { class: 'option', for: radioId }, [radio, el('span', { text: option.label })]));
    });

    var sichtGruppe = el('div', {
      class: 'radiogruppe',
      role: 'radiogroup',
      'aria-labelledby': 'fld-' + feld.key + '-sicht-label'
    });
    feld.visibilityOptions.forEach(function (option, index) {
      var radioId = 'fld-' + feld.key + '-sicht-' + index;
      var radio = el('input', { type: 'radio', id: radioId, name: 'fld-' + feld.key + '-sicht', value: option.value });
      radio.checked = zustand[feld.key].visibility === option.value;
      radio.addEventListener('change', function () {
        if (radio.checked) {
          zustand[feld.key].visibility = option.value;
          aktualisiere();
        }
      });
      sichtGruppe.appendChild(el('label', { class: 'option', for: radioId }, [radio, el('span', { text: option.label })]));
    });

    var sichtBlock = el('div', { class: 'sichtbarkeit' }, [
      el('span', { class: 'sichtbarkeit-titel', id: 'fld-' + feld.key + '-sicht-label', text: feld.visibilityLabel }),
      sichtGruppe
    ]);

    var huelle = el('div', {}, [gruppe, sichtBlock]);
    var wrapper = feldRahmen(feld, huelle, { gruppenLabel: true });
    gruppe.setAttribute('aria-describedby', knoten[feld.key].beschrieben);
    return wrapper;
  };

  renderer.conditionalGroup = function (feld) {
    var raster = el('div', { class: 'eintrag-raster' });
    feld.subfields.forEach(function (teil) {
      var teilId = 'fld-' + feld.key + '-' + teil.key;
      var eingabe = el('input', {
        type: 'text',
        id: teilId,
        placeholder: teil.placeholder || null,
        readonly: teil.derived ? true : null,
        'aria-readonly': teil.derived ? 'true' : null
      });
      eingabe.value = zustand[feld.key][teil.key] || '';
      if (!teil.derived) {
        eingabe.addEventListener('input', function () {
          zustand[feld.key][teil.key] = eingabe.value;
          aktualisiere();
        });
      }
      var beschriftungsText = teil.label + (teil.requiredInGroup ? ' *' : '');
      raster.appendChild(el('div', { class: 'teilfeld' }, [
        el('label', { for: teilId, text: beschriftungsText }),
        eingabe
      ]));
      knoten[feld.key] = knoten[feld.key] || {};
      knoten[feld.key][teil.key] = eingabe;
    });

    var eintragsBox = el('div', { class: 'eintrag' }, [raster]);
    var wrapper = feldRahmen(feld, eintragsBox, { gruppenLabel: true });
    return wrapper;
  };

  renderer.repeatable = function (feld) {
    var eintraege = el('div', { class: 'eintraege' });
    var leerHinweis = el('p', {
      class: 'leer-hinweis',
      text: 'Noch kein Eintrag — über den Knopf darunter hinzufügen.'
    });
    var hinzu = el('button', {
      type: 'button',
      class: 'leise',
      text: '+ ' + feld.addLabel,
      title: 'Auch mit Strg + Eingabetaste aus einem Feld dieser Gruppe'
    });
    var rueckgaengig = el('div', { class: 'rueckgaengig', hidden: true });
    var warnungen = el('div', {});

    function ergaenzeEintrag() {
      verwirfRueckgaengig(feld);
      zustand[feld.key].push(neuerEintrag(feld));
      zeichneEintraege(feld, true);
      aktualisiere();
    }

    hinzu.addEventListener('click', ergaenzeEintrag);

    // Strg/Cmd + Eingabetaste innerhalb der Gruppe legt einen Eintrag an.
    eintraege.addEventListener('keydown', function (ereignis) {
      if (ereignis.key === 'Enter' && (ereignis.ctrlKey || ereignis.metaKey)) {
        ereignis.preventDefault();
        ergaenzeEintrag();
      }
    });

    var huelle = el('div', {}, [eintraege, leerHinweis, hinzu, rueckgaengig, warnungen]);
    var wrapper = feldRahmen(feld, huelle, { gruppenLabel: true });

    knoten[feld.key].eintraege = eintraege;
    knoten[feld.key].leerHinweis = leerHinweis;
    knoten[feld.key].warnungen = warnungen;
    knoten[feld.key].hinzuKnopf = hinzu;
    knoten[feld.key].rueckgaengig = rueckgaengig;
    zeichneEintraege(feld, false);
    return wrapper;
  };

  /* --------------------------------------------- Entfernen rueckgaengig machen */

  var letzteEntfernung = null;

  function merkeEntfernung(feld, index, eintrag) {
    letzteEntfernung = { feldKey: feld.key, index: index, eintrag: eintrag };
    zeigeRueckgaengig(feld);
  }

  function zeigeRueckgaengig(feld) {
    var behaelter = knoten[feld.key].rueckgaengig;
    if (!behaelter) { return; }
    behaelter.textContent = '';
    if (!letzteEntfernung || letzteEntfernung.feldKey !== feld.key) {
      behaelter.hidden = true;
      return;
    }
    var knopf = el('button', { type: 'button', class: 'leise', text: 'Rückgängig' });
    knopf.addEventListener('click', function () {
      var gemerkt = letzteEntfernung;
      letzteEntfernung = null;
      zustand[gemerkt.feldKey].splice(gemerkt.index, 0, gemerkt.eintrag);
      zeichneEintraege(feld, false);
      aktualisiere();
      if (knoten[feld.key].hinzuKnopf) { knoten[feld.key].hinzuKnopf.focus(); }
    });
    behaelter.appendChild(el('span', { text: feld.entryLabel + ' entfernt. ' }));
    behaelter.appendChild(knopf);
    behaelter.hidden = false;
  }

  function verwirfRueckgaengig(feld) {
    letzteEntfernung = null;
    if (knoten[feld.key] && knoten[feld.key].rueckgaengig) {
      knoten[feld.key].rueckgaengig.hidden = true;
      knoten[feld.key].rueckgaengig.textContent = '';
    }
  }

  function zeichneEintraege(feld, fokusLetzten) {
    var behaelter = knoten[feld.key].eintraege;
    behaelter.textContent = '';

    zustand[feld.key].forEach(function (eintrag, index) {
      var raster = el('div', { class: 'eintrag-raster' });

      feld.subfields.forEach(function (teil) {
        var teilId = 'fld-' + feld.key + '-' + index + '-' + teil.key;
        var eingabe;
        if (teil.type === 'select') {
          eingabe = el('select', { id: teilId });
          teil.options.forEach(function (option) {
            eingabe.appendChild(el('option', { value: option.value, text: option.label }));
          });
          eingabe.value = eintrag[teil.key] || teil.default || '';
          eingabe.addEventListener('change', function () {
            eintrag[teil.key] = eingabe.value;
            aktualisiere();
          });
        } else {
          eingabe = el('input', {
            type: 'text',
            id: teilId,
            placeholder: teil.placeholder || null,
            inputmode: teil.inputmode || null,
            autocomplete: 'off'
          });
          eingabe.value = eintrag[teil.key] || '';
          eingabe.addEventListener('input', function () {
            eintrag[teil.key] = eingabe.value;
            if (feld.key === 'areasOfActivity' && teil.key === 'key') {
              ergaenzeBundeslandLabel(feld, eintrag, index);
            }
            aktualisiere();
          });
        }
        var beschriftungsText = teil.label + (teil.optional ? ' (optional)' : '');
        raster.appendChild(el('div', { class: 'teilfeld' }, [
          el('label', { for: teilId, text: beschriftungsText }),
          eingabe
        ]));
      });

      var entfernen = el('button', {
        type: 'button',
        class: 'leise',
        text: 'Entfernen',
        'aria-label': feld.entryLabel + ' ' + (index + 1) + ' entfernen'
      });
      entfernen.addEventListener('click', function () {
        var entfernter = zustand[feld.key].splice(index, 1)[0];
        zeichneEintraege(feld, false);
        merkeEntfernung(feld, index, entfernter);
        aktualisiere();
        if (knoten[feld.key].hinzuKnopf) { knoten[feld.key].hinzuKnopf.focus(); }
      });

      var kopf = el('div', { class: 'eintrag-kopf' }, [
        el('span', { class: 'eintrag-nummer' }, [
          document.createTextNode(feld.entryLabel + ' ' + (index + 1)),
          el('span', { class: 'eintrag-zusammenfassung', text: eintragsZusammenfassung(feld, eintrag) })
        ]),
        entfernen
      ]);

      var fehler = el('p', { class: 'feld-fehler', role: 'status' });
      var eintragsKinder = [kopf, raster];
      if (feld.provenance) {
        eintrag._herkunft = eintrag._herkunft || { quelle: '', quellenUrl: '' };
        eintragsKinder.push(herkunftsBlock(eintrag._herkunft, 'fld-' + feld.key + '-' + index));
      }
      eintragsKinder.push(fehler);
      behaelter.appendChild(el('div', { class: 'eintrag' }, eintragsKinder));
    });

    if (fokusLetzten) {
      var letzter = behaelter.lastElementChild;
      if (letzter) {
        var ziel = letzter.querySelector('input, select');
        if (ziel) { ziel.focus(); }
      }
    }
  }

  // Kurzfassung eines Eintrags fuer den Kopf der Karte, damit bei mehreren
  // Eintraegen erkennbar bleibt, welcher welcher ist.
  function eintragsZusammenfassung(feld, eintrag) {
    var teile = [];
    feld.subfields.forEach(function (teil) {
      var wert = (eintrag[teil.key] || '').trim();
      if (!wert) { return; }
      teile.push(teil.type === 'select' ? beschriftung(teil.options, wert) : wert);
    });
    return teile.length ? ' · ' + teile.join(' · ') : '';
  }

  function ergaenzeBundeslandLabel(feld, eintrag, index) {
    var schluessel = (eintrag.key || '').trim();
    if (!/^\d{2}$/.test(schluessel)) { return; }
    var treffer = null;
    VOK.bundeslaender.forEach(function (land) {
      if (land.value === schluessel) { treffer = land; }
    });
    if (!treffer) { return; }
    eintrag.label = treffer.label;
    var labelFeld = document.getElementById('fld-' + feld.key + '-' + index + '-label');
    if (labelFeld) { labelFeld.value = treffer.label; }
  }

  renderer.computedChips = function (feld) {
    var chips = el('ul', { class: 'chips', 'aria-labelledby': 'fld-' + feld.key + '-label' });
    var hinweis = el('p', { class: 'leer-hinweis', text: feld.emptyHint || '' });
    var huelle = el('div', {}, [chips, hinweis]);
    var wrapper = feldRahmen(feld, huelle, { gruppenLabel: true });
    knoten[feld.key].chips = chips;
    knoten[feld.key].leerHinweis = hinweis;
    return wrapper;
  };

  /* ------------------------------------------------------------- Wikidata */

  renderer.wikidata = function (feld) {
    var eingabe = el('input', {
      type: 'text',
      id: 'fld-' + feld.key,
      placeholder: feld.placeholder || null,
      autocomplete: 'off',
      role: 'combobox',
      'aria-expanded': 'false',
      'aria-autocomplete': 'list',
      'aria-controls': 'fld-' + feld.key + '-treffer'
    });
    var treffer = el('ul', { class: 'wikidata-treffer', id: 'fld-' + feld.key + '-treffer', hidden: true });
    var gewaehlt = el('p', { class: 'wikidata-gewaehlt', 'aria-live': 'polite' });
    var huelle = el('div', { class: 'wikidata-feld' }, [eingabe, treffer, gewaehlt]);

    var timer = null;

    function schliesse() {
      treffer.textContent = '';
      treffer.hidden = true;
      eingabe.setAttribute('aria-expanded', 'false');
    }

    function uebernehme(qid, label) {
      zustand[feld.key] = qid;
      knoten[feld.key].label = label || '';
      eingabe.value = qid;
      schliesse();
      aktualisiere();
      eingabe.focus();
    }

    eingabe.addEventListener('input', function () {
      var wert = eingabe.value.trim();
      // Direkt eingetragene QID zählt sofort als Wert.
      zustand[feld.key] = wert;
      if (!/^Q\d+$/.test(wert)) { knoten[feld.key].label = ''; }
      aktualisiere();

      if (timer) { window.clearTimeout(timer); }
      if (wikidataAus || wert.length < 3 || /^Q\d+$/.test(wert)) { schliesse(); return; }
      timer = window.setTimeout(function () { sucheWikidata(wert); }, 300);
    });

    eingabe.addEventListener('keydown', function (ereignis) {
      if (ereignis.key === 'Escape') { schliesse(); }
      if (ereignis.key === 'ArrowDown') {
        var ersterKnopf = treffer.querySelector('button');
        if (ersterKnopf) { ereignis.preventDefault(); ersterKnopf.focus(); }
      }
    });

    huelle.addEventListener('focusout', function () {
      window.setTimeout(function () {
        if (!huelle.contains(document.activeElement)) { schliesse(); }
      }, 0);
    });

    function sucheWikidata(suchbegriff) {
      var url = 'https://www.wikidata.org/w/api.php?action=wbsearchentities' +
        '&search=' + encodeURIComponent(suchbegriff) +
        '&language=de&uselang=de&type=item&limit=10&format=json&origin=*';
      var abbruch = window.AbortController ? new AbortController() : null;
      var abbruchTimer = window.setTimeout(function () {
        if (abbruch) { abbruch.abort(); }
      }, 4000);

      window.fetch(url, abbruch ? { signal: abbruch.signal } : undefined)
        .then(function (antwort) {
          if (!antwort.ok) { throw new Error('nicht erreichbar'); }
          return antwort.json();
        })
        .then(function (daten) {
          window.clearTimeout(abbruchTimer);
          zeigeTreffer((daten && daten.search) || []);
        })
        .catch(function () {
          // Ohne Netz wird das Feld zum einfachen Textfeld mit Musterprüfung.
          window.clearTimeout(abbruchTimer);
          wikidataAus = true;
          schliesse();
          gewaehlt.textContent = 'Suche nicht erreichbar — bitte die QID direkt eintragen (Muster Q…).';
        });
    }

    function zeigeTreffer(liste) {
      treffer.textContent = '';
      if (!liste.length) {
        treffer.hidden = true;
        eingabe.setAttribute('aria-expanded', 'false');
        // Kein Treffer ist bei kleineren Organisationen der Normalfall und
        // wird auch so benannt — nicht als Fehlschlag.
        gewaehlt.textContent = 'Kein Wikidata-Eintrag gefunden — das ist bei kleineren Organisationen üblich. Feld kann leer bleiben.';
        return;
      }
      liste.slice(0, 8).forEach(function (eintrag) {
        var beschreibung = eintrag.description || 'ohne Beschreibung';
        var kinder = [
          el('span', { class: 'treffer-label' }, [
            document.createTextNode(eintrag.label || eintrag.id),
            el('span', { class: 'treffer-qid', text: ' · ' + eintrag.id })
          ]),
          el('span', { class: 'treffer-beschreibung', text: beschreibung })
        ];
        // Deutschlandbezug nur aus dem vorliegenden Suchergebnis ableiten —
        // ein zweiter Abruf je Tastendruck waere unverhaeltnismaessig.
        if (/deutsch|german|in Deutschland/i.test(beschreibung)) {
          kinder.push(el('span', { class: 'treffer-marke', text: 'Deutschlandbezug laut Beschreibung' }));
        }
        var knopf = el('button', { type: 'button' }, kinder);
        knopf.addEventListener('click', function () {
          uebernehme(eintrag.id, eintrag.label || '');
        });
        treffer.appendChild(el('li', {}, [knopf]));
      });
      treffer.hidden = false;
      eingabe.setAttribute('aria-expanded', 'true');
    }

    var wrapper = feldRahmen(feld, huelle);
    setzeBeschreibung(feld, eingabe);
    knoten[feld.key].eingabe = eingabe;
    knoten[feld.key].gewaehlt = gewaehlt;
    knoten[feld.key].label = '';
    return wrapper;
  };

  /* ---------------------------------------------------------- Aufbau Form */

  function zeichneFormular() {
    var ziel = document.getElementById('formular');
    MODELL.blocks.forEach(function (block) {
      var legende = el('legend', { text: block.title });
      var abschnitt = el('fieldset', {
        class: 'abschnitt',
        id: 'abschnitt-' + block.id,
        'data-block': block.id,
        tabindex: '-1'
      }, [
        legende,
        el('p', { class: 'abschnitt-intro', text: block.intro })
      ]);
      block.fields.forEach(function (feld) {
        var fn = renderer[feld.type];
        if (!fn) { return; }
        abschnitt.appendChild(fn(feld));
      });
      ziel.appendChild(abschnitt);
    });
  }

  /* --------------------------------------------------- Sichtbarkeitsregeln */

  function istSichtbar(feld) {
    if (!feld.visibleWhen) { return true; }
    var wert = zustand[feld.visibleWhen.field];
    if (feld.visibleWhen.in) {
      return feld.visibleWhen.in.indexOf(wert) !== -1;
    }
    if (feld.visibleWhen.inKeysOf) {
      return Object.prototype.hasOwnProperty.call(feld.visibleWhen.inKeysOf, wert);
    }
    return true;
  }

  /* ------------------------------------------------------------ Prüfungen */

  function pruefeMuster(feld) {
    var wert = (zustand[feld.key] || '').toString().trim();
    if (!feld.pattern || wert === '') { return ''; }
    return new RegExp(feld.pattern).test(wert) ? '' : (feld.patternMessage || 'Format stimmt nicht.');
  }

  function meldungen(feld) {
    var liste = [];
    var musterFehler = pruefeMuster(feld);
    if (musterFehler) { liste.push(musterFehler); }

    (feld.checks || []).forEach(function (pruefung) {
      if (pruefung === 'personalEmail') {
        var mail = (zustand[feld.key] || '').trim();
        if (mail && /^[^@\s.]+[._-][^@\s.]+@/.test(mail)) {
          liste.push('Diese Adresse sieht personenbezogen aus. Möglich, aber bitte prüfen — vorgesehen ist eine funktionsbezogene Adresse.');
        }
      }
    });
    return liste;
  }

  function aktualisiereEintragsFehler(feld) {
    var behaelter = knoten[feld.key].eintraege;
    if (!behaelter) { return; }
    Array.prototype.forEach.call(behaelter.children, function (box, index) {
      var eintrag = zustand[feld.key][index];
      var fehlerKnoten = box.querySelector('.feld-fehler');
      if (!eintrag || !fehlerKnoten) { return; }

      var zusammenfassung = box.querySelector('.eintrag-zusammenfassung');
      if (zusammenfassung) {
        zusammenfassung.textContent = eintragsZusammenfassung(feld, eintrag);
      }

      var texte = [];

      feld.subfields.forEach(function (teil) {
        var wert = (eintrag[teil.key] || '').trim();
        if (teil.pattern && wert && !new RegExp(teil.pattern).test(wert)) {
          texte.push(teil.label + ': ' + (teil.patternMessage || 'Format stimmt nicht.'));
        }
      });

      if ((feld.checks || []).indexOf('areaKeys') !== -1) {
        var schluessel = (eintrag.key || '').trim();
        if (/^\d{2}$/.test(schluessel)) {
          var bekannt = VOK.bundeslaender.some(function (land) { return land.value === schluessel; });
          if (!bekannt) {
            texte.push('Zweistelliger Schlüssel „' + schluessel + '“ ist kein Bundesland.');
          }
        }
      }

      fehlerKnoten.textContent = texte.join(' ');
    });
  }

  /* ----------------------------------------------------- Aktualisierungen */

  function aktualisiereCheckboxen(feld) {
    var werte = zustand[feld.key];
    zeigeVeralteteWerte(feld);
    var grenzeErreicht = !!feld.max && werte.length >= feld.max;
    knoten[feld.key].kaestchen.forEach(function (eintrag) {
      eintrag.box.checked = werte.indexOf(eintrag.value) !== -1;
      var sperren = grenzeErreicht && !eintrag.box.checked;
      eintrag.box.disabled = sperren;
      eintrag.huelle.classList.toggle('gesperrt', sperren);
    });
    var text = werte.length + ' gewählt';
    if (feld.max) { text += ' · höchstens ' + feld.max; }
    if (feld.min) { text += ' · mindestens ' + feld.min; }
    knoten[feld.key].zaehler.textContent = text;
  }

  /*
   * Ein Begriff, der im Vokabular auf deprecated gesetzt wurde, erscheint
   * nicht mehr in der Auswahl. Steht er aber bereits in einem Datensatz,
   * wird er weiter angezeigt — ausgegraut und benannt. Andernfalls fiele
   * er stillschweigend aus dem Datensatz, ohne dass es jemand bemerkt.
   */
  function zeigeVeralteteWerte(feld) {
    var ref = knoten[feld.key];
    if (!ref || !feld.vokabular) { return; }
    var behaelter = ref.veraltet;
    if (!behaelter) { return; }

    var sichtbare = {};
    (feld.options || []).forEach(function (o) { sichtbare[o.value] = true; });
    var veraltete = (zustand[feld.key] || []).filter(function (wert) {
      return !sichtbare[wert];
    });

    behaelter.textContent = '';
    behaelter.hidden = !veraltete.length;
    if (!veraltete.length) { return; }

    veraltete.forEach(function (wert) {
      var begriff = window.EduVocab.begriff(feld.vokabular, wert);
      var text = (begriff ? begriff.label : wert) + ' — nicht mehr im Vokabular';
      if (begriff && begriff.ersetztDurch) {
        text += ', ersetzt durch ' + window.EduVocab.beschriftung(feld.vokabular, begriff.ersetztDurch);
      }
      var zeile = el('li', {}, [
        el('span', { class: 'veraltet-wert', text: text })
      ]);
      var entfernen = el('button', { type: 'button', class: 'leise', text: 'Entfernen' });
      entfernen.addEventListener('click', function () {
        var pos = zustand[feld.key].indexOf(wert);
        if (pos !== -1) { zustand[feld.key].splice(pos, 1); }
        aktualisiere();
      });
      zeile.appendChild(entfernen);
      behaelter.appendChild(zeile);
    });
  }

  function aktualisiereAbgeleiteteAuswahl(feld) {
    var quelle = null;
    alleFelder().forEach(function (kandidat) {
      if (kandidat.key === feld.optionsFrom) { quelle = kandidat; }
    });
    if (!quelle) { return; }

    var gewaehlt = zustand[feld.optionsFrom] || [];
    var eingabe = knoten[feld.key].eingabe;
    var bisher = zustand[feld.key];

    eingabe.textContent = '';
    eingabe.appendChild(el('option', { value: '', text: '— bitte wählen —' }));
    gewaehlt.forEach(function (wert) {
      eingabe.appendChild(el('option', { value: wert, text: beschriftung(quelle.options, wert) }));
    });

    if (gewaehlt.indexOf(bisher) === -1) { zustand[feld.key] = ''; }
    eingabe.value = zustand[feld.key];
    eingabe.disabled = gewaehlt.length === 0;
    knoten[feld.key].fehler.textContent = gewaehlt.length === 0 ? (feld.emptyHint || '') : '';
  }

  function aktiveBundeslaender() {
    var gefunden = [];
    (zustand.areasOfActivity || []).forEach(function (eintrag) {
      var schluessel = (eintrag.key || '').trim();
      if (!/^(\d{2}|\d{5}|\d{8}|\d{12})$/.test(schluessel)) { return; }
      var praefix = schluessel.slice(0, 2);
      VOK.bundeslaender.forEach(function (land) {
        if (land.value === praefix && gefunden.indexOf(land) === -1) { gefunden.push(land); }
      });
    });
    gefunden.sort(function (a, b) { return a.value < b.value ? -1 : 1; });
    return gefunden;
  }

  function aktualisiereChips(feld) {
    var sichtbar = gebieteWerdenErfasst();
    var laender = sichtbar ? aktiveBundeslaender() : [];
    zustand[feld.key] = laender.map(function (land) {
      return { key: land.value, label: land.label };
    });
    var chips = knoten[feld.key].chips;
    chips.textContent = '';
    laender.forEach(function (land) {
      chips.appendChild(el('li', { class: 'chip', text: land.value + ' ' + land.label }));
    });
    knoten[feld.key].leerHinweis.hidden = laender.length > 0;
  }

  function gebieteWerdenErfasst() {
    return VOK.reichweitenMitGebieten.indexOf(zustand.scope) !== -1;
  }

  function aktualisiereRegistergruppe(feld) {
    var sichtbar = istSichtbar(feld);
    knoten[feld.key].wrapper.hidden = !sichtbar;
    if (!sichtbar) {
      // Rechtsform ohne Registerpflicht: Gruppe leeren, damit Anzeige und
      // Datensatz nicht auseinanderlaufen.
      zustand[feld.key] = {};
      feld.subfields.forEach(function (teil) {
        var eingabe = knoten[feld.key][teil.key];
        if (eingabe) { eingabe.value = ''; }
      });
      return;
    }
    var art = feld.derivedFrom.map[zustand[feld.derivedFrom.field]] || '';
    zustand[feld.key][feld.derivedFrom.target] = art;
    var artFeld = knoten[feld.key][feld.derivedFrom.target];
    if (artFeld) { artFeld.value = art; }

    // In die Eingabefelder wird hier nicht zurueckgeschrieben: das Feld selbst
    // fuehrt seinen Anzeigewert, der Zustand folgt ihm. Ein Rueckschreiben
    // wuerde beim Tippen Leerzeichen und Cursorposition zerstoeren.
    var texte = [];
    feld.subfields.forEach(function (teil) {
      var wert = (zustand[feld.key][teil.key] || '').trim();
      if (teil.requiredInGroup && !wert) {
        var etwasAusgefuellt = feld.subfields.some(function (anderes) {
          return !anderes.derived && !anderes.requiredInGroup && (zustand[feld.key][anderes.key] || '').trim() !== '';
        });
        if (etwasAusgefuellt) {
          texte.push(teil.label + ' ist innerhalb dieser Gruppe erforderlich.');
        }
      }
    });
    knoten[feld.key].fehler.textContent = texte.join(' ');
  }

  /* ------------------------------------------------------------ Warnungen */

  function warnKnoten(titel, text, knopfText, beiKlick) {
    var kinder = [
      el('span', { class: 'warnung-titel', text: titel }),
      document.createTextNode(text)
    ];
    var box = el('div', { class: 'warnung' }, kinder);
    if (knopfText) {
      var knopf = el('button', { type: 'button', class: 'leise', text: knopfText });
      knopf.addEventListener('click', beiKlick);
      box.appendChild(el('div', {}, [knopf]));
    }
    return box;
  }

  function aktualisiereGebietsWarnungen(feld) {
    var behaelter = knoten[feld.key].warnungen;
    var erfasst = gebieteWerdenErfasst();
    var eintraegeVorhanden = zustand[feld.key].some(function (eintrag) {
      return (eintrag.key || '').trim() !== '' || (eintrag.label || '').trim() !== '';
    });

    behaelter.textContent = '';
    knoten[feld.key].eintraege.hidden = !erfasst;
    knoten[feld.key].hinzuKnopf.hidden = !erfasst;
    knoten[feld.key].leerHinweis.hidden = !erfasst || zustand[feld.key].length > 0;

    if (!erfasst) {
      // Ohne Gebietserfassung und ohne Eintraege entfaellt das Feld ganz.
      knoten[feld.key].wrapper.hidden = !eintraegeVorhanden;
      if (eintraegeVorhanden) {
        behaelter.appendChild(warnKnoten(
          'Gebietsliste wird bei dieser Reichweite nicht erfasst.',
          ' Die vorhandenen Einträge gehen nicht in den Datensatz ein. Bei „lokal“, „regional“ oder „landesweit“ erscheinen sie wieder.',
          'Einträge verwerfen',
          function () {
            zustand[feld.key] = [neuerEintrag(feld)];
            zeichneEintraege(feld, false);
            aktualisiere();
          }
        ));
      }
      return;
    }

    knoten[feld.key].wrapper.hidden = false;
    if ((zustand.scope === 'local' || zustand.scope === 'regional') && !eintraegeVorhanden) {
      behaelter.appendChild(warnKnoten(
        'Noch kein Wirkungsgebiet erfasst.',
        ' Bei lokaler und regionaler Reichweite gehört mindestens ein Gebiet dazu — sonst bleibt unklar, wo gewirkt wird.'
      ));
    }
  }

  function aktualisiereAdressWarnungen(feld) {
    var behaelter = knoten[feld.key].warnungen;
    behaelter.textContent = '';
    var sitze = zustand[feld.key].filter(function (eintrag) { return eintrag.type === 'headquarters'; });
    var befuellt = zustand[feld.key].filter(function (eintrag) {
      return (eintrag.postalCode || '').trim() !== '' || (eintrag.addressLocality || '').trim() !== '';
    });
    knoten[feld.key].leerHinweis.hidden = zustand[feld.key].length > 0;

    if (sitze.length > 1) {
      behaelter.appendChild(warnKnoten(
        'Mehr als ein Standort ist als „Sitz“ gekennzeichnet.',
        ' Vorgesehen ist genau ein Sitz; weitere Standorte bitte als „weiterer Standort“ führen.'
      ));
    }
    if (befuellt.length > 0 && sitze.length === 0) {
      behaelter.appendChild(warnKnoten(
        'Kein Standort ist als „Sitz“ gekennzeichnet.',
        ' Genau ein Eintrag sollte der Sitz der Organisation sein.'
      ));
    }
  }

  /* ------------------------------------------------------- Datensatz/JSON */

  function eintragIstBefuellt(feld, eintrag) {
    return feld.subfields.some(function (teil) {
      if (teil.type === 'select') { return false; }
      return (eintrag[teil.key] || '').trim() !== '';
    });
  }

  // Herkunft eines Eintrags oder Feldes in die JSON-Form bringen. Ohne
  // gewaehlte Quelle entsteht kein Block — leere Angaben bleiben ausgelassen.
  function herkunftJson(traeger) {
    if (!traeger || !traeger.quelle) { return null; }
    var block = { quelle: traeger.quelle, erfasstAm: heute() };
    if (traeger.quelle !== 'selbstauskunft' && (traeger.quellenUrl || '').trim()) {
      block.quellenUrl = traeger.quellenUrl.trim();
    }
    return block;
  }

  function saubereEintraege(feld) {
    var ergebnis = [];
    zustand[feld.key].forEach(function (eintrag) {
      if (!eintragIstBefuellt(feld, eintrag)) { return; }
      var sauber = {};
      feld.subfields.forEach(function (teil) {
        var wert = (eintrag[teil.key] || '').trim();
        if (wert !== '') { sauber[teil.key] = wert; }
      });
      if (feld.stampToday) { sauber[feld.stampToday] = heute(); }
      var hk = herkunftJson(eintrag._herkunft);
      if (hk) { sauber.provenance = hk; }
      ergebnis.push(sauber);
    });
    return ergebnis;
  }

  function baueDatensatz() {
    var datensatz = {};
    alleFelder().forEach(function (feld) {
      if (!istSichtbar(feld)) { return; }
      var wert;
      switch (feld.type) {
        case 'repeatable':
          wert = saubereEintraege(feld);
          break;
        case 'conditionalGroup':
          wert = {};
          feld.subfields.forEach(function (teil) {
            var teilwert = (zustand[feld.key][teil.key] || '').trim();
            if (teilwert !== '') { wert[teil.key] = teilwert; }
          });
          // Die abgeleitete Registerart allein ist noch keine Angabe.
          if (Object.keys(wert).length === 1 && wert[feld.derivedFrom.target]) { wert = {}; }
          break;
        case 'radioWithVisibility':
          wert = zustand[feld.key].value
            ? { value: zustand[feld.key].value, visibility: zustand[feld.key].visibility }
            : {};
          break;
        case 'computedChips':
          wert = zustand[feld.key];
          break;
        case 'checkboxes':
          wert = zustand[feld.key].slice();
          break;
        default:
          wert = (zustand[feld.key] || '').toString().trim();
      }
      if (leer(wert)) { return; }

      // Traegt das Feld eine Herkunftsangabe, wird aus dem Wert ein Objekt.
      var hk = feld.provenance ? herkunftJson(herkunft[feld.key]) : null;
      datensatz[feld.key] = hk ? { value: wert, provenance: hk } : wert;
    });

    var abgeleitet = leiteAb(datensatz);
    if (abgeleitet) { datensatz.derived = abgeleitet; }
    return datensatz;
  }

  /* ------------------------------------------------------- Ableitungen */

  /*
   * Aggregation der Handlungsfelder. Sie wird nicht erfasst, sondern aus
   * den angekreuzten Feldern berechnet — analog zu "Aktiv in (Bundesland)".
   * Genau das ist der Punkt der Zweistufigkeit: bildungsspezifisch ankreuzen,
   * sektorstatistisch vergleichbar herausgeben.
   */
  function leiteAb(datensatz) {
    var felder = datensatz.fieldsOfAction || [];
    if (!felder.length) { return null; }

    var cw = window.EduVocab.vokabular('crosswalks');
    if (!cw) { return null; }

    var ziviz = [], icnpo = [];
    felder.forEach(function (key) {
      cw.concepts.forEach(function (c) {
        if (c.handlungsfeld !== key) { return; }
        if (c.zivizFeld && ziviz.indexOf(c.zivizFeld) === -1) { ziviz.push(c.zivizFeld); }
        var gruppe = c.icnpoUntergruppe || c.icnpoGruppe;
        if (gruppe && icnpo.indexOf(gruppe) === -1) { icnpo.push(gruppe); }
      });
    });
    if (!ziviz.length && !icnpo.length) { return null; }

    return {
      zivizFields: ziviz,
      icnpoGroups: icnpo,
      dataTheme: cw.dataTheme || 'EDUC'
    };
  }

  function faerbeJson(text) {
    var escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return escaped.replace(
      /("(?:\\u[0-9a-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)/g,
      function (treffer) {
        var klasse = 'j-zahl';
        if (/^"/.test(treffer)) {
          klasse = /:\s*$/.test(treffer) ? 'j-schluessel' : 'j-text';
        } else if (/^(true|false|null)$/.test(treffer)) {
          klasse = 'j-literal';
        }
        return '<span class="' + klasse + '">' + treffer + '</span>';
      }
    );
  }

  var letzterJsonText = '{}';
  var aktivesFeld = '';

  // Baut dieselbe Ausgabe wie JSON.stringify(datensatz, null, 2), umschliesst
  // aber jeden Eintrag der obersten Ebene, damit das gerade bearbeitete Feld
  // hervorgehoben werden kann.
  function vorschauHtml(datensatz) {
    var schluessel = Object.keys(datensatz);
    if (!schluessel.length) { return '{}'; }
    // Die Blockelemente erzeugen die Zeilenumbrueche selbst; zusaetzliche
    // Trennzeichen wuerden Leerzeilen ergeben.
    var zeilen = schluessel.map(function (name, index) {
      var wert = JSON.stringify(datensatz[name], null, 2).split('\n').join('\n  ');
      var text = '  ' + JSON.stringify(name) + ': ' + wert + (index < schluessel.length - 1 ? ',' : '');
      return '<span class="j-block" data-schluessel="' + name + '">' + faerbeJson(text) + '</span>';
    });
    return '{' + zeilen.join('') + '}';
  }

  function aktualisiereVorschau() {
    var datensatz = baueDatensatz();
    letzterJsonText = JSON.stringify(datensatz, null, 2);
    document.getElementById('json-vorschau').innerHTML = vorschauHtml(datensatz);
    hebeFeldHervor();
  }

  /* --------------------------------------------- Hervorhebung in der Vorschau */

  function feldLabel(schluessel) {
    var gefunden = '';
    alleFelder().forEach(function (feld) {
      if (feld.key === schluessel) { gefunden = feld.label; }
    });
    return gefunden;
  }

  function hebeFeldHervor() {
    var vorschau = document.getElementById('json-vorschau');
    var hinweis = document.getElementById('vorschau-fokus');
    Array.prototype.forEach.call(vorschau.querySelectorAll('.j-block'), function (block) {
      block.classList.remove('hervorgehoben');
    });
    if (!aktivesFeld) { hinweis.textContent = ''; return; }

    var ziel = vorschau.querySelector('.j-block[data-schluessel="' + aktivesFeld + '"]');
    if (!ziel) {
      hinweis.textContent = feldLabel(aktivesFeld) + ' — noch leer, erscheint mit der ersten Eingabe.';
      return;
    }
    ziel.classList.add('hervorgehoben');
    hinweis.textContent = feldLabel(aktivesFeld) + ' — im Datensatz als „' + aktivesFeld + '“.';

    // Innerhalb der Vorschau scrollen, nie die Seite bewegen.
    var oben = ziel.offsetTop - vorschau.offsetTop;
    var unten = oben + ziel.offsetHeight;
    if (oben < vorschau.scrollTop) {
      vorschau.scrollTop = Math.max(0, oben - 8);
    } else if (unten > vorschau.scrollTop + vorschau.clientHeight) {
      vorschau.scrollTop = unten - vorschau.clientHeight + 8;
    }
  }

  function setzeAktivesFeld(schluessel) {
    if (aktivesFeld === schluessel) { return; }
    aktivesFeld = schluessel || '';
    hebeFeldHervor();
  }

  /* ------------------------------------------------------ Pflichtfeldzähler */

  function pflichtfelder() {
    return alleFelder().filter(function (feld) { return feld.requirement === 'P'; });
  }

  function pflichtfeldErfuellt(feld) {
    var wert = zustand[feld.key];
    if (feld.type === 'checkboxes') {
      return wert.length >= (feld.min || 1);
    }
    return !leer((wert || '').toString().trim());
  }

  function aktualisiereZaehler() {
    var felder = pflichtfelder();
    var erfuellt = felder.filter(pflichtfeldErfuellt);
    var offen = felder.filter(function (feld) { return !pflichtfeldErfuellt(feld); });

    document.getElementById('zaehler-wert').textContent =
      erfuellt.length + ' von ' + felder.length + ' Pflichtfeldern ausgefüllt';
    document.getElementById('zaehler-balken').style.width =
      Math.round((erfuellt.length / felder.length) * 100) + '%';
    document.getElementById('zaehler-offen').textContent = offen.length
      ? 'Offen: ' + offen.map(function (feld) { return feld.label; }).join(', ')
      : 'Alle Pflichtfelder sind ausgefüllt.';
  }

  /* -------------------------------------------------------- Aktualisieren */

  function aktualisiere() {
    alleFelder().forEach(function (feld) {
      var ref = knoten[feld.key];
      if (!ref) { return; }

      if (feld.type === 'conditionalGroup') {
        aktualisiereRegistergruppe(feld);
        return;
      }

      if (feld.visibleWhen && feld.type !== 'repeatable') {
        ref.wrapper.hidden = !istSichtbar(feld);
      }

      switch (feld.type) {
        case 'checkboxes':
          aktualisiereCheckboxen(feld);
          break;
        case 'derivedSelect':
          aktualisiereAbgeleiteteAuswahl(feld);
          break;
        case 'computedChips':
          aktualisiereChips(feld);
          break;
        case 'repeatable':
          aktualisiereEintragsFehler(feld);
          if (feld.key === 'areasOfActivity') { aktualisiereGebietsWarnungen(feld); }
          if (feld.key === 'addresses') { aktualisiereAdressWarnungen(feld); }
          // Die Rueckgaengig-Zeile baut merkeEntfernung auf; hier wird sie nur
          // abgeraeumt, sobald sie nicht mehr gilt — das erhaelt den Fokus.
          if (ref.rueckgaengig && !ref.rueckgaengig.hidden &&
              (!letzteEntfernung || letzteEntfernung.feldKey !== feld.key)) {
            ref.rueckgaengig.hidden = true;
            ref.rueckgaengig.textContent = '';
          }
          break;
        case 'textarea':
          aktualisiereZeichenzaehler(feld);
          break;
        default:
          break;
      }

      if (ref.fehler && feld.type !== 'derivedSelect' && feld.type !== 'repeatable') {
        var texte = meldungen(feld);
        ref.fehler.textContent = texte.join(' ');
        if (ref.eingabe) {
          ref.eingabe.classList.toggle('fehlerhaft', pruefeMuster(feld) !== '');
        }
      }

      if (feld.type === 'wikidata' && ref.gewaehlt && !wikidataAus) {
        ref.gewaehlt.textContent = ref.label ? 'Gewählt: ' + ref.label : '';
      }
    });

    aktualisiereZaehler();
    aktualisiereNavigation();
    aktualisiereVorschau();
    speichere();
  }

  function aktualisiereZeichenzaehler(feld) {
    var laenge = (zustand[feld.key] || '').length;
    var text = laenge + ' Zeichen · Richtwert ' + feld.softMin + '–' + feld.softMax +
      ' · Maximum ' + feld.hardMax;
    if (laenge > 0 && laenge < feld.softMin) { text += ' · noch unter dem Richtwert'; }
    if (laenge > feld.softMax) { text += ' · über dem Richtwert'; }
    knoten[feld.key].zaehler.textContent = text;
  }

  /* ----------------------------------------------------------------- Timer */

  var timerLaeuft = false;
  var timerStart = null;
  var timerTakt = null;

  function starteTimer() {
    if (timerLaeuft) { return; }
    timerLaeuft = true;
    timerStart = Date.now();
    timerTakt = window.setInterval(function () {
      var sekunden = Math.floor((Date.now() - timerStart) / 1000);
      var mm = String(Math.floor(sekunden / 60)).padStart(2, '0');
      var ss = String(sekunden % 60).padStart(2, '0');
      document.getElementById('timer-wert').textContent = mm + ':' + ss;
    }, 1000);
    document.getElementById('timer-hinweis').textContent = 'läuft seit der ersten Eingabe';
  }

  // Beispieldaten und Zuruecksetzen sind keine manuelle Eingabe: der Timer
  // misst die Zehn-Minuten-Frage und beginnt dafuer wieder bei null.
  function setzeTimerZurueck() {
    if (timerTakt) { window.clearInterval(timerTakt); timerTakt = null; }
    timerLaeuft = false;
    timerStart = null;
    document.getElementById('timer-wert').textContent = '00:00';
    document.getElementById('timer-hinweis').textContent = 'startet bei der ersten Eingabe';
  }

  /* -------------------------------------------------------------- Kopieren */

  function kopiereJson() {
    var rueckmeldung = document.getElementById('kopier-rueckmeldung');

    function melde(text) {
      rueckmeldung.textContent = text;
      window.setTimeout(function () { rueckmeldung.textContent = ''; }, 4000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(letzterJsonText)
        .then(function () { melde('In die Zwischenablage kopiert.'); })
        .catch(function () { kopiereUeberFeld(melde); });
      return;
    }
    kopiereUeberFeld(melde);
  }

  function kopiereUeberFeld(melde) {
    var hilfsfeld = document.createElement('textarea');
    hilfsfeld.value = letzterJsonText;
    hilfsfeld.setAttribute('readonly', '');
    hilfsfeld.style.position = 'fixed';
    hilfsfeld.style.top = '-1000px';
    document.body.appendChild(hilfsfeld);
    hilfsfeld.select();
    var geglueckt = false;
    try { geglueckt = document.execCommand('copy'); } catch (fehler) { geglueckt = false; }
    document.body.removeChild(hilfsfeld);
    melde(geglueckt ? 'In die Zwischenablage kopiert.' : 'Kopieren nicht möglich — bitte manuell markieren.');
  }

  /* ------------------------------------------- Werte ins Formular schreiben */

  // Gegenrichtung zum Tippen: schreibt den Zustand in die Eingabefelder.
  // Wird nur bei Beispieldaten, Zuruecksetzen und beim Laden eines
  // Zwischenstands aufgerufen, nie waehrend einer laufenden Eingabe.
  function zeichneWerte() {
    // Die Herkunftsblöcke werden beim Neuzeichnen der Einträge mitgebaut;
    // für die einfachen Felder genügt es, den Zweig zu leeren.
    alleFelder().forEach(function (feld) {
      var ref = knoten[feld.key];
      if (!ref) { return; }
      switch (feld.type) {
        case 'repeatable':
          zeichneEintraege(feld, false);
          break;
        case 'conditionalGroup':
          feld.subfields.forEach(function (teil) {
            if (ref[teil.key]) { ref[teil.key].value = zustand[feld.key][teil.key] || ''; }
          });
          break;
        case 'radioWithVisibility':
          ref.wrapper.querySelectorAll('input[type="radio"]').forEach(function (radio) {
            var istSicht = radio.name.indexOf('-sicht') !== -1;
            radio.checked = radio.value === (istSicht ? zustand[feld.key].visibility : zustand[feld.key].value);
          });
          break;
        case 'checkboxes':
        case 'computedChips':
        case 'derivedSelect':
          break; // werden von aktualisiere() aus dem Zustand nachgezogen
        default:
          if (ref.eingabe) { ref.eingabe.value = zustand[feld.key] || ''; }
          // Die gemerkte Wikidata-Beschriftung gehoert zum alten Wert.
          if (feld.type === 'wikidata') { ref.label = ''; }
      }
    });
  }

  /* ------------------------------------------------------------ Beispieldaten */

  function uebernehmeBeispiel(beispiel) {
    initZustand();
    Object.keys(beispiel.data).forEach(function (schluessel) {
      var wert = beispiel.data[schluessel];
      // Tiefe Kopie, damit das Beispiel beim Bearbeiten unveraendert bleibt.
      zustand[schluessel] = JSON.parse(JSON.stringify(wert));
    });
    nachSprung(beispiel.label + ' eingefügt. Timer zurückgesetzt.');
  }

  function leereFormular() {
    initZustand();
    nachSprung('Formular geleert.');
  }

  function nachSprung(meldung) {
    letzteEntfernung = null;
    zeichneWerte();
    setzeTimerZurueck();
    aktualisiere();
    document.getElementById('beispiel-rueckmeldung').textContent = meldung;
    window.setTimeout(function () {
      var knoten = document.getElementById('beispiel-rueckmeldung');
      if (knoten.textContent === meldung) { knoten.textContent = ''; }
    }, 6000);
  }

  function baueBeispielKnoepfe() {
    var liste = document.getElementById('beispiel-liste');
    (window.EduStandard.beispiele || []).forEach(function (beispiel) {
      var knopf = el('button', { type: 'button', class: 'leise beispiel-knopf' }, [
        el('span', { class: 'beispiel-name', text: beispiel.label }),
        el('span', { class: 'beispiel-summary', text: beispiel.summary })
      ]);
      knopf.addEventListener('click', function () {
        uebernehmeBeispiel(beispiel);
        document.getElementById('beispiel-auswahl').open = false;
      });
      liste.appendChild(el('li', {}, [knopf]));
    });
  }

  /* --------------------------------------------- Zwischenspeicher im Browser */

  var SPEICHER_SCHLUESSEL = 'edustandard.akteursprofil.v0';
  var speicherVerfuegbar = true;

  function speichere() {
    if (!speicherVerfuegbar) { return; }
    try {
      window.localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(zustand));
    } catch (fehler) {
      // Privates Fenster, gesperrte Website-Daten, file:// mit strenger
      // Richtlinie: die Maske funktioniert ohne Zwischenspeicher weiter.
      speicherVerfuegbar = false;
      setzeSpeicherHinweis('Zwischenspeichern in diesem Browser nicht möglich — die Eingaben gehen beim Neuladen verloren.');
    }
  }

  function ladeZwischenstand() {
    var roh;
    try {
      roh = window.localStorage.getItem(SPEICHER_SCHLUESSEL);
    } catch (fehler) {
      speicherVerfuegbar = false;
      return false;
    }
    if (!roh) { return false; }

    var gespeichert;
    try { gespeichert = JSON.parse(roh); } catch (fehler) { return false; }
    if (!gespeichert || typeof gespeichert !== 'object') { return false; }

    // Defensiv zusammenfuehren: Ein Zwischenstand kann aus einer Fassung des
    // Feldmodells stammen, die Felder kannte, die es nicht mehr gibt.
    var frisch = JSON.parse(JSON.stringify(zustand));
    alleFelder().forEach(function (feld) {
      if (!Object.prototype.hasOwnProperty.call(gespeichert, feld.key)) { return; }
      var wert = gespeichert[feld.key];
      var passt =
        (feld.type === 'checkboxes' || feld.type === 'repeatable' || feld.type === 'computedChips')
          ? Array.isArray(wert)
          : (feld.type === 'conditionalGroup' || feld.type === 'radioWithVisibility')
            ? (wert && typeof wert === 'object' && !Array.isArray(wert))
            : typeof wert === 'string';
      if (!passt) { return; }
      zustand[feld.key] = wert;
    });

    // Ein Zwischenstand, der sich nur in der vergebenen ID vom frischen
    // Formular unterscheidet, ist nichts, worauf hinzuweisen waere.
    var nennenswert = alleFelder().some(function (feld) {
      if (feld.type === 'uuid') { return false; }
      return JSON.stringify(zustand[feld.key]) !== JSON.stringify(frisch[feld.key]);
    });
    return nennenswert;
  }

  function setzeSpeicherHinweis(text) {
    var knoten = document.getElementById('speicher-hinweis');
    if (knoten) { knoten.textContent = text; }
  }

  function verwirfZwischenstand() {
    try { window.localStorage.removeItem(SPEICHER_SCHLUESSEL); } catch (fehler) { /* still */ }
    leereFormular();
    setzeSpeicherHinweis('');
    document.getElementById('speicher-verwerfen').hidden = true;
  }

  /* ------------------------------------------------- Abschnittsnavigation */

  function baueNavigation() {
    var liste = document.getElementById('abschnitt-navigation');
    MODELL.blocks.forEach(function (block) {
      var verweis = el('a', { href: '#abschnitt-' + block.id, class: 'nav-verweis' }, [
        el('span', { class: 'nav-titel', text: block.title }),
        el('span', { class: 'nav-stand', id: 'nav-stand-' + block.id })
      ]);
      liste.appendChild(el('li', {}, [verweis]));
      navVerweise[block.id] = verweis;
    });

    if (!window.IntersectionObserver) { return; }
    var beobachter = new window.IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (eintrag) {
        if (!eintrag.isIntersecting) { return; }
        var id = eintrag.target.getAttribute('data-block');
        Object.keys(navVerweise).forEach(function (schluessel) {
          var aktiv = schluessel === id;
          navVerweise[schluessel].classList.toggle('aktiv', aktiv);
          if (aktiv) {
            navVerweise[schluessel].setAttribute('aria-current', 'true');
          } else {
            navVerweise[schluessel].removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    MODELL.blocks.forEach(function (block) {
      var abschnitt = document.getElementById('abschnitt-' + block.id);
      if (abschnitt) { beobachter.observe(abschnitt); }
    });
  }

  var navVerweise = {};

  function feldIstBefuellt(feld) {
    var wert = zustand[feld.key];
    if (feld.type === 'radioWithVisibility') { return !!wert.value; }
    if (feld.type === 'conditionalGroup') {
      return feld.subfields.some(function (teil) {
        return !teil.derived && (wert[teil.key] || '').trim() !== '';
      });
    }
    if (feld.type === 'repeatable') {
      return wert.some(function (eintrag) { return eintragIstBefuellt(feld, eintrag); });
    }
    if (Array.isArray(wert)) { return wert.length > 0; }
    return (wert || '').toString().trim() !== '';
  }

  function aktualisiereNavigation() {
    MODELL.blocks.forEach(function (block) {
      var sichtbare = block.fields.filter(istSichtbar);
      var befuellte = sichtbare.filter(feldIstBefuellt);
      var stand = document.getElementById('nav-stand-' + block.id);
      if (stand) {
        stand.textContent = befuellte.length + ' von ' + sichtbare.length + ' Feldern befüllt';
      }
    });
  }

  /* ------------------------------------------------------------------ Start */

  function start() {
    initZustand();
    zeichneFormular();
    baueNavigation();
    baueBeispielKnoepfe();

    var formular = document.getElementById('formular');
    formular.addEventListener('input', starteTimer, true);
    formular.addEventListener('change', starteTimer, true);

    // Das gerade bearbeitete Feld in der JSON-Vorschau hervorheben.
    formular.addEventListener('focusin', function (ereignis) {
      var feldKnoten = ereignis.target.closest('.feld');
      setzeAktivesFeld(feldKnoten ? feldKnoten.getAttribute('data-feld') : '');
    });
    formular.addEventListener('focusout', function () {
      window.setTimeout(function () {
        if (!formular.contains(document.activeElement)) { setzeAktivesFeld(''); }
      }, 0);
    });

    document.getElementById('json-kopieren').addEventListener('click', kopiereJson);
    document.getElementById('formular-leeren').addEventListener('click', leereFormular);
    document.getElementById('speicher-verwerfen').addEventListener('click', verwirfZwischenstand);
    document.getElementById('modell-version').textContent = MODELL.version;

    var wiederhergestellt = ladeZwischenstand();
    if (wiederhergestellt) {
      zeichneWerte();
      setzeSpeicherHinweis('Zwischenstand aus diesem Browser geladen.');
      document.getElementById('speicher-verwerfen').hidden = false;
    } else if (!speicherVerfuegbar) {
      setzeSpeicherHinweis('Zwischenspeichern in diesem Browser nicht möglich — die Eingaben gehen beim Neuladen verloren.');
    }

    aktualisiere();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
