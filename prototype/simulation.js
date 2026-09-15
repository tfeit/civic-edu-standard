/*
 * Verschneidung — Kreuztabelle zweier Merkmale als Heatmap.
 *
 * Die Darstellung ist eine echte HTML-Tabelle mit Zeilen- und Spaltenkoepfen.
 * Damit ist die Tabellenansicht nicht ein Zusatz zur Grafik, sondern die
 * Grafik selbst: jede Zelle traegt ihre Zahl im Text, die Farbe wiederholt
 * sie nur. Das haelt die Darstellung ohne Farbe lesbar.
 */

(function () {
  'use strict';

  var VOK = window.EduStandard.vokabulare;
  var AKTEURE = window.EduStandard.akteure;

  /* ------------------------------------------------------- Dimensionen */

  // Jede Dimension sagt, welche Auspraegungen ein Akteur hat. Mehrwertige
  // Dimensionen zaehlen einen Akteur in mehreren Zellen — darauf weist die
  // Fusszeile hin, sonst wirken die Summen falsch.
  var DIMENSIONEN = [
    {
      id: 'bundesland', label: 'Bundesland', mehrwertig: true,
      werte: function () { return VOK.bundeslaender; },
      von: function (a) { return a.activeInStates.map(function (s) { return s.key; }); }
    },
    {
      id: 'handlungsfeld', label: 'Handlungsfeld', mehrwertig: true,
      werte: function () { return VOK.handlungsfelder; },
      von: function (a) { return a.fieldsOfAction; }
    },
    {
      id: 'bildungsbereich', label: 'Bildungsbereich', mehrwertig: true,
      werte: function () { return VOK.bildungsbereiche; },
      von: function (a) { return a.educationStages.werte; }
    },
    {
      id: 'zielgruppe', label: 'Zielgruppenrolle', mehrwertig: true,
      werte: function () { return VOK.zielgruppenrollen; },
      von: function (a) { return a.targetGroups.map(function (t) { return t.role; }); }
    },
    {
      id: 'reichweite', label: 'Reichweite', mehrwertig: false,
      werte: function () { return VOK.reichweiten; },
      von: function (a) { return [a.scope]; }
    },
    {
      id: 'rechtsform', label: 'Rechtsform', mehrwertig: false,
      werte: function () { return VOK.rechtsformen; },
      von: function (a) { return [a.legalForm]; }
    },
    {
      id: 'verwirklichung', label: 'Verwirklichung', mehrwertig: false,
      werte: function () { return VOK.verwirklichung; },
      von: function (a) { return [a.implementation.value]; }
    }
  ];

  function dimension(id) {
    for (var i = 0; i < DIMENSIONEN.length; i++) {
      if (DIMENSIONEN[i].id === id) { return DIMENSIONEN[i]; }
    }
    return DIMENSIONEN[0];
  }

  var zustand = {
    zeile: 'handlungsfeld',
    spalte: 'bundesland',
    filterReichweite: '',
    filterVerwirklichung: '',
    sortierung: 'menge',
    zelle: null
  };

  /* -------------------------------------------------------------- Helfer */

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

  function ausschnitt() {
    return AKTEURE.filter(function (a) {
      if (zustand.filterReichweite && a.scope !== zustand.filterReichweite) { return false; }
      if (zustand.filterVerwirklichung && a.implementation.value !== zustand.filterVerwirklichung) { return false; }
      return true;
    });
  }

  /* ------------------------------------------------------ Kreuztabelle */

  function baueMatrix() {
    var dZeile = dimension(zustand.zeile), dSpalte = dimension(zustand.spalte);
    var menge = ausschnitt();

    var zeilen = dZeile.werte().slice();
    var spalten = dSpalte.werte().slice();

    var zellen = {};
    var zeilenSumme = {}, spaltenSumme = {};

    menge.forEach(function (a) {
      var zw = dZeile.von(a), sw = dSpalte.von(a);
      zw.forEach(function (z) {
        zeilenSumme[z] = (zeilenSumme[z] || 0) + 1;
        sw.forEach(function (s) {
          var k = z + '|' + s;
          (zellen[k] = zellen[k] || []).push(a);
        });
      });
      sw.forEach(function (s) { spaltenSumme[s] = (spaltenSumme[s] || 0) + 1; });
    });

    // Leere Zeilen und Spalten weglassen: sie tragen nichts und kosten Breite.
    zeilen = zeilen.filter(function (z) { return zeilenSumme[z.value]; });
    spalten = spalten.filter(function (s) { return spaltenSumme[s.value]; });

    if (zustand.sortierung === 'menge') {
      zeilen.sort(function (a, b) { return (zeilenSumme[b.value] || 0) - (zeilenSumme[a.value] || 0); });
      spalten.sort(function (a, b) { return (spaltenSumme[b.value] || 0) - (spaltenSumme[a.value] || 0); });
    }

    var max = 0;
    Object.keys(zellen).forEach(function (k) { max = Math.max(max, zellen[k].length); });

    return {
      dZeile: dZeile, dSpalte: dSpalte, zeilen: zeilen, spalten: spalten,
      zellen: zellen, zeilenSumme: zeilenSumme, spaltenSumme: spaltenSumme,
      max: max, menge: menge
    };
  }

  // Sequenzielle Rampe: eine Farbe, hell nach dunkel. Stufe 0 bleibt ungefaerbt,
  // damit "keine Akteure" nicht wie ein kleiner Wert aussieht.
  //
  // Bei kleinen Hoechstwerten bekommt jeder Akteur eine eigene Stufe. Sonst
  // faerbte eine Zelle mit drei Akteuren im dunkelsten Ton und liesse die
  // hellen Stufen ungenutzt — die Skala wuerde Menge vortaeuschen.
  function stufe(wert, max) {
    if (!wert) { return 0; }
    if (max <= 7) { return wert; }
    return Math.max(1, Math.min(7, Math.ceil(wert / max * 7)));
  }

  function zeichneTabelle() {
    var m = baueMatrix();
    var ziel = document.getElementById('matrix');
    ziel.textContent = '';

    if (!m.zeilen.length || !m.spalten.length) {
      ziel.appendChild(el('p', { class: 'leer-hinweis', text: 'Der Ausschnitt enthält keine Akteure. Bitte einen Filter lockern.' }));
      aktualisiereFuss(m);
      return;
    }

    var tabelle = el('table', { class: 'matrix-tabelle' });
    tabelle.appendChild(el('caption', {
      class: 'nur-sr',
      text: m.dZeile.label + ' gegen ' + m.dSpalte.label + ', Anzahl Akteure je Kombination'
    }));

    var kopfZeile = el('tr', {}, [
      el('th', { scope: 'col', class: 'ecke', text: m.dZeile.label + ' ↓ / ' + m.dSpalte.label + ' →' })
    ]);
    m.spalten.forEach(function (s) {
      kopfZeile.appendChild(el('th', { scope: 'col', class: 'kopf-spalte' }, [
        el('span', { class: 'kopf-text', text: s.label })
      ]));
    });
    kopfZeile.appendChild(el('th', { scope: 'col', class: 'summe-kopf', text: 'Akteure' }));
    tabelle.appendChild(el('thead', {}, [kopfZeile]));

    var tbody = el('tbody', {});
    m.zeilen.forEach(function (z) {
      var tr = el('tr', {}, [el('th', { scope: 'row', class: 'kopf-zeile', text: z.label })]);
      m.spalten.forEach(function (s) {
        var liste = m.zellen[z.value + '|' + s.value] || [];
        var n = liste.length;
        var st = stufe(n, m.max);
        var gewaehlt = zustand.zelle && zustand.zelle.z === z.value && zustand.zelle.s === s.value;
        var td = el('td', {
          class: 'zelle stufe-' + st + (n ? '' : ' leer') + (gewaehlt ? ' gewaehlt' : ''),
          tabindex: n ? '0' : null,
          role: n ? 'button' : null,
          'aria-label': n
            ? n + ' Akteure: ' + z.label + ', ' + s.label
            : 'keine Akteure: ' + z.label + ', ' + s.label,
          'aria-pressed': n ? (gewaehlt ? 'true' : 'false') : null,
          title: z.label + ' × ' + s.label + ': ' + n
        }, [el('span', { class: 'zellwert', text: n ? String(n) : '·' })]);

        if (n) {
          td.addEventListener('click', function () { waehleZelle(z, s, liste); });
          td.addEventListener('keydown', function (ereignis) {
            if (ereignis.key === 'Enter' || ereignis.key === ' ') {
              ereignis.preventDefault(); waehleZelle(z, s, liste);
            }
          });
        }
        tr.appendChild(td);
      });
      tr.appendChild(el('td', { class: 'summe', text: String(m.zeilenSumme[z.value] || 0) }));
      tbody.appendChild(tr);
    });
    tabelle.appendChild(tbody);

    var fussZeile = el('tr', {}, [el('th', { scope: 'row', class: 'kopf-zeile summe-kopf', text: 'Akteure' })]);
    m.spalten.forEach(function (s) {
      fussZeile.appendChild(el('td', { class: 'summe', text: String(m.spaltenSumme[s.value] || 0) }));
    });
    fussZeile.appendChild(el('td', { class: 'summe' }));
    tabelle.appendChild(el('tfoot', {}, [fussZeile]));

    ziel.appendChild(tabelle);
    zeichneSkala(m.max);
    aktualisiereFuss(m);
  }

  function waehleZelle(z, s, liste) {
    var schonGewaehlt = zustand.zelle && zustand.zelle.z === z.value && zustand.zelle.s === s.value;
    zustand.zelle = schonGewaehlt ? null : { z: z.value, s: s.value };
    zeichneTabelle();
    zeigeAuswahl(schonGewaehlt ? null : { z: z, s: s, liste: liste });
  }

  function zeigeAuswahl(auswahl) {
    var ziel = document.getElementById('auswahl');
    ziel.textContent = '';
    if (!auswahl) {
      ziel.appendChild(el('p', {
        class: 'detail-leer',
        text: 'Eine Zelle wählen — per Klick oder mit Tabulator und Eingabetaste. Die Akteure dieser Kombination erscheinen hier.'
      }));
      return;
    }
    ziel.appendChild(el('h2', { class: 'detail-titel', text: auswahl.z.label + ' × ' + auswahl.s.label }));
    ziel.appendChild(el('p', {
      class: 'detail-hilfe',
      text: auswahl.liste.length === 1
        ? 'Ein Akteur in dieser Kombination.'
        : auswahl.liste.length + ' Akteure in dieser Kombination.'
    }));
    ziel.appendChild(el('ul', { class: 'detail-akteure' }, auswahl.liste.map(function (a) {
      return el('li', {}, [
        el('span', { class: 'akteur-name', text: a.name }),
        el('span', { class: 'akteur-zusatz', text: beschriftung(VOK.reichweiten, a.scope) + ' · ' + beschriftung(VOK.verwirklichung, a.implementation.value) })
      ]);
    })));
  }

  function beschriftung(optionen, wert) {
    for (var i = 0; i < optionen.length; i++) {
      if (optionen[i].value === wert) { return optionen[i].label; }
    }
    return wert;
  }

  // Die Skala zeigt genau die Stufen, die in der Tabelle vorkommen — nicht
  // mehr. Sonst suggeriert sie einen Wertebereich, den es nicht gibt.
  function zeichneSkala(max) {
    var ziel = document.getElementById('skala');
    ziel.textContent = '';
    ziel.appendChild(el('span', { class: 'skala-text', text: 'Akteure je Zelle' }));
    ziel.appendChild(el('span', { class: 'skala-text skala-marke', text: '0' }));
    var leiste = el('span', { class: 'skala-leiste' });
    var bis = max <= 7 ? max : 7;
    for (var i = 0; i <= bis; i++) {
      leiste.appendChild(el('span', {
        class: 'skala-feld stufe-' + i + (i === 0 ? ' leer' : ''),
        title: max <= 7 ? String(i) : null
      }));
    }
    ziel.appendChild(leiste);
    ziel.appendChild(el('span', { class: 'skala-text skala-marke', text: String(max) }));
  }

  function aktualisiereFuss(m) {
    document.getElementById('kennzahl-ausschnitt').textContent =
      m.menge.length + ' von ' + AKTEURE.length + ' Akteuren im Ausschnitt';
    var mehrfach = [];
    if (m.dZeile.mehrwertig) { mehrfach.push(m.dZeile.label); }
    if (m.dSpalte.mehrwertig) { mehrfach.push(m.dSpalte.label); }
    /*
     * Die Randwerte zaehlen Akteure, nicht Zellen. Ein Akteur mit mehreren
     * Werten auf der anderen Achse steht in mehreren Zellen, am Rand aber nur
     * einmal; ein Akteur ohne Wert auf der anderen Achse steht am Rand, aber
     * in keiner Zelle. Beides laesst Zellen und Rand auseinandergehen — in
     * beide Richtungen. Wer das nicht weiss, haelt die Tabelle fuer falsch.
     */
    document.getElementById('mehrfach-hinweis').textContent = mehrfach.length
      ? 'Mehrfachnennungen bei: ' + mehrfach.join(' und ') + '. Die Randwerte zählen '
        + 'Akteure, nicht Zellen: Wer mehrere Werte angibt, steht in mehreren Zellen, '
        + 'am Rand aber nur einmal. Wer auf der anderen Achse nichts angibt, steht am '
        + 'Rand, aber in keiner Zelle. Zellen und Rand summieren sich deshalb nicht auf.'
      : 'Jeder Akteur zählt in genau einer Zelle; die Randwerte sind die Zeilen- und Spaltensummen.';
  }

  /* --------------------------------------------------------- Bedienung */

  function fuelleAuswahlfelder() {
    var zeileFeld = document.getElementById('achse-zeile');
    var spalteFeld = document.getElementById('achse-spalte');
    DIMENSIONEN.forEach(function (d) {
      zeileFeld.appendChild(el('option', { value: d.id, text: d.label }));
      spalteFeld.appendChild(el('option', { value: d.id, text: d.label }));
    });
    zeileFeld.value = zustand.zeile;
    spalteFeld.value = zustand.spalte;

    var reichweite = document.getElementById('filter-reichweite');
    VOK.reichweiten.forEach(function (o) {
      reichweite.appendChild(el('option', { value: o.value, text: o.label }));
    });
    var verwirklichung = document.getElementById('filter-verwirklichung');
    VOK.verwirklichung.forEach(function (o) {
      verwirklichung.appendChild(el('option', { value: o.value, text: o.label }));
    });
  }

  function neuZeichnen() {
    zustand.zelle = null;
    zeigeAuswahl(null);
    zeichneTabelle();
  }

  function start() {
    fuelleAuswahlfelder();

    document.getElementById('achse-zeile').addEventListener('change', function () {
      zustand.zeile = this.value;
      // Zwei gleiche Achsen ergeben nur eine Diagonale — die zweite ausweichen.
      if (zustand.spalte === zustand.zeile) {
        var andere = DIMENSIONEN.filter(function (d) { return d.id !== zustand.zeile; })[0];
        zustand.spalte = andere.id;
        document.getElementById('achse-spalte').value = andere.id;
      }
      neuZeichnen();
    });
    document.getElementById('achse-spalte').addEventListener('change', function () {
      zustand.spalte = this.value;
      if (zustand.spalte === zustand.zeile) {
        var andere = DIMENSIONEN.filter(function (d) { return d.id !== zustand.spalte; })[0];
        zustand.zeile = andere.id;
        document.getElementById('achse-zeile').value = andere.id;
      }
      neuZeichnen();
    });
    document.getElementById('achse-tauschen').addEventListener('click', function () {
      var h = zustand.zeile; zustand.zeile = zustand.spalte; zustand.spalte = h;
      document.getElementById('achse-zeile').value = zustand.zeile;
      document.getElementById('achse-spalte').value = zustand.spalte;
      neuZeichnen();
    });
    document.getElementById('filter-reichweite').addEventListener('change', function () {
      zustand.filterReichweite = this.value; neuZeichnen();
    });
    document.getElementById('filter-verwirklichung').addEventListener('change', function () {
      zustand.filterVerwirklichung = this.value; neuZeichnen();
    });
    document.getElementById('sortierung').addEventListener('change', function () {
      zustand.sortierung = this.value; neuZeichnen();
    });
    document.getElementById('filter-zuruecksetzen').addEventListener('click', function () {
      zustand.filterReichweite = '';
      zustand.filterVerwirklichung = '';
      document.getElementById('filter-reichweite').value = '';
      document.getElementById('filter-verwirklichung').value = '';
      neuZeichnen();
    });

    zeigeAuswahl(null);
    zeichneTabelle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
