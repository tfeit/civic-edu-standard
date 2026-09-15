/*
 * Vokabular-Loader.
 *
 * Jede Vokabulardatei ruft EduVocab.register(...) mit einem Objekt im
 * vereinbarten Format auf. Der Loader prueft die Struktur und macht Verstoesse
 * in der Seite sichtbar — nicht nur in der Konsole, weil eine defekte
 * Vokabulardatei sonst unbemerkt ein leeres Auswahlfeld erzeugt.
 *
 * Warum .js und nicht .json: Der Klickdummy muss per Doppelklick laufen.
 * Browser blockieren fetch() auf file:// mit CORS, echte JSON-Dateien waeren
 * dort nicht ladbar. Der Inhalt unterhalb von register() ist woertlich das
 * vereinbarte JSON-Format und laesst sich ohne Verlust nach .json ueberfuehren,
 * sobald der Prototyp ueber einen Server ausgeliefert wird.
 */

(function (global) {
  'use strict';

  var vokabulare = {};
  var maengel = [];

  var PFLICHTFELDER = ['id', 'label', 'version', 'status', 'quelle', 'concepts'];
  var QUELLE_PFLICHT = ['bezeichnung', 'abgerufen', 'pruefstand'];
  var PRUEFSTAENDE = ['bestaetigt', 'unbestaetigt', 'abgeleitet'];

  function maengelMelden(datei, text) {
    maengel.push({ datei: datei, text: text });
  }

  function pruefe(v) {
    var name = (v && v.id) || '(ohne id)';

    PFLICHTFELDER.forEach(function (feld) {
      if (v[feld] === undefined || v[feld] === null) {
        maengelMelden(name, 'Pflichtangabe „' + feld + '“ fehlt.');
      }
    });

    if (v.quelle) {
      QUELLE_PFLICHT.forEach(function (feld) {
        if (!v.quelle[feld]) { maengelMelden(name, 'quelle.' + feld + ' fehlt.'); }
      });
      if (v.quelle.pruefstand && PRUEFSTAENDE.indexOf(v.quelle.pruefstand) === -1) {
        maengelMelden(name, 'quelle.pruefstand „' + v.quelle.pruefstand +
          '“ ist unbekannt (erlaubt: ' + PRUEFSTAENDE.join(', ') + ').');
      }
      if (v.quelle.abgerufen && !/^\d{4}-\d{2}-\d{2}$/.test(v.quelle.abgerufen)) {
        maengelMelden(name, 'quelle.abgerufen ist kein Datum im Format JJJJ-MM-TT.');
      }
    }

    if (!Array.isArray(v.concepts)) {
      maengelMelden(name, 'concepts ist keine Liste.');
      return;
    }

    var schluessel = {};
    v.concepts.forEach(function (c, i) {
      if (!c.key) { maengelMelden(name, 'Begriff ' + (i + 1) + ' hat keinen key.'); return; }
      if (!c.label) { maengelMelden(name, 'Begriff „' + c.key + '“ hat kein label.'); }
      if (schluessel[c.key]) { maengelMelden(name, 'Schlüssel „' + c.key + '“ kommt mehrfach vor.'); }
      schluessel[c.key] = true;
      if (c.deprecated && c.ersetztDurch && !v.concepts.some(function (a) { return a.key === c.ersetztDurch; })) {
        maengelMelden(name, 'ersetztDurch „' + c.ersetztDurch + '“ bei „' + c.key + '“ zeigt ins Leere.');
      }
    });
  }

  function register(v) {
    if (!v || typeof v !== 'object') {
      maengelMelden('(unbekannt)', 'Die Datei hat kein Objekt übergeben.');
      return;
    }
    pruefe(v);
    if (v.id) {
      if (vokabulare[v.id]) { maengelMelden(v.id, 'Vokabular wurde mehrfach registriert.'); }
      vokabulare[v.id] = v;
    }
  }

  /* ------------------------------------------------------------ Zugriff */

  function vokabular(id) {
    return vokabulare[id] || null;
  }

  // Auswahlwerte: deprecated Begriffe erscheinen hier nicht.
  function optionen(id) {
    var v = vokabulare[id];
    if (!v) { return []; }
    return v.concepts.filter(function (c) { return !c.deprecated; })
      .map(function (c) {
        return {
          value: c.key, label: c.label, hint: c.hint || null,
          definition: c.definition || null, beispiele: c.beispiele || null,
          negativbeispiel: c.negativbeispiel || null, tooltip: c.tooltip || null
        };
      });
  }

  // Beschriftung eines Schluessels, auch wenn er deprecated ist: bestehende
  // Datensaetze sollen ihre Werte weiter lesbar anzeigen.
  function begriff(id, key) {
    var v = vokabulare[id];
    if (!v) { return null; }
    for (var i = 0; i < v.concepts.length; i++) {
      if (v.concepts[i].key === key) { return v.concepts[i]; }
    }
    return null;
  }

  function istVeraltet(id, key) {
    var c = begriff(id, key);
    return !!(c && c.deprecated);
  }

  function beschriftung(id, key) {
    var c = begriff(id, key);
    return c ? c.label : key;
  }

  /* ------------------------------------------------- Maengel anzeigen */

  function zeigeMaengel() {
    if (!maengel.length) { return; }
    var kasten = document.createElement('div');
    kasten.className = 'vokabular-maengel';
    kasten.setAttribute('role', 'alert');

    var titel = document.createElement('strong');
    titel.textContent = maengel.length === 1
      ? 'Ein Vokabular ist fehlerhaft.'
      : maengel.length + ' Vokabularfehler.';
    kasten.appendChild(titel);

    var liste = document.createElement('ul');
    maengel.forEach(function (m) {
      var li = document.createElement('li');
      li.textContent = m.datei + ': ' + m.text;
      liste.appendChild(li);
    });
    kasten.appendChild(liste);

    var hinweis = document.createElement('p');
    hinweis.textContent = 'Die betroffenen Felder können unvollständig sein. '
      + 'Die Datei unter prototype/vocab/ prüfen.';
    kasten.appendChild(hinweis);

    document.body.insertBefore(kasten, document.body.firstChild);
  }

  function anzahlMaengel() { return maengel.length; }

  // Der Loader meldet sich selbst: sobald die Seite steht, werden gefundene
  // Maengel sichtbar eingeblendet. Sonst bliebe eine defekte Vokabulardatei
  // unbemerkt und erzeugte nur ein leeres Auswahlfeld.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { zeigeMaengel(); });
  } else {
    zeigeMaengel();
  }

  global.EduVocab = {
    register: register,
    vokabular: vokabular,
    optionen: optionen,
    begriff: begriff,
    beschriftung: beschriftung,
    istVeraltet: istVeraltet,
    zeigeMaengel: zeigeMaengel,
    anzahlMaengel: anzahlMaengel,
    alle: function () { return vokabulare; }
  };
})(window);
