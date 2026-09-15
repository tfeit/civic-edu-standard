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

  var PFLICHTFELDER = ['id', 'label', 'version', 'status', 'quelle'];
  var QUELLE_PFLICHT = ['bezeichnung', 'abgerufen', 'pruefstand'];

  /*
   * Pruefstand: wie belastbar ist die Herkunftsangabe?
   *   bestaetigt            gegen die benannte Quelle geprueft
   *   teilweise_bestaetigt  ein Teil geprueft, der Rest nicht — quelle.pruefstandDetail sagt, welcher
   *   recherchiert          aus Sekundaerquellen zusammengetragen, nicht am Original abgerufen
   *   unbestaetigt          Setzung der Arbeitsgruppe, keine externe Quelle
   *   abgeleitet            aus einem anderen Vokabular dieses Repositoriums errechnet
   */
  var PRUEFSTAENDE = ['bestaetigt', 'teilweise_bestaetigt', 'recherchiert',
    'unbestaetigt', 'abgeleitet'];

  function maengelMelden(datei, text) {
    maengel.push({ datei: datei, text: text });
  }

  function istCrosswalk(v) {
    return !v.concepts && Array.isArray(v.eintraege);
  }

  /*
   * Ein Crosswalk ist gueltig, wenn jeder Eintrag auf eine Leitachse zeigt und
   * die Achsen benannt sind. Ob die Zielschluessel existieren, prueft
   * pruefeVerweise() spaeter — zu diesem Zeitpunkt sind noch nicht alle
   * Vokabulare geladen.
   */
  function pruefeCrosswalk(v, name) {
    if (!v.achsen || !v.achsen.leitachse) {
      maengelMelden(name, 'achsen.leitachse fehlt.');
    }
    v.eintraege.forEach(function (e, i) {
      if (!e || typeof e !== 'object') {
        maengelMelden(name, 'Eintrag ' + (i + 1) + ' ist kein Objekt.');
      }
    });
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

    // Crosswalks fuehren keine Begriffe, sondern Zuordnungen. Sie werden
    // ueber eintraege geprueft, nicht ueber concepts.
    if (istCrosswalk(v)) { pruefeCrosswalk(v, name); return; }

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
    if (!v || !Array.isArray(v.concepts)) { return []; }
    return v.concepts.filter(function (c) { return !c.deprecated; })
      .map(function (c) {
        return {
          value: c.key, label: c.label, hint: c.hint || null,
          definition: c.definition || null, beispiele: c.beispiele || null,
          negativbeispiel: c.negativbeispiel || null, tooltip: c.tooltip || null,
          zusatz: c.zusatz || null, definitionStatus: c.definitionStatus || null
        };
      });
  }

  // Beschriftung eines Schluessels, auch wenn er deprecated ist: bestehende
  // Datensaetze sollen ihre Werte weiter lesbar anzeigen.
  function begriff(id, key) {
    var v = vokabulare[id];
    if (!v || !Array.isArray(v.concepts)) { return null; }
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

  /* ------------------------------------------------ Verweise pruefen */

  /*
   * Erst wenn alle Dateien geladen sind, laesst sich pruefen, ob die
   * Zuordnungen in den Crosswalks auf vorhandene Schluessel zeigen. Ein
   * Verweis ins Leere faellt sonst nicht auf: das Feld wird einfach nicht
   * abgeleitet, und in der Vorschau fehlt lautlos ein Block.
   */
  function hatSchluessel(vokabularId, key) {
    var v = vokabulare[vokabularId];
    if (!v || !Array.isArray(v.concepts)) { return false; }
    return v.concepts.some(function (c) { return c.key === key; });
  }

  function hatBeschriftung(vokabularId, label) {
    var v = vokabulare[vokabularId];
    if (!v || !Array.isArray(v.concepts)) { return false; }
    return v.concepts.some(function (c) { return c.label === label; });
  }

  function pruefeVerweise() {
    var bw = vokabulare['crosswalk-bildungsabschnitte'];
    if (bw) {
      bw.eintraege.forEach(function (e) {
        if (!hatSchluessel('bildungsstruktur-bereiche', e.bereich)) {
          maengelMelden(bw.id, 'Bereich „' + e.bereich + '“ gibt es im Vokabular nicht.');
        }
        (e.isced || []).forEach(function (k) {
          if (!hatSchluessel('isced-2011', k)) {
            maengelMelden(bw.id, 'ISCED-Stufe „' + k + '“ gibt es im Vokabular nicht.');
          }
        });
        (e.lebenslang || []).forEach(function (k) {
          if (!hatSchluessel('bildungsabschnitte-lebenslang', k)) {
            maengelMelden(bw.id, 'Abschnitt „' + k + '“ gibt es im Vokabular nicht.');
          }
        });
      });
      ((bw.uebergaenge && bw.uebergaenge.werte) || []).forEach(function (u) {
        (u.voraussetzt || []).forEach(function (k) {
          if (!hatSchluessel('bildungsstruktur-bereiche', k)) {
            maengelMelden(bw.id, 'Übergang „' + u.key + '“ setzt „' + k + '“ voraus, den es nicht gibt.');
          }
        });
      });
    }

    var hw = vokabulare['crosswalk-handlungsfelder'];
    if (hw) {
      hw.eintraege.forEach(function (e) {
        if (!hatSchluessel('handlungsfelder', e.handlungsfeld)) {
          maengelMelden(hw.id, 'Handlungsfeld „' + e.handlungsfeld + '“ gibt es im Vokabular nicht.');
        }
        if (e.engagementfeld && !hatBeschriftung('engagementfelder', e.engagementfeld)) {
          maengelMelden(hw.id, 'Engagementfeld „' + e.engagementfeld + '“ steht nicht in der Referenzliste.');
        }
        if (e.icnpo && !hatSchluessel('icnpoGruppen', e.icnpo)) {
          maengelMelden(hw.id, 'ICNPO-Gruppe „' + e.icnpo + '“ gibt es im Vokabular nicht.');
        }
      });
      var ohne = (vokabulare['handlungsfelder'] || { concepts: [] }).concepts
        .filter(function (c) {
          return !c.deprecated && !hw.eintraege.some(function (e) { return e.handlungsfeld === c.key; });
        });
      if (ohne.length) {
        maengelMelden(hw.id, ohne.length + ' Handlungsfeld(er) ohne Zuordnung: '
          + ohne.map(function (c) { return c.key; }).join(', '));
      }
    }
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
  function abschliessen() { pruefeVerweise(); zeigeMaengel(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', abschliessen);
  } else {
    abschliessen();
  }

  global.EduVocab = {
    register: register,
    vokabular: vokabular,
    optionen: optionen,
    begriff: begriff,
    beschriftung: beschriftung,
    istVeraltet: istVeraltet,
    pruefeVerweise: pruefeVerweise,
    zeigeMaengel: zeigeMaengel,
    anzahlMaengel: anzahlMaengel,
    alle: function () { return vokabulare; }
  };
})(window);
