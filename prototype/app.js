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

  // Zu welchem Block gehoert ein Feld? Fuer die Variantenpruefung noetig.
  var BLOCK_JE_FELD = {};

  function blockVon(feld) {
    return BLOCK_JE_FELD[feld.key] || { id: '', varianten: null };
  }

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
        case 'funnel':
          zustand[feld.key] = [];
          break;
        case 'stageModel':
          zustand[feld.key] = {
            modell: feld.modelle[0].id,
            werte: [],
            uebergaenge: [],
            quelle: 'selbstauskunft'
          };
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

  /*
   * Chips. Jede Art traegt eine eigene Farbfamilie, damit man die Art am Ton
   * wiedererkennt — der Text steht aber immer dabei. Farbe ist die Zugabe,
   * nicht der Traeger: Wer sie nicht unterscheiden kann, liest dasselbe.
   */
  var KENNZEICHEN = {
    P: { text: 'Pflicht', klasse: 'chip chip-pflicht', stern: true },
    E: { text: 'empfohlen', klasse: 'chip chip-empfohlen', stern: false },
    O: { text: 'optional', klasse: 'chip chip-optional', stern: false },
    B: { text: 'berechnet', klasse: 'chip chip-berechnet', stern: false }
  };

  function kennzeichenKnoten(feld) {
    var k = KENNZEICHEN[feld.requirement] || KENNZEICHEN.O;
    var text = k.stern ? '* ' + k.text : k.text;
    if (feld.requirement === 'P' && feld.systemAssigned) {
      text = '* Pflicht, systemvergeben';
    }
    return el('span', { class: k.klasse, text: text });
  }

  /*
   * Kennzeichen fuer Felder, deren Aufnahme oder Ausgestaltung nicht
   * entschieden ist. Frueher stand hier "zur Entscheidung in WS 4" — seit
   * Workshop 4 stattgefunden hat, waere das eine falsche Datierung: Die
   * Felder sind weiterhin offen, nur nicht mehr auf diesen Termin bezogen.
   */
  function badgeWs4() {
    return el('span', { class: 'chip chip-offen', text: 'noch zu entscheiden' });
  }

  // Felder aus der Vokabularrecherche: als Vorschlag kenntlich, nicht als
  // beschlossener Bestandteil des Schemas.
  function badgeVorschlag() {
    return el('span', { class: 'chip chip-vorschlag', text: 'Vorschlag aus Recherche · noch zu entscheiden' });
  }

  /*
   * Tooltip zu einem Auswahlwert.
   *
   * Die Vokabulare tragen Definition, Beispiele und ein Negativbeispiel. Sie
   * gehoeren an den Wert selbst, weil im Gespraech genau dort die Frage
   * auftaucht, was noch dazugehoert und was nicht. Zusaetze aus der Quelle
   * stehen ebenfalls hier und nicht im Label, sonst wird die Liste unlesbar.
   *
   * Definitionen, die noch nicht abgestimmt sind, werden als solche benannt.
   * Ein Wert ohne jede Angabe bekommt keinen leeren Tooltip.
   */
  function optionTitel(option, zusatzZeilen) {
    var zeilen = [];
    if (option.zusatz) { zeilen.push(option.zusatz); }
    if (option.definition) { zeilen.push(option.definition); }
    if (option.hint && !option.definition) { zeilen.push(option.hint); }
    if (option.beispiele && option.beispiele.length) {
      zeilen.push('Beispiele: ' + option.beispiele.join(' · '));
    }
    if (option.negativbeispiel) { zeilen.push('Nicht hierher: ' + option.negativbeispiel); }
    (zusatzZeilen || []).forEach(function (z) { if (z) { zeilen.push(z); } });
    if (option.definitionStatus === 'entwurf') { zeilen.push('Definition im Entwurf.'); }
    if (option.tooltip && zeilen.indexOf(option.tooltip) === -1) { zeilen.unshift(option.tooltip); }
    return zeilen.length ? zeilen.join('\n') : null;
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
      kinder.push(el('p', { class: 'chip chip-platzhalter', text: 'Platzhalterliste · Vokabular in Konsolidierung' }));
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
      var randnotiz = feld.optionZusatz ? feld.optionZusatz(option) : option.tooltip;
      if (randnotiz) {
        // Die ISCED-Entsprechung steht am Begriff selbst; sie ist im Workshop
        // die entscheidende Information und darf nicht nur im Tooltip stecken.
        optionsKinder.push(el('span', { class: 'option-zusatz', text: randnotiz }));
      }
      var beschriftungsKnoten = el('label', {
        class: 'option' + (randnotiz ? ' option-mit-zusatz' : ''),
        for: boxId,
        title: optionTitel(option, feld.optionHinweise ? feld.optionHinweise(option) : null)
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
    var weicheGrenze = el('p', { class: 'weiche-grenze', role: 'status', hidden: true });
    var huelle = el('div', {}, [liste, veraltet, weicheGrenze, zaehler]);
    var wrapper = feldRahmen(feld, huelle, { gruppenLabel: true });
    liste.setAttribute('aria-describedby', knoten[feld.key].beschrieben);
    knoten[feld.key].kaestchen = kaestchen;
    knoten[feld.key].zaehler = zaehler;
    knoten[feld.key].veraltet = veraltet;
    knoten[feld.key].weicheGrenze = weicheGrenze;
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


  /* ------------------------------------------- Bildungsabschnitte (WS 4) */

  /*
   * Zwei Systematiken stehen zur Entscheidung. Statt eine zu setzen, bietet
   * das Formular beide an und laesst sie umschalten.
   *
   * Beim Wechsel wird die Auswahl verworfen, nicht uebersetzt. Das ist
   * Absicht: Aus "Schulische Bildung" laesst sich die Stufe nicht
   * rekonstruieren, eine automatische Umrechnung erzeugte also falsche
   * Sicherheit. Genau dieser Punkt soll im Gespraech sichtbar werden — der
   * Hinweis nach dem Wechsel sagt deshalb, was eine Uebersetzung geleistet
   * haette und wo sie bricht.
   */
  function crosswalkBildung() {
    return window.EduVocab.vokabular('crosswalk-bildungsabschnitte');
  }

  function bereichsEintrag(bereichKey) {
    var cw = crosswalkBildung();
    if (!cw) { return null; }
    for (var i = 0; i < cw.eintraege.length; i++) {
      if (cw.eintraege[i].bereich === bereichKey) { return cw.eintraege[i]; }
    }
    return null;
  }

  function uebergangsWerte() {
    var cw = crosswalkBildung();
    return (cw && cw.uebergaenge && cw.uebergaenge.werte) || [];
  }

  function modellVon(feld, id) {
    var treffer = null;
    feld.modelle.forEach(function (m) { if (m.id === id) { treffer = m; } });
    return treffer || feld.modelle[0];
  }

  // Randnotiz am Wert: die ISCED-Entsprechung. Sie ist im Workshop das
  // Argument dafuer, dass der Standard international anschlussfaehig ist.
  function iscedRandnotiz(bereichKey) {
    var e = bereichsEintrag(bereichKey);
    if (!e) { return null; }
    if (!e.isced.length) { return 'kein ISCED-Äquivalent'; }
    return e.isced.length === 1 ? e.isced[0] : e.isced[0] + '–' + e.isced[e.isced.length - 1];
  }

  function bereichsHinweise(bereichKey) {
    var e = bereichsEintrag(bereichKey);
    if (!e) { return []; }
    if (!e.isced.length) {
      return ['Kein internationales Äquivalent — eigenes Konzept der Arbeitsgruppe.'];
    }
    return ['ISCED: ' + e.isced.join(', ') + ' (' + e.iscedQualitaet + ').'];
  }

  renderer.stageModel = function (feld) {
    var ref = (knoten[feld.key] = knoten[feld.key] || {});
    var id = 'fld-' + feld.key;

    /* Umschalter */
    var schalter = el('div', {
      class: 'modellschalter',
      role: 'radiogroup',
      'aria-label': 'Systematik für die Bildungsabschnitte'
    });
    ref.modellKnoepfe = [];
    feld.modelle.forEach(function (modell, i) {
      var knopfId = id + '-modell-' + i;
      var box = el('input', { type: 'radio', name: id + '-modell', id: knopfId, value: modell.id });
      box.addEventListener('change', function () {
        if (box.checked) { wechsleModell(feld, modell.id); }
      });
      var huelle = el('label', { class: 'modelloption', for: knopfId, title: modell.label },
        [box, el('span', { text: modell.kurz })]);
      schalter.appendChild(huelle);
      ref.modellKnoepfe.push({ box: box, id: modell.id });
    });

    var schalterHinweis = el('p', { class: 'hilfe', text: feld.modellHinweis || '' });
    var wechselHinweis = el('p', { class: 'wechselhinweis', role: 'status', hidden: true });

    /* Werteliste — wird bei jedem Modellwechsel neu gezeichnet */
    var werteListe = el('div', { class: 'optionsliste', role: 'group', 'aria-labelledby': id + '-label' });
    var zaehler = el('p', { class: 'auswahlzaehler', 'aria-live': 'polite' });

    /* Übergänge — nur bei Modell B */
    var uebergangsTitel = el('span', { class: 'gruppen-label', id: id + '-ueb-label' }, [
      document.createTextNode('Übergänge '),
      el('span', { class: 'chip chip-vorschlag', text: 'Vorschlag aus Workshop 4 · noch zu entscheiden' })
    ]);
    var uebergangsListe = el('div', {
      class: 'optionsliste einspaltig',
      role: 'group',
      'aria-labelledby': id + '-ueb-label'
    });
    var uebergangsHinweis = el('p', { class: 'hinweis' });
    var uebergangsBlock = el('div', { class: 'uebergangsblock' },
      [uebergangsTitel, uebergangsHinweis, uebergangsListe]);

    var huelle = el('div', {}, [
      schalter, schalterHinweis, wechselHinweis, werteListe, zaehler, uebergangsBlock
    ]);
    var wrapper = feldRahmen(feld, huelle, { gruppenLabel: true });
    werteListe.setAttribute('aria-describedby', knoten[feld.key].beschrieben);

    ref.werteListe = werteListe;
    ref.zaehler = zaehler;
    ref.uebergangsBlock = uebergangsBlock;
    ref.uebergangsListe = uebergangsListe;
    ref.uebergangsHinweis = uebergangsHinweis;
    ref.wechselHinweis = wechselHinweis;

    zeichneStufen(feld);
    return wrapper;
  };

  /*
   * Modellwechsel. Die Auswahl wird verworfen — vorher wird gefragt, weil
   * sonst unbemerkt Arbeit verlorenginge.
   */
  function wechsleModell(feld, neuesModell) {
    var wert = zustand[feld.key];
    if (wert.modell === neuesModell) { return; }

    if (wert.werte.length) {
      var altesModell = modellVon(feld, wert.modell);
      var frage = 'Die Systematik wechselt von „' + altesModell.kurz + '“ zu „'
        + modellVon(feld, neuesModell).kurz + '“.\n\n'
        + 'Die bisherige Auswahl (' + wert.werte.length + ') wird dabei verworfen und '
        + 'nicht übersetzt. Fortfahren?';
      if (!window.confirm(frage)) {
        setzeModellKnoepfe(feld);
        return;
      }
    }

    var vorher = { modell: wert.modell, werte: wert.werte.slice() };
    wert.modell = neuesModell;
    wert.werte = [];
    wert.uebergaenge = [];
    zeigeWechselHinweis(feld, vorher);
    zeichneStufen(feld);
    aktualisiere();
  }

  /*
   * Was haette eine Uebersetzung geleistet — und wo bricht sie? Der Hinweis
   * stammt aus dem Crosswalk, nicht aus dem Code.
   */
  function zeigeWechselHinweis(feld, vorher) {
    var kasten = knoten[feld.key].wechselHinweis;
    var cw = crosswalkBildung();
    if (!kasten) { return; }
    if (!vorher.werte.length || !cw) { kasten.hidden = true; kasten.textContent = ''; return; }

    var zeilen = ['Die Auswahl wurde verworfen, nicht übersetzt. Was eine Übersetzung geleistet hätte:'];
    var nachB = vorher.modell === 'bildungsabschnitte-lebenslang';

    vorher.werte.forEach(function (key) {
      if (nachB) {
        cw.eintraege.forEach(function (e) {
          if (e.lebenslang.indexOf(key) === -1) { return; }
          var name = window.EduVocab.beschriftung('bildungsabschnitte-lebenslang', key);
          var ziel = window.EduVocab.beschriftung('bildungsstruktur-bereiche', e.bereich);
          if (e.lebenslangQualitaet === 'nur_mit_zusatz') {
            zeilen.push('„' + name + '“ → ' + ziel + ' — nur mit dem Zusatz „' + e.zusatz
              + '“. Die Stufe steckt nicht im Wert selbst.');
          } else {
            zeilen.push('„' + name + '“ → ' + ziel + '.');
          }
        });
      } else {
        var e2 = bereichsEintrag(key);
        if (!e2) { return; }
        var name2 = window.EduVocab.beschriftung('bildungsstruktur-bereiche', key);
        var ziele = e2.lebenslang.map(function (k) {
          return window.EduVocab.beschriftung('bildungsabschnitte-lebenslang', k);
        });
        zeilen.push('„' + name2 + '“ → ' + ziele.join(', ')
          + (e2.lebenslangQualitaet === 'aggregiert' ? ' — mehrdeutig.' : '.'));
      }
    });

    kasten.textContent = '';
    zeilen.forEach(function (z, i) {
      kasten.appendChild(el(i === 0 ? 'strong' : 'span', { class: 'wechselzeile', text: z }));
    });
    kasten.hidden = false;
  }

  function setzeModellKnoepfe(feld) {
    var wert = zustand[feld.key];
    (knoten[feld.key].modellKnoepfe || []).forEach(function (k) {
      k.box.checked = k.id === wert.modell;
    });
  }

  /* Werteliste des aktiven Modells neu aufbauen. */
  function zeichneStufen(feld) {
    var ref = knoten[feld.key];
    var wert = zustand[feld.key];
    var modell = modellVon(feld, wert.modell);
    var id = 'fld-' + feld.key;

    setzeModellKnoepfe(feld);
    ref.werteListe.textContent = '';
    ref.stufenKaestchen = [];

    modell.options.forEach(function (option, i) {
      var boxId = id + '-stufe-' + i;
      var box = el('input', { type: 'checkbox', id: boxId, value: option.value });
      var notiz = modell.mitUebergaengen ? iscedRandnotiz(option.value) : null;
      var kinder = [box, el('span', { text: option.label })];
      if (notiz) { kinder.push(el('span', { class: 'option-zusatz', text: notiz })); }
      var huelle = el('label', {
        class: 'option' + (notiz ? ' option-mit-zusatz' : ''),
        for: boxId,
        title: optionTitel(option, modell.mitUebergaengen ? bereichsHinweise(option.value) : null)
      }, kinder);
      box.addEventListener('change', function () {
        var pos = wert.werte.indexOf(option.value);
        if (box.checked && pos === -1) { wert.werte.push(option.value); }
        if (!box.checked && pos !== -1) { wert.werte.splice(pos, 1); }
        aktualisiere();
      });
      ref.stufenKaestchen.push({ box: box, value: option.value });
      ref.werteListe.appendChild(huelle);
    });

    zeichneUebergaenge(feld);
  }

  /*
   * Uebergaenge gibt es nur in Modell B. Modell A fuehrt sie als eigene
   * Werte — deshalb ist der Block dort nicht sichtbar.
   */
  function zeichneUebergaenge(feld) {
    var ref = knoten[feld.key];
    var wert = zustand[feld.key];
    var modell = modellVon(feld, wert.modell);
    var cw = crosswalkBildung();

    ref.uebergangsBlock.hidden = !modell.mitUebergaengen;
    if (!modell.mitUebergaengen) { wert.uebergaenge = []; return; }

    ref.uebergangsHinweis.textContent = (cw && cw.uebergaenge && cw.uebergaenge.regel) || '';
    ref.uebergangsListe.textContent = '';
    ref.uebergangsKaestchen = [];

    uebergangsWerte().forEach(function (u, i) {
      var boxId = 'fld-' + feld.key + '-ueb-' + i;
      var box = el('input', { type: 'checkbox', id: boxId, value: u.key });
      var huelle = el('label', { class: 'option', for: boxId }, [box, el('span', { text: u.label })]);
      box.addEventListener('change', function () {
        var pos = wert.uebergaenge.indexOf(u.key);
        if (box.checked && pos === -1) { wert.uebergaenge.push(u.key); }
        if (!box.checked && pos !== -1) { wert.uebergaenge.splice(pos, 1); }
        aktualisiere();
      });
      ref.uebergangsKaestchen.push({ box: box, huelle: huelle, uebergang: u });
      ref.uebergangsListe.appendChild(huelle);
    });
  }

  function aktualisiereStufen(feld) {
    var ref = knoten[feld.key];
    var wert = zustand[feld.key];
    var modell = modellVon(feld, wert.modell);

    (ref.stufenKaestchen || []).forEach(function (k) {
      k.box.checked = wert.werte.indexOf(k.value) !== -1;
    });
    ref.zaehler.textContent = wert.werte.length + ' gewählt'
      + (feld.min ? ' · mindestens ' + feld.min : '');

    if (!modell.mitUebergaengen) { return; }

    /*
     * Ein Uebergang setzt beide angrenzenden Bereiche voraus. Nicht waehlbare
     * Uebergaenge werden deaktiviert dargestellt, nicht ausgeblendet: sonst
     * bliebe unklar, warum sie fehlen.
     */
    var cw = crosswalkBildung();
    var offenerPunkt = (cw && cw.uebergaenge && cw.uebergaenge.offenerPunkt) || '';

    (ref.uebergangsKaestchen || []).forEach(function (k) {
      var fehlend = (k.uebergang.voraussetzt || []).filter(function (b) {
        return wert.werte.indexOf(b) === -1;
      });
      var erlaubt = fehlend.length === 0;
      k.box.disabled = !erlaubt;
      k.huelle.classList.toggle('gesperrt', !erlaubt);

      var titel = [];
      if (!erlaubt) {
        titel.push('Erst wählbar, wenn auch ' + fehlend.map(function (b) {
          return '„' + window.EduVocab.beschriftung('bildungsstruktur-bereiche', b) + '“';
        }).join(' und ') + ' gewählt ist.');
      }
      if (k.uebergang.key === 'sek2_erwerbstaetigkeit' && offenerPunkt) {
        titel.push(offenerPunkt);
      }
      if (!k.uebergang.entsprichtModellA) {
        titel.push('In Modell A gibt es dafür keinen Wert.');
      }
      k.huelle.title = titel.join('\n');

      // Ein nicht mehr zulaessiger Uebergang faellt heraus, sobald der
      // angrenzende Bereich abgewaehlt wird.
      if (!erlaubt) {
        var pos = wert.uebergaenge.indexOf(k.uebergang.key);
        if (pos !== -1) { wert.uebergaenge.splice(pos, 1); }
      }
      k.box.checked = wert.uebergaenge.indexOf(k.uebergang.key) !== -1;
    });
  }


  /* ------------------------------------------ Geografie-Varianten (WS 4) */

  /*
   * Die Arbeitsgruppe hat die geografische Aufloesung nicht entschieden. Statt
   * eine Variante zu setzen, stehen drei zur Wahl und werden am Formular
   * geprueft. Der Variantenwaehler ist ein Werkzeug fuer die Arbeitsgruppe, kein
   * Teil des Ausfuellwegs — er sitzt deshalb am Blockkopf, nicht im Feld.
   */
  var aktiveVarianten = {};    // Block-Id -> gewaehlte Variante
  var bewertungen = {};        // Block-Id -> { variante: { urteil, notiz } }

  function varianteVon(block) {
    if (!block || !block.varianten) { return null; }
    return aktiveVarianten[block.id] || block.varianten.werte[0].id;
  }

  function variantenWaehler(block) {
    var name = 'variante-' + block.id;
    var gruppe = el('div', { class: 'variantenwaehler', role: 'radiogroup', 'aria-label': 'Variante der Geografie-Erfassung' });

    block.varianten.werte.forEach(function (v) {
      var knopfId = name + '-' + v.id;
      var box = el('input', { type: 'radio', name: name, id: knopfId, value: String(v.id) });
      box.checked = v.id === varianteVon(block);
      box.addEventListener('change', function () {
        if (!box.checked) { return; }
        aktiveVarianten[block.id] = v.id;
        aktualisiere();
        zeigeBewertung(block);
      });
      gruppe.appendChild(el('label', { class: 'variantenoption', for: knopfId, title: v.beschreibung },
        [box, el('span', { text: 'Variante ' + v.id + ': ' + v.label })]));
    });

    var beschreibung = el('p', { class: 'hilfe variantenbeschreibung' });
    var kasten = el('div', { class: 'variantenblock' }, [
      el('p', { class: 'variantenhinweis', text: block.varianten.hinweis }),
      gruppe,
      beschreibung,
      bewertungsFeld(block)
    ]);
    variantenKnoten[block.id] = { beschreibung: beschreibung };
    return kasten;
  }

  var variantenKnoten = {};

  /*
   * Bewertung je Variante. Sie sammelt sich unter _test und wird beim Kopieren
   * ausgeschlossen: Der Formulartest soll sich auswerten lassen, ohne dass ein
   * Testartefakt in einen Beispieldatensatz geraet.
   */
  function bewertungsFeld(block) {
    var bew = block.varianten.bewertung;
    var name = 'bewertung-' + block.id;
    var knoepfe = el('div', { class: 'bewertungsknoepfe', role: 'radiogroup', 'aria-label': bew.frage });

    bew.optionen.forEach(function (o) {
      var knopfId = name + '-' + o.value;
      var box = el('input', { type: 'radio', name: name, id: knopfId, value: o.value });
      box.addEventListener('change', function () {
        if (box.checked) { setzeBewertung(block, { urteil: o.value }); }
      });
      knoepfe.appendChild(el('label', { class: 'bewertungsoption', for: knopfId },
        [box, el('span', { text: o.label })]));
    });

    var notizId = name + '-notiz';
    var notiz = el('textarea', { id: notizId, rows: '2', placeholder: 'Notiz zur Variante (optional)' });
    notiz.addEventListener('input', function () { setzeBewertung(block, { notiz: notiz.value }); });

    variantenBewertung[block.id] = { knoepfe: knoepfe, notiz: notiz };

    return el('details', { class: 'bewertung' }, [
      el('summary', { text: bew.frage }),
      knoepfe,
      el('label', { class: 'bewertungsnotiz', for: notizId, text: 'Notiz' }),
      notiz
    ]);
  }

  var variantenBewertung = {};

  function setzeBewertung(block, teil) {
    var v = varianteVon(block);
    bewertungen[block.id] = bewertungen[block.id] || {};
    var eintrag = bewertungen[block.id][v] || {};
    if (teil.urteil !== undefined) { eintrag.urteil = teil.urteil; }
    if (teil.notiz !== undefined) { eintrag.notiz = teil.notiz; }
    bewertungen[block.id][v] = eintrag;
    aktualisiereVorschau();
  }

  // Beim Variantenwechsel zeigt das Bewertungsfeld, was zu dieser Variante
  // bereits notiert wurde — sonst ueberschreibt man unbemerkt die vorige.
  function zeigeBewertung(block) {
    var v = varianteVon(block);
    var eintrag = (bewertungen[block.id] || {})[v] || {};
    var ref = variantenBewertung[block.id];
    if (!ref) { return; }
    ref.knoepfe.querySelectorAll('input').forEach(function (box) {
      box.checked = box.value === eintrag.urteil;
    });
    ref.notiz.value = eintrag.notiz || '';

    var beschreibung = (variantenKnoten[block.id] || {}).beschreibung;
    if (beschreibung) {
      var gewaehlt = null;
      block.varianten.werte.forEach(function (w) { if (w.id === v) { gewaehlt = w; } });
      beschreibung.textContent = gewaehlt ? gewaehlt.beschreibung : '';
    }
  }

  function testBlock() {
    var ausgabe = {};
    Object.keys(bewertungen).forEach(function (blockId) {
      Object.keys(bewertungen[blockId]).forEach(function (variante) {
        var e = bewertungen[blockId][variante];
        if (!e.urteil && !(e.notiz || '').trim()) { return; }
        ausgabe[blockId + '.variante' + variante] = {
          urteil: e.urteil || null,
          notiz: (e.notiz || '').trim() || null
        };
      });
    });
    return Object.keys(ausgabe).length ? ausgabe : null;
  }

  /* ------------------------------------------------ Trichter (Variante 1) */

  /*
   * Man gibt den praezisesten Raum an; die uebergeordneten Ebenen ergeben sich
   * daraus und erscheinen als abgeleitete Chips. Ohne eingebettete Liste
   * braeuchte das einen externen Dienst — und damit waere die Offline-
   * Tauglichkeit dahin.
   */
  renderer.funnel = function (feld) {
    var id = 'fld-' + feld.key;
    var listenId = id + '-liste';

    var eingabe = el('input', {
      type: 'text', id: id, placeholder: feld.placeholder || '',
      autocomplete: 'off', list: listenId
    });
    var datalist = el('datalist', { id: listenId });
    feld.options.forEach(function (o) {
      datalist.appendChild(el('option', {
        value: o.label + ' (' + o.value + ')',
        label: o.ebene === 'bundesland' ? 'Land' : 'Gemeinde'
      }));
    });

    var hinzufuegen = el('button', { type: 'button', class: 'leise', text: 'Übernehmen' });
    var zeile = el('div', { class: 'trichter-eingabe' }, [eingabe, hinzufuegen, datalist]);

    var gewaehlt = el('ul', { class: 'trichter-auswahl' });
    var abgeleitet = el('p', { class: 'chips trichter-abgeleitet' });
    var meldung = el('p', { class: 'feld-fehler', role: 'status' });

    function uebernehmen() {
      var treffer = findeRaum(feld, eingabe.value);
      if (!treffer) {
        meldung.textContent = eingabe.value.trim()
          ? 'Kein Raum mit dieser Bezeichnung in der eingebetteten Liste.'
          : '';
        return;
      }
      if (zustand[feld.key].indexOf(treffer.value) === -1) {
        zustand[feld.key].push(treffer.value);
      }
      eingabe.value = '';
      meldung.textContent = '';
      aktualisiere();
    }

    hinzufuegen.addEventListener('click', uebernehmen);
    eingabe.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); uebernehmen(); }
    });

    var huelle = el('div', {}, [zeile, meldung, gewaehlt, abgeleitet]);
    var wrapper = feldRahmen(feld, huelle);
    setzeBeschreibung(feld, eingabe);
    knoten[feld.key].eingabe = eingabe;
    knoten[feld.key].gewaehlt = gewaehlt;
    knoten[feld.key].abgeleitet = abgeleitet;
    knoten[feld.key].meldung = meldung;
    return wrapper;
  };

  function findeRaum(feld, text) {
    var gesucht = (text || '').trim().toLowerCase();
    if (!gesucht) { return null; }
    // "Bonn (05314)" ebenso zulassen wie "Bonn" oder "05314".
    var inKlammern = gesucht.match(/\(([^)]+)\)\s*$/);
    if (inKlammern) { gesucht = inKlammern[1].trim(); }
    var treffer = null;
    feld.options.forEach(function (o) {
      if (treffer) { return; }
      if (o.value === gesucht || o.label.toLowerCase() === gesucht) { treffer = o; }
    });
    return treffer;
  }

  function raumBegriff(schluessel) {
    return window.EduVocab.begriff('raumgliederung', schluessel);
  }

  function aktualisiereTrichter(feld) {
    var ref = knoten[feld.key];
    var werte = zustand[feld.key];

    ref.gewaehlt.textContent = '';
    werte.forEach(function (schluessel) {
      var b = raumBegriff(schluessel);
      var text = (b ? b.label : schluessel) + ' · ' + schluessel;
      var zeile = el('li', {}, [el('span', { text: text })]);
      var weg = el('button', { type: 'button', class: 'leise', text: 'Entfernen' });
      weg.addEventListener('click', function () {
        var pos = zustand[feld.key].indexOf(schluessel);
        if (pos !== -1) { zustand[feld.key].splice(pos, 1); }
        aktualisiere();
      });
      zeile.appendChild(weg);
      ref.gewaehlt.appendChild(zeile);
    });

    /* Die uebergeordneten Ebenen ergeben sich — sie werden nicht gepflegt. */
    var laender = [];
    werte.forEach(function (schluessel) {
      var b = raumBegriff(schluessel);
      if (!b) { return; }
      var land = b.ebene === 'bundesland' ? b.key : b.uebergeordnet;
      if (land && laender.indexOf(land) === -1) { laender.push(land); }
    });
    laender.sort();

    ref.abgeleitet.textContent = '';
    if (!werte.length) {
      ref.abgeleitet.appendChild(el('span', { class: 'chips-leer', text: 'Noch kein Raum angegeben.' }));
      return;
    }
    ref.abgeleitet.appendChild(el('span', { class: 'chips-titel', text: 'Ergibt sich daraus: ' }));
    laender.forEach(function (land) {
      ref.abgeleitet.appendChild(el('span', {
        class: 'chip chip-abgeleitet',
        text: window.EduVocab.beschriftung('bundeslaender', land) + ' (' + land + ')'
      }));
    });
    ref.abgeleitet.appendChild(el('span', { class: 'chip chip-abgeleitet', text: 'Deutschland (DE)' }));
  }

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
      if (block.varianten) { abschnitt.appendChild(variantenWaehler(block)); }
      block.fields.forEach(function (feld) {
        BLOCK_JE_FELD[feld.key] = block;
        var fn = renderer[feld.type];
        if (!fn) { return; }
        abschnitt.appendChild(fn(feld));
      });
      ziel.appendChild(abschnitt);
      if (block.varianten) { zeigeBewertung(block); }
    });
  }

  /* --------------------------------------------------- Sichtbarkeitsregeln */

  function istSichtbar(feld) {
    // Variantenfelder sind nur in ihrer Variante sichtbar. Sie bleiben im
    // Modell stehen, damit sich die Varianten im Gespraech vergleichen lassen.
    if (feld.variante && feld.variante !== varianteVon(blockVon(feld))) { return false; }
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
    if (feld.softMax) { text += ' · Richtwert ' + feld.softMax; }
    if (feld.min) { text += ' · mindestens ' + feld.min; }
    knoten[feld.key].zaehler.textContent = text;

    /*
     * Weiche Obergrenze: Die Auswahl bleibt moeglich. Eine Sperre wuerde im
     * Workshop als Entscheidung gelesen, und beschlossen ist die Grenze nicht.
     */
    var warnung = knoten[feld.key].weicheGrenze;
    if (warnung) {
      var ueberschritten = !!feld.softMax && werte.length > feld.softMax;
      warnung.hidden = !ueberschritten;
      warnung.textContent = ueberschritten ? (feld.softMaxHinweis || '') : '';
    }
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
      chips.appendChild(el('li', { class: 'chip chip-abgeleitet', text: land.value + ' ' + land.label }));
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
        case 'funnel':
          wert = zustand[feld.key].map(function (schluessel) {
            var b = raumBegriff(schluessel);
            return { key: schluessel, label: b ? b.label : schluessel, ebene: b ? b.ebene : null };
          });
          break;
        case 'stageModel':
          wert = zustand[feld.key].werte.length
            ? {
                modell: zustand[feld.key].modell,
                werte: zustand[feld.key].werte.slice(),
                quelle: zustand[feld.key].quelle
              }
            : {};
          if (wert.werte && zustand[feld.key].uebergaenge.length) {
            wert.uebergaenge = zustand[feld.key].uebergaenge.slice();
          }
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
    var abgeleitet = {};
    var etwas = false;

    /* Aggregation der Handlungsfelder nach aussen. */
    var felder = datensatz.fieldsOfAction || [];
    var hw = window.EduVocab.vokabular('crosswalk-handlungsfelder');
    if (felder.length && hw) {
      var engagement = [], icnpo = [];
      felder.forEach(function (key) {
        hw.eintraege.forEach(function (e) {
          if (e.handlungsfeld !== key) { return; }
          if (e.engagementfeld && engagement.indexOf(e.engagementfeld) === -1) {
            engagement.push(e.engagementfeld);
          }
          if (e.icnpo && icnpo.indexOf(e.icnpo) === -1) { icnpo.push(e.icnpo); }
        });
      });
      if (engagement.length || icnpo.length) {
        abgeleitet.engagementfelder = engagement;
        abgeleitet.icnpo = icnpo;
        abgeleitet.dataTheme = 'EDUC';
        etwas = true;
      }
    }

    /*
     * ISCED aus den Bildungsbereichen. Das zeigt im Gespraech, dass der
     * Standard international anschlussfaehig ist, ohne dass jemand ISCED
     * ausfuellen muesste. Nur Modell B traegt diese Zuordnung — Modell A
     * laesst sich nicht verlustfrei uebersetzen.
     */
    var stufen = datensatz.educationStages;
    if (stufen && stufen.modell === 'bildungsstruktur-bereiche' && stufen.werte.length) {
      var isced = [], stufenQualitaet = [], ohneEntsprechung = [];
      stufen.werte.forEach(function (bereich) {
        var e = bereichsEintrag(bereich);
        if (!e) { return; }
        if (!e.isced.length) { ohneEntsprechung.push(bereich); return; }
        e.isced.forEach(function (k) { if (isced.indexOf(k) === -1) { isced.push(k); } });
        if (stufenQualitaet.indexOf(e.iscedQualitaet) === -1) {
          stufenQualitaet.push(e.iscedQualitaet);
        }
      });
      isced.sort();
      if (isced.length || ohneEntsprechung.length) {
        abgeleitet.isced = isced;
        /*
         * Die Qualitaetsstufe bewertet die Bereiche, die tatsaechlich
         * uebersetzt wurden — bei mehreren die schlechteste, denn sie begrenzt
         * die Aussage. Bereiche ohne Entsprechung stehen daneben und nicht in
         * der Qualitaetsstufe: Sonst stuende bei "Primarstufe und
         * Quartaerbereich" die Angabe keine_entsprechung neben einem
         * ausgewiesenen ED1 — und das waere schlicht falsch.
         */
        abgeleitet.iscedQualitaet = isced.length
          ? schlechtesteQualitaet(stufenQualitaet)
          : 'keine_entsprechung';
        if (ohneEntsprechung.length) {
          abgeleitet.iscedOhneEntsprechung = ohneEntsprechung;
        }
        etwas = true;
      }
    }

    return etwas ? abgeleitet : null;
  }

  // Reihenfolge von belastbar nach unscharf.
  var QUALITAETSRANG = ['eindeutig', 'aggregiert', 'mehrdeutig', 'nur_mit_zusatz', 'keine_entsprechung'];

  function schlechtesteQualitaet(stufen) {
    var rang = -1;
    stufen.forEach(function (q) {
      var i = QUALITAETSRANG.indexOf(q);
      if (i > rang) { rang = i; }
    });
    return rang === -1 ? null : QUALITAETSRANG[rang];
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
    // Was kopiert wird, ist der Datensatz — ohne die Bewertungen aus dem
    // Formulartest. Sie gehoeren in die Auswertung des Workshops, nicht in
    // einen Beispieldatensatz.
    letzterJsonText = JSON.stringify(datensatz, null, 2);

    var test = testBlock();
    if (test) { datensatz._test = test; }
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

  /*
   * Nur sichtbare Pflichtfelder zaehlen. Ein Feld, das zu einer anderen
   * Variante gehoert oder dessen Bedingung nicht erfuellt ist, kann nicht
   * ausgefuellt werden — es im Zaehler zu fuehren, hiesse eine Huerde
   * anzeigen, die es nicht gibt.
   */
  function pflichtfelder() {
    return alleFelder().filter(function (feld) {
      return feld.requirement === 'P' && istSichtbar(feld);
    });
  }

  function pflichtfeldErfuellt(feld) {
    var wert = zustand[feld.key];
    if (feld.type === 'checkboxes') {
      return wert.length >= (feld.min || 1);
    }
    if (feld.type === 'stageModel') {
      return wert.werte.length >= (feld.min || 1);
    }
    if (feld.type === 'funnel') {
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
        case 'stageModel':
          aktualisiereStufen(feld);
          break;
        case 'funnel':
          aktualisiereTrichter(feld);
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

      /*
       * Zuletzt: Gehoert das Feld zu einer fremden Variante, wird es
       * ausgeblendet — das hat Vorrang vor allem, was die Typbehandlung
       * gesetzt hat. Gehoert es zur laufenden Variante, wird es hier aber
       * *nicht* eingeblendet: Darueber entscheidet weiter die eigene
       * Bedingung des Feldes.
       *
       * Die frühere Fassung setzte hidden in beide Richtungen und hat damit
       * die Gebietsliste sichtbar gelassen, obwohl noch keine Reichweite
       * gewaehlt war. Zu sehen war dann eine Ueberschrift ohne ein einziges
       * Eingabefeld darunter.
       */
      if (feld.variante && feld.type !== 'repeatable') {
        ref.wrapper.hidden = feld.variante !== varianteVon(blockVon(feld))
          // Fremde Variante: ausblenden, unabhaengig von allem anderen.
          ? true
          // Eigene Variante: Ueber die Sichtbarkeit entscheidet weiter die
          // Bedingung des Feldes. Hat es keine, ist es schlicht sichtbar.
          : !istSichtbar(feld);
      }

      /*
       * Wiederholte Felder blenden sich selbst ein und aus — etwa die
       * Gebietsliste, die von der Reichweite abhaengt. Hier wird deshalb nur
       * die fremde Variante ausgeblendet, nie etwas eingeblendet.
       */
      if (feld.variante && feld.type === 'repeatable'
          && feld.variante !== varianteVon(blockVon(feld))) {
        ref.wrapper.hidden = true;
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

  /*
   * Export als Datei. Das ist der Weg, auf dem aus dem Prototyp erzeugte
   * Beispiele in die weitere Arbeit gelangen — ohne Backend, ohne Upload.
   * Der Dateiname traegt den Organisationsnamen, damit mehrere Exporte in
   * einem Download-Ordner unterscheidbar bleiben.
   */
  function exportiereJson() {
    var rueckmeldung = document.getElementById('kopier-rueckmeldung');
    var name = (zustand.name || 'akteursprofil').toString().trim()
      .toLowerCase()
      .replace(/[äöüß]/g, function (z) {
        return { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }[z];
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'akteursprofil';

    var blob = new Blob([letzterJsonText], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = el('a', { href: url, download: name + '.json' });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Der Browser braucht den Verweis noch einen Moment.
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);

    rueckmeldung.textContent = 'Als ' + name + '.json gespeichert.';
    window.setTimeout(function () { rueckmeldung.textContent = ''; }, 4000);
  }

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
        case 'stageModel':
          // Ein Beispiel kann ein anderes Modell mitbringen; dann muss die
          // Werteliste neu aufgebaut werden, nicht nur angehakt.
          if (!Array.isArray(zustand[feld.key].uebergaenge)) {
            zustand[feld.key].uebergaenge = [];
          }
          if (!zustand[feld.key].quelle) { zustand[feld.key].quelle = 'selbstauskunft'; }
          ref.wechselHinweis.hidden = true;
          ref.wechselHinweis.textContent = '';
          zeichneStufen(feld);
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
    document.getElementById('json-export').addEventListener('click', exportiereJson);
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
