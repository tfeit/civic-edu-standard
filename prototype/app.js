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
    return eintrag;
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
      var wrapper = feldRahmen(feld, eingabe);
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
      var beschriftungsKnoten = el('label', { class: 'option', for: boxId }, [
        box,
        el('span', { text: option.label })
      ]);
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
    var huelle = el('div', {}, [liste, zaehler]);
    var wrapper = feldRahmen(feld, huelle, { gruppenLabel: true });
    liste.setAttribute('aria-describedby', knoten[feld.key].beschrieben);
    knoten[feld.key].kaestchen = kaestchen;
    knoten[feld.key].zaehler = zaehler;
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
    var leerHinweis = el('p', { class: 'leer-hinweis', text: 'Noch kein Eintrag.' });
    var hinzu = el('button', { type: 'button', class: 'leise', text: '+ ' + feld.addLabel });
    var warnungen = el('div', {});

    hinzu.addEventListener('click', function () {
      zustand[feld.key].push(neuerEintrag(feld));
      zeichneEintraege(feld, true);
      aktualisiere();
    });

    var huelle = el('div', {}, [eintraege, leerHinweis, hinzu, warnungen]);
    var wrapper = feldRahmen(feld, huelle, { gruppenLabel: true });

    knoten[feld.key].eintraege = eintraege;
    knoten[feld.key].leerHinweis = leerHinweis;
    knoten[feld.key].warnungen = warnungen;
    knoten[feld.key].hinzuKnopf = hinzu;
    zeichneEintraege(feld, false);
    return wrapper;
  };

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
        zustand[feld.key].splice(index, 1);
        zeichneEintraege(feld, false);
        aktualisiere();
      });

      var kopf = el('div', { class: 'eintrag-kopf' }, [
        el('span', { class: 'eintrag-nummer', text: feld.entryLabel + ' ' + (index + 1) }),
        entfernen
      ]);

      var fehler = el('p', { class: 'feld-fehler', role: 'status' });
      behaelter.appendChild(el('div', { class: 'eintrag' }, [kopf, raster, fehler]));
    });

    if (fokusLetzten) {
      var letzter = behaelter.lastElementChild;
      if (letzter) {
        var ziel = letzter.querySelector('input, select');
        if (ziel) { ziel.focus(); }
      }
    }
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
        '&language=de&uselang=de&type=item&format=json&origin=*';
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
        return;
      }
      liste.slice(0, 8).forEach(function (eintrag) {
        var knopf = el('button', { type: 'button' }, [
          el('span', { class: 'treffer-label' }, [
            document.createTextNode(eintrag.label || eintrag.id),
            el('span', { class: 'treffer-qid', text: ' · ' + eintrag.id })
          ]),
          el('span', { class: 'treffer-beschreibung', text: eintrag.description || 'ohne Beschreibung' })
        ]);
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
      var abschnitt = el('fieldset', { class: 'abschnitt' }, [
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
      if (!leer(wert)) { datensatz[feld.key] = wert; }
    });
    return datensatz;
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

  function aktualisiereVorschau() {
    letzterJsonText = JSON.stringify(baueDatensatz(), null, 2);
    document.getElementById('json-vorschau').innerHTML = faerbeJson(letzterJsonText);
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
    aktualisiereVorschau();
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

  function starteTimer() {
    if (timerLaeuft) { return; }
    timerLaeuft = true;
    timerStart = Date.now();
    window.setInterval(function () {
      var sekunden = Math.floor((Date.now() - timerStart) / 1000);
      var mm = String(Math.floor(sekunden / 60)).padStart(2, '0');
      var ss = String(sekunden % 60).padStart(2, '0');
      document.getElementById('timer-wert').textContent = mm + ':' + ss;
    }, 1000);
    document.getElementById('timer-hinweis').textContent = 'läuft seit der ersten Eingabe';
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

  /* ------------------------------------------------------------------ Start */

  function start() {
    initZustand();
    zeichneFormular();

    var formular = document.getElementById('formular');
    formular.addEventListener('input', starteTimer, true);
    formular.addEventListener('change', starteTimer, true);

    document.getElementById('json-kopieren').addEventListener('click', kopiereJson);
    document.getElementById('modell-version').textContent = MODELL.version;

    aktualisiere();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
