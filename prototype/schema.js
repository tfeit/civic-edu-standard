/*
 * Netzdarstellung des Datenmodells.
 *
 * Zwei Ansichten auf denselben Gegenstand:
 *   Schemastruktur — Felder und ihre konditionalen Abhaengigkeiten,
 *                    vollstaendig aus fields.js abgeleitet.
 *   Akteursnetz    — Datensaetze und die Schluessel, ueber die sie
 *                    zusammenfinden (Bundesland, Handlungsfeld).
 *
 * Die Farbbedeutung ist in beiden Ansichten dieselbe:
 *   blau  = Identitaet / Akteur
 *   orange = Taetigkeit / Handlungsfeld
 *   aqua  = Raum / Bundesland
 */

(function () {
  'use strict';

  var MODELL = window.EduStandard.feldmodell;
  var VOK = window.EduStandard.vokabulare;
  var AKTEURE = window.EduStandard.akteure;

  var BREITE = 980, HOEHE = 640;
  var GRUPPE_JE_BLOCK = { A: 'a', C: 'c', D: 'd' };

  var ARTEN = {
    sichtbarkeit: 'blendet ein',
    auswahl: 'speist Auswahl',
    berechnung: 'berechnet',
    zugehoerig: 'gehört zu'
  };

  function alleFelder() {
    var liste = [];
    MODELL.blocks.forEach(function (block) {
      block.fields.forEach(function (feld) { liste.push({ feld: feld, block: block }); });
    });
    return liste;
  }

  /* --------------------------------------------------- Schemastruktur */

  // Leitet die Abhaengigkeiten aus dem Feldmodell ab — nichts ist hier
  // fest verdrahtet, eine Aenderung in fields.js schlaegt durch.
  function schemaNetz() {
    var knoten = [], kanten = [], gesehen = {};
    var anker = {
      A: { x: BREITE * 0.26, y: HOEHE * 0.34 },
      C: { x: BREITE * 0.74, y: HOEHE * 0.30 },
      D: { x: BREITE * 0.52, y: HOEHE * 0.78 }
    };

    // Die Bloecke sind selbst Knoten. Ohne sie zerfiele die Darstellung in
    // drei Punktwolken: das Feldmodell hat nur wenige konditionale Kanten,
    // die Zugehoerigkeit zum Block ist die tragende Struktur.
    MODELL.blocks.forEach(function (block) {
      knoten.push({
        id: 'block-' + block.id,
        label: block.title,
        gruppe: GRUPPE_JE_BLOCK[block.id] || 'a',
        radius: 15,
        gross: true,
        anker: anker[block.id],
        art: 'block',
        block: block,
        ariaLabel: 'Block ' + block.title + ' mit ' + block.fields.length + ' Feldern'
      });
    });

    alleFelder().forEach(function (eintrag) {
      var feld = eintrag.feld, block = eintrag.block;
      knoten.push({
        id: feld.key,
        label: feld.label,
        gruppe: GRUPPE_JE_BLOCK[block.id] || 'a',
        radius: feld.requirement === 'P' ? 8 : feld.requirement === 'E' ? 6.5 : 5.5,
        art: 'feld',
        feld: feld,
        block: block,
        ariaLabel: feld.label + ', Block ' + block.title + ', ' +
          ({ P: 'Pflicht', E: 'empfohlen', O: 'optional', B: 'berechnet' }[feld.requirement] || '')
      });
      // Grosse Bloecke brauchen einen weiteren Ring, sonst draengen sich
      // ihre Felder, waehrend kleine Bloecke Flaeche verschenken.
      kanten.push({
        von: 'block-' + block.id, nach: feld.key,
        art: 'zugehoerig', gerichtet: false,
        laenge: 74 + block.fields.length * 3.2
      });
    });

    function kante(von, nach, art) {
      var schluessel = von + '>' + nach + '>' + art;
      if (gesehen[schluessel]) { return; }
      gesehen[schluessel] = true;
      kanten.push({ von: von, nach: nach, art: art, gerichtet: true, laenge: 130 });
    }

    alleFelder().forEach(function (eintrag) {
      var feld = eintrag.feld;
      if (feld.visibleWhen && feld.visibleWhen.field) { kante(feld.visibleWhen.field, feld.key, 'sichtbarkeit'); }
      if (feld.derivedFrom && feld.derivedFrom.field) { kante(feld.derivedFrom.field, feld.key, 'sichtbarkeit'); }
      if (feld.optionsFrom) { kante(feld.optionsFrom, feld.key, 'auswahl'); }
      if (feld.computedFrom) { kante(feld.computedFrom, feld.key, 'berechnung'); }
    });

    return { knoten: knoten, kanten: kanten, seed: 7 };
  }

  /* ------------------------------------------------------ Akteursnetz */

  function akteursNetz() {
    var knoten = [], kanten = [];
    var laender = {}, felder = {};

    AKTEURE.forEach(function (a) {
      a.activeInStates.forEach(function (s) { laender[s.key] = s.label; });
      felder[a.primaryFieldOfAction] = true;
    });

    var ankerAkteur = { x: BREITE * 0.50, y: HOEHE * 0.50 };
    var ankerLand = { x: BREITE * 0.18, y: HOEHE * 0.50 };
    var ankerFeld = { x: BREITE * 0.84, y: HOEHE * 0.50 };

    Object.keys(laender).sort().forEach(function (key) {
      var anzahl = AKTEURE.filter(function (a) {
        return a.activeInStates.some(function (s) { return s.key === key; });
      }).length;
      knoten.push({
        id: 'land-' + key, label: laender[key], gruppe: 'd', gross: true,
        radius: 8 + Math.min(10, anzahl * 1.1), anker: ankerLand, art: 'land',
        schluessel: key, anzahl: anzahl,
        ariaLabel: 'Bundesland ' + laender[key] + ', ' + anzahl + (anzahl === 1 ? ' Akteur' : ' Akteure')
      });
    });

    Object.keys(felder).forEach(function (key) {
      var label = beschriftung(VOK.handlungsfelder, key);
      var anzahl = AKTEURE.filter(function (a) { return a.primaryFieldOfAction === key; }).length;
      knoten.push({
        id: 'feld-' + key, label: label, gruppe: 'c', gross: true,
        radius: 8 + Math.min(10, anzahl * 1.6), anker: ankerFeld, art: 'handlungsfeld',
        schluessel: key, anzahl: anzahl,
        ariaLabel: 'Handlungsfeld ' + label + ', Schwerpunkt von ' + anzahl + (anzahl === 1 ? ' Akteur' : ' Akteuren')
      });
    });

    AKTEURE.forEach(function (a) {
      knoten.push({
        id: 'akteur-' + a.id, label: '', gruppe: 'a', radius: 5,
        anker: ankerAkteur, art: 'akteur', akteur: a,
        ariaLabel: a.name + ', ' + beschriftung(VOK.reichweiten, a.scope)
      });
      a.activeInStates.forEach(function (s) {
        kanten.push({ von: 'akteur-' + a.id, nach: 'land-' + s.key, art: 'zugehoerig', laenge: 110 });
      });
      kanten.push({ von: 'akteur-' + a.id, nach: 'feld-' + a.primaryFieldOfAction, art: 'zugehoerig', laenge: 110 });
    });

    return { knoten: knoten, kanten: kanten, seed: 23 };
  }

  function beschriftung(optionen, wert) {
    for (var i = 0; i < optionen.length; i++) {
      if (optionen[i].value === wert) { return optionen[i].label; }
    }
    return wert;
  }

  /* ---------------------------------------------------------- Details */

  function el(tag, attrs, kinder) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (name) {
      var wert = attrs[name];
      if (wert === null || wert === undefined || wert === false) { return; }
      if (name === 'text') { node.textContent = wert; return; }
      if (name === 'class') { node.className = wert; return; }
      node.setAttribute(name, wert);
    });
    (kinder || []).forEach(function (kind) { if (kind) { node.appendChild(kind); } });
    return node;
  }

  function zeile(bezeichnung, wert) {
    return el('div', { class: 'detail-zeile' }, [
      el('dt', { text: bezeichnung }),
      el('dd', { text: wert })
    ]);
  }

  function zeigeDetail(knoten, netz) {
    var ziel = document.getElementById('detail');
    ziel.textContent = '';

    if (!knoten) {
      ziel.appendChild(el('p', {
        class: 'detail-leer',
        text: 'Einen Knoten wählen — per Klick oder mit Tabulator und Eingabetaste. Die Nachbarschaft wird dann hervorgehoben.'
      }));
      return;
    }

    var liste = el('dl', { class: 'detailliste' });
    var kopf = el('h2', { class: 'detail-titel' });

    if (knoten.art === 'block') {
      kopf.textContent = knoten.block.title;
      liste.appendChild(zeile('Felder', String(knoten.block.fields.length)));
      var nachStufe = { P: 0, E: 0, O: 0, B: 0 };
      knoten.block.fields.forEach(function (f) { nachStufe[f.requirement] = (nachStufe[f.requirement] || 0) + 1; });
      liste.appendChild(zeile('Pflicht', String(nachStufe.P)));
      liste.appendChild(zeile('empfohlen', String(nachStufe.E)));
      liste.appendChild(zeile('optional', String(nachStufe.O)));
      if (nachStufe.B) { liste.appendChild(zeile('berechnet', String(nachStufe.B))); }
      ziel.appendChild(kopf);
      ziel.appendChild(el('p', { class: 'detail-hilfe', text: knoten.block.intro }));
      ziel.appendChild(liste);
      return;
    }

    if (knoten.art === 'feld') {
      var f = knoten.feld;
      kopf.textContent = f.label;
      liste.appendChild(zeile('Block', knoten.block.title));
      liste.appendChild(zeile('JSON-Schlüssel', f.key));
      liste.appendChild(zeile('Typ', f.type));
      liste.appendChild(zeile('Verbindlichkeit',
        { P: 'Pflicht', E: 'empfohlen', O: 'optional', B: 'berechnet' }[f.requirement] || '—'));
      if (f.options) { liste.appendChild(zeile('Vokabular', f.options.length + ' Werte')); }
      if (f.pending) { liste.appendChild(zeile('Status', 'zur Entscheidung in WS 4')); }
      ziel.appendChild(kopf);
      if (f.help) { ziel.appendChild(el('p', { class: 'detail-hilfe', text: f.help })); }
      ziel.appendChild(liste);
      ergaenzeBeziehungen(ziel, knoten, netz);
      return;
    }

    if (knoten.art === 'akteur') {
      var a = knoten.akteur;
      kopf.textContent = a.name;
      liste.appendChild(zeile('Rechtsform', beschriftung(VOK.rechtsformen, a.legalForm)));
      liste.appendChild(zeile('Reichweite', beschriftung(VOK.reichweiten, a.scope)));
      liste.appendChild(zeile('Schwerpunkt', beschriftung(VOK.handlungsfelder, a.primaryFieldOfAction)));
      liste.appendChild(zeile('Handlungsfelder', a.fieldsOfAction.map(function (v) {
        return beschriftung(VOK.handlungsfelder, v);
      }).join(' · ')));
      liste.appendChild(zeile('Bildungsabschnitte', a.educationStages.map(function (v) {
        return beschriftung(VOK.bildungsabschnitte, v);
      }).join(' · ')));
      liste.appendChild(zeile('Aktiv in', a.activeInStates.length
        ? a.activeInStates.map(function (s) { return s.label; }).join(' · ') : '—'));
      liste.appendChild(zeile('Verwirklichung', beschriftung(VOK.verwirklichung, a.implementation.value)));
      ziel.appendChild(kopf);
      ziel.appendChild(liste);
      return;
    }

    // Bundesland oder Handlungsfeld
    kopf.textContent = knoten.label;
    var betroffene = AKTEURE.filter(function (a) {
      return knoten.art === 'land'
        ? a.activeInStates.some(function (s) { return s.key === knoten.schluessel; })
        : a.primaryFieldOfAction === knoten.schluessel;
    });
    liste.appendChild(zeile(knoten.art === 'land' ? 'Bundesland' : 'Handlungsfeld', knoten.label));
    liste.appendChild(zeile('Akteure', String(betroffene.length)));
    ziel.appendChild(kopf);
    ziel.appendChild(liste);
    ziel.appendChild(el('ul', { class: 'detail-akteure' }, betroffene.slice(0, 12).map(function (a) {
      return el('li', { text: a.name });
    })));
    if (betroffene.length > 12) {
      ziel.appendChild(el('p', { class: 'detail-mehr', text: '… und ' + (betroffene.length - 12) + ' weitere' }));
    }
  }

  function ergaenzeBeziehungen(ziel, knoten, netz) {
    var raus = netz.kanten.filter(function (e) { return e.von === knoten.id; });
    var rein = netz.kanten.filter(function (e) { return e.nach === knoten.id; });
    if (!raus.length && !rein.length) {
      ziel.appendChild(el('p', { class: 'detail-mehr', text: 'Dieses Feld steht in keiner konditionalen Abhängigkeit.' }));
      return;
    }
    function namen(id) {
      var treffer = netz.knoten.filter(function (k) { return k.id === id; })[0];
      return treffer ? treffer.label : id;
    }
    var ul = el('ul', { class: 'detail-beziehungen' });
    rein.forEach(function (e) {
      ul.appendChild(el('li', { text: namen(e.von) + ' ' + ARTEN[e.art] + ' dieses Feld' }));
    });
    raus.forEach(function (e) {
      ul.appendChild(el('li', { text: 'Dieses Feld ' + ARTEN[e.art] + ': ' + namen(e.nach) }));
    });
    ziel.appendChild(el('h3', { class: 'detail-untertitel', text: 'Abhängigkeiten' }));
    ziel.appendChild(ul);
  }

  /* ------------------------------------------------- Textalternative */

  function baueTextfassung(netz, ansicht) {
    var ziel = document.getElementById('textfassung-inhalt');
    ziel.textContent = '';
    var nachId = {};
    netz.knoten.forEach(function (k) { nachId[k.id] = k; });

    ziel.appendChild(el('p', {
      text: netz.knoten.length + ' Knoten, ' + netz.kanten.length + ' Verbindungen.'
    }));

    if (ansicht === 'schema') {
      var zugehoerig = netz.kanten.filter(function (e) { return e.art === 'zugehoerig'; });
      if (zugehoerig.length) {
        var proBlock = {};
        zugehoerig.forEach(function (e) {
          var b = (nachId[e.von] || {}).label || e.von;
          (proBlock[b] = proBlock[b] || []).push((nachId[e.nach] || {}).label || e.nach);
        });
        var ulBloecke = el('ul', { class: 'detail-beziehungen' });
        Object.keys(proBlock).forEach(function (b) {
          ulBloecke.appendChild(el('li', { text: b + ': ' + proBlock[b].join(', ') }));
        });
        ziel.appendChild(el('h3', { class: 'detail-untertitel', text: 'Felder je Block' }));
        ziel.appendChild(ulBloecke);
        ziel.appendChild(el('h3', { class: 'detail-untertitel', text: 'Konditionale Abhängigkeiten' }));
      }

      var tabelle = el('table', { class: 'textfassung-tabelle' }, [
        el('thead', {}, [el('tr', {}, [
          el('th', { scope: 'col', text: 'Von' }),
          el('th', { scope: 'col', text: 'Beziehung' }),
          el('th', { scope: 'col', text: 'Nach' })
        ])])
      ]);
      var tbody = el('tbody', {});
      netz.kanten.filter(function (e) { return e.art !== 'zugehoerig'; }).forEach(function (e) {
        tbody.appendChild(el('tr', {}, [
          el('td', { text: (nachId[e.von] || {}).label || e.von }),
          el('td', { text: ARTEN[e.art] || e.art }),
          el('td', { text: (nachId[e.nach] || {}).label || e.nach })
        ]));
      });
      tabelle.appendChild(tbody);
      ziel.appendChild(tabelle);
      return;
    }

    var tab2 = el('table', { class: 'textfassung-tabelle' }, [
      el('thead', {}, [el('tr', {}, [
        el('th', { scope: 'col', text: 'Akteur' }),
        el('th', { scope: 'col', text: 'Schwerpunkt' }),
        el('th', { scope: 'col', text: 'Aktiv in' })
      ])])
    ]);
    var tb = el('tbody', {});
    AKTEURE.forEach(function (a) {
      tb.appendChild(el('tr', {}, [
        el('td', { text: a.name }),
        el('td', { text: beschriftung(VOK.handlungsfelder, a.primaryFieldOfAction) }),
        el('td', { text: a.activeInStates.map(function (s) { return s.label; }).join(', ') || '—' })
      ]));
    });
    tab2.appendChild(tb);
    ziel.appendChild(tab2);
  }

  /* ------------------------------------------------------------ Start */

  var aktuellesNetz = null;

  function zeigeAnsicht(ansicht) {
    var netz = ansicht === 'schema' ? schemaNetz() : akteursNetz();
    aktuellesNetz = netz;

    window.EduNetz.layout(netz.knoten, netz.kanten, {
      breite: BREITE, hoehe: HOEHE, seed: netz.seed,
      abstossung: ansicht === 'schema' ? 2000 : 2200,
      ankerkraft: ansicht === 'schema' ? 0.055 : 0.018
    });

    window.EduNetz.zeichne(document.getElementById('netz'), netz.knoten, netz.kanten, {
      breite: BREITE, hoehe: HOEHE,
      beiAuswahl: function (knoten) { zeigeDetail(knoten, netz); },
      beiVorschau: function (knoten) { zeigeDetail(knoten, netz); }
    });

    zeigeDetail(null, netz);
    baueTextfassung(netz, ansicht);

    document.getElementById('netz-erklaerung').textContent = ansicht === 'schema'
      ? 'Jeder Knoten ist ein Feld des Schemas, die Farbe zeigt den Block. Pfeile sind konditionale Abhängigkeiten — sie sind aus fields.js abgeleitet, nicht von Hand gezeichnet.'
      : 'Jeder kleine Knoten ist ein Datensatz. Die großen Knoten sind die Schlüssel, über die Datensätze verschiedener Verbände zusammenfinden: Bundesland und Handlungsfeld.';

    document.getElementById('legende-mitte').textContent = ansicht === 'schema'
      ? 'C · Tätigkeitsprofil' : 'Handlungsfeld';
    document.getElementById('legende-links').textContent = ansicht === 'schema'
      ? 'A · Identität' : 'Akteur (Datensatz)';
    document.getElementById('legende-rechts').textContent = ansicht === 'schema'
      ? 'D · Wirkungsraum' : 'Bundesland';
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll('input[name="ansicht"]'), function (radio) {
      radio.addEventListener('change', function () {
        if (radio.checked) { zeigeAnsicht(radio.value); }
      });
    });
    zeigeAnsicht('schema');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
