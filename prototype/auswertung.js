/*
 * Auswertungsansicht.
 *
 * Zweck: zeigen, was der Standard ermoeglicht — fuer Menschen, die mit einem
 * Austauschformat nichts anfangen koennen. Die JSON-Vorschau im Formular ist
 * fuer ein datenaffines Publikum richtig; fuer zivilgesellschaftliche
 * Organisationen ist sie zu technisch.
 *
 * Gerechnet wird ausschliesslich aus data/beispiel.json. In dieser Datei steht
 * keine einzige Zahl aus dem Datenbestand — sonst liefe die Ansicht
 * auseinander, sobald der Beispieldatensatz durch echte Daten ersetzt wird.
 *
 * Kein Diagrammwerkzeug von aussen: Inline-SVG und einfache Balken genuegen
 * und halten die Offline-Tauglichkeit.
 */

(function () {
  'use strict';

  var DATEN = (window.EduStandard && window.EduStandard.beispieldaten) || null;
  var V = window.EduVocab;

  function el(tag, attrs, kinder) {
    var knoten = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (name) {
      var wert = attrs[name];
      if (wert === null || wert === undefined) { return; }
      if (name === 'text') { knoten.textContent = wert; return; }
      knoten.setAttribute(name, wert);
    });
    (kinder || []).forEach(function (kind) { knoten.appendChild(kind); });
    return knoten;
  }

  function svgEl(tag, attrs) {
    var knoten = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (name) {
      if (attrs[name] !== null && attrs[name] !== undefined) {
        knoten.setAttribute(name, attrs[name]);
      }
    });
    return knoten;
  }

  /* ------------------------------------------------------------ Zaehlen */

  /*
   * Eine Auswertung ist immer: Achse aus dem Vokabular, Werte aus den Daten.
   * Die Achse kommt aus dem Vokabular und nicht aus den Daten, damit ein Wert
   * mit null Treffern sichtbar bleibt. Gerade die leere Kategorie ist die
   * interessante: sie zeigt eine Luecke im Bestand.
   */
  function zaehle(vokabularId, holeWerte) {
    var achse = V.optionen(vokabularId);
    var zaehler = {};
    achse.forEach(function (o) { zaehler[o.value] = 0; });

    DATEN.akteure.forEach(function (a) {
      var werte = holeWerte(a) || [];
      if (!Array.isArray(werte)) { werte = [werte]; }
      werte.forEach(function (w) {
        if (Object.prototype.hasOwnProperty.call(zaehler, w)) { zaehler[w] += 1; }
      });
    });

    return achse.map(function (o) {
      return { key: o.value, label: o.label, anzahl: zaehler[o.value] };
    });
  }

  /* ------------------------------------------------------- Balkendiagramm */

  function balken(zeilen, optionen) {
    optionen = optionen || {};
    var hoechst = zeilen.reduce(function (m, z) { return Math.max(m, z.anzahl); }, 0) || 1;

    /*
     * Die Tabelle ist die Darstellung, nicht ein Anhang zum Diagramm. Sie
     * traegt die Zahlen, laesst sich vorlesen und druckt sauber. Der Balken
     * daneben ist die Zugabe.
     */
    var koerper = el('tbody');
    zeilen.forEach(function (z) {
      var anteil = Math.round((z.anzahl / hoechst) * 100);
      var leiste = el('div', { class: 'balken-huelle' }, [
        el('div', { class: 'balken' + (z.anzahl === 0 ? ' balken-leer' : '') })
      ]);
      leiste.firstChild.style.width = anteil + '%';

      koerper.appendChild(el('tr', { class: z.anzahl === 0 ? 'zeile-leer' : null }, [
        el('th', { scope: 'row', text: z.label }),
        el('td', { class: 'zahl', text: String(z.anzahl) }),
        el('td', { class: 'balkenzelle' }, [leiste])
      ]));
    });

    return el('table', { class: 'auswertungstabelle' }, [
      el('caption', { class: 'nur-sr', text: optionen.beschriftung || '' }),
      el('thead', {}, [
        el('tr', {}, [
          el('th', { scope: 'col', text: optionen.achse || 'Merkmal' }),
          el('th', { scope: 'col', text: 'Organisationen' }),
          el('th', { scope: 'col', class: 'nur-sr', text: 'Anteil am Höchstwert' })
        ])
      ]),
      koerper
    ]);
  }

  function abschnitt(titel, erlaeuterung, inhalt, achse) {
    var kinder = [
      el('h2', { text: titel }),
      el('p', { class: 'auswertung-lesehilfe', text: erlaeuterung })
    ];
    luecken(achse).forEach(function (l) { kinder.push(l); });
    kinder.push(inhalt);
    return el('section', { class: 'auswertungsblock' }, kinder);
  }

  /*
   * Eine leere Zeile ist normalerweise der interessante Befund. Wo sie aber
   * daher ruehrt, wie die Beispieldaten entstanden sind, waere genau diese
   * Lesart falsch. Solche Stellen stehen in beispiel.json unter luecken und
   * werden hier ausgewiesen — nicht im Code benannt, damit der Hinweis mit
   * den Daten verschwindet, sobald echte Daten einziehen.
   */
  function luecken(achse) {
    if (!achse) { return []; }
    return (DATEN.luecken || []).filter(function (l) { return l.achse === achse; })
      .map(function (l) {
        var name = V.beschriftung(l.achse, l.wert);
        return el('p', { class: 'auswertung-luecke', role: 'note' },
          [el('strong', { text: name + ' steht auf null. ' }), document.createTextNode(l.grund)]);
      });
  }

  /* ----------------------------------------------------------- Karte */

  /*
   * Eine echte Deutschlandkarte braeuchte Geometriedaten. Statt sie
   * nachzubilden, steht hier ein Raster aus 16 Feldern in grober
   * geografischer Anordnung — es beantwortet dieselbe Frage (wo ist wenig?)
   * ohne den Anschein kartografischer Genauigkeit.
   */
  var LAENDER_RASTER = [
    ['',   '01', '02', ''  ],   // Schleswig-Holstein, Hamburg
    ['04', '03', '13', ''  ],   // Bremen, Niedersachsen, Mecklenburg-Vorpommern
    ['05', '15', '12', '11'],   // Nordrhein-Westfalen, Sachsen-Anhalt, Brandenburg, Berlin
    ['06', '16', '14', ''  ],   // Hessen, Thüringen, Sachsen
    ['10', '07', '',   ''  ],   // Saarland, Rheinland-Pfalz
    ['',   '08', '09', ''  ]    // Baden-Württemberg, Bayern
  ];

  function laenderraster(zeilen) {
    var jeLand = {};
    zeilen.forEach(function (z) { jeLand[z.key] = z; });
    var hoechst = zeilen.reduce(function (m, z) { return Math.max(m, z.anzahl); }, 0) || 1;

    var breite = 4 * 74, hoehe = LAENDER_RASTER.length * 52;
    var svg = svgEl('svg', {
      viewBox: '0 0 ' + breite + ' ' + hoehe,
      role: 'img',
      class: 'laenderraster',
      'aria-label': 'Schematische Verteilung über die Bundesländer. Die Zahlen stehen in der Tabelle darunter.'
    });

    var gesetzt = {};
    LAENDER_RASTER.forEach(function (reihe, y) {
      reihe.forEach(function (schluessel, x) {
        if (!schluessel || gesetzt[schluessel]) { return; }
        gesetzt[schluessel] = true;
        var z = jeLand[schluessel] || { anzahl: 0, label: schluessel };
        // Sequenzielle Rampe: eine Farbe, unterschiedliche Helligkeit. Die
        // Zahl steht zusaetzlich im Feld — Farbe allein traegt nichts.
        var anteil = z.anzahl / hoechst;
        var g = svgEl('g', {});
        g.appendChild(svgEl('rect', {
          x: x * 74 + 3, y: y * 52 + 3, width: 68, height: 46, rx: 4,
          fill: z.anzahl === 0 ? '#F4F5F7' : 'rgba(31, 56, 100, ' + (0.12 + anteil * 0.72).toFixed(2) + ')',
          stroke: '#9BA1AC', 'stroke-width': 1
        }));
        var kuerzel = svgEl('text', {
          x: x * 74 + 37, y: y * 52 + 22, 'text-anchor': 'middle',
          class: 'raster-kuerzel', fill: anteil > 0.55 ? '#fff' : '#1B1D21'
        });
        kuerzel.textContent = z.label.slice(0, 12);
        var zahl = svgEl('text', {
          x: x * 74 + 37, y: y * 52 + 39, 'text-anchor': 'middle',
          class: 'raster-zahl', fill: anteil > 0.55 ? '#fff' : '#1B1D21'
        });
        zahl.textContent = String(z.anzahl);
        g.appendChild(kuerzel);
        g.appendChild(zahl);
        svg.appendChild(g);
      });
    });

    var figur = el('figure', { class: 'rasterfigur' }, [
      svg,
      el('figcaption', {
        text: 'Schematische Anordnung, keine maßstabsgetreue Karte. '
          + 'Die Zahlen stehen in der Tabelle daneben.'
      })
    ]);
    return el('div', { class: 'rasterblock' }, [figur, balken(zeilen, {
      achse: 'Bundesland', beschriftung: 'Organisationen je Bundesland'
    })]);
  }

  /* ------------------------------------------------------------- Aufbau */

  function baue() {
    var ziel = document.getElementById('auswertung-inhalt');
    var quelle = document.getElementById('auswertung-quelle');

    if (!DATEN) {
      quelle.textContent = 'Der Beispieldatensatz konnte nicht geladen werden.';
      return;
    }

    quelle.textContent = DATEN.akteure.length + ' Organisationen · Stand '
      + DATEN.stand + ' · ' + DATEN.hinweis;

    ziel.appendChild(abschnitt(
      'Wo wird gearbeitet',
      'Ohne gemeinsame Struktur lässt sich diese Frage über Plattformgrenzen '
        + 'hinweg nicht beantworten. Leere Felder sind hier die aussagekräftigen: '
        + 'Sie zeigen, wo im Bestand nichts liegt. Eine Organisation kann in '
        + 'mehreren Ländern wirken und dann mehrfach gezählt werden.',
      laenderraster(zaehle('bundeslaender', function (a) {
        return (a.activeInStates || []).map(function (s) { return s.key; });
      }))
    ));

    ziel.appendChild(abschnitt(
      'In welchen Handlungsfeldern',
      'Mehrfachnennung ist möglich, die Summe übersteigt deshalb die Zahl der '
        + 'Organisationen.',
      balken(zaehle('handlungsfelder', function (a) { return a.fieldsOfAction; }),
        { achse: 'Handlungsfeld', beschriftung: 'Organisationen je Handlungsfeld' })
    ));

    ziel.appendChild(abschnitt(
      'In welchen Bildungsbereichen',
      'Maßgeblich ist die Primärzielgruppe: in welcher Bildungsphase die '
        + 'Menschen stehen, die unmittelbar teilnehmen. Mehrfachnennung ist '
        + 'möglich, die Summe übersteigt deshalb die Zahl der Organisationen.',
      balken(zaehle('bildungsstruktur-bereiche', function (a) {
        return (a.educationStages || {}).werte;
      }), { achse: 'Bildungsbereich', beschriftung: 'Organisationen je Bildungsbereich' }),
      'bildungsstruktur-bereiche'
    ));

    ziel.appendChild(abschnitt(
      'Mit welcher Reichweite',
      'Reichweite ist nicht dasselbe wie Gebiet: Wer in einer Stadt tätig ist, '
        + 'ist nicht automatisch landesweit tätig.',
      balken(zaehle('reichweite', function (a) { return a.scope; }),
        { achse: 'Reichweite', beschriftung: 'Organisationen je Reichweitenstufe' })
    ));

    ziel.appendChild(abschnitt(
      'In welcher Rechtsform',
      'Die Rechtsform sagt etwas darüber, was eine Organisation an Aufwand '
        + 'für Datenpflege überhaupt aufbringen kann.',
      balken(zaehle('rechtsformen', function (a) { return a.legalForm; }),
        { achse: 'Rechtsform', beschriftung: 'Organisationen je Rechtsform' })
    ));

    ziel.appendChild(abschnitt(
      'Und was sich daraus ergibt, ohne dass es jemand ausfüllt',
      'Die Einordnung in die Sektorstatistik wird aus den Handlungsfeldern '
        + 'abgeleitet. Genau das ist der Punkt der Zweistufigkeit: '
        + 'bildungsspezifisch erfassen, sektorweit vergleichbar herausgeben. '
        + 'Mehrfachnennung schlägt durch: Mehrere Handlungsfelder können auf verschiedene Engagementfelder führen, '
        + 'die Summe übersteigt deshalb die Zahl der Organisationen.',
      balken(engagementfelder(), {
        achse: 'Engagementfeld', beschriftung: 'Organisationen je Engagementfeld, abgeleitet'
      })
    ));
  }

  /* Abgeleitete Achse: nicht erfasst, sondern ueber den Crosswalk gerechnet. */
  function engagementfelder() {
    var cw = V.vokabular('crosswalk-handlungsfelder');
    var achse = V.optionen('engagementfelder');
    var zaehler = {};
    achse.forEach(function (o) { zaehler[o.label] = 0; });

    DATEN.akteure.forEach(function (a) {
      var getroffen = {};
      (a.fieldsOfAction || []).forEach(function (key) {
        cw.eintraege.forEach(function (e) {
          if (e.handlungsfeld === key) { getroffen[e.engagementfeld] = true; }
        });
      });
      Object.keys(getroffen).forEach(function (feld) {
        if (Object.prototype.hasOwnProperty.call(zaehler, feld)) { zaehler[feld] += 1; }
      });
    });

    return achse.map(function (o) {
      return { key: o.value, label: o.label, anzahl: zaehler[o.label] };
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', baue);
  } else {
    baue();
  }
})();
