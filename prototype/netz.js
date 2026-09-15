/*
 * Netzdarstellung — Kraftlayout und SVG-Zeichnung.
 *
 * Kein Framework, keine Bibliothek. Das Layout ist deterministisch: gleicher
 * Seed, gleiche Anordnung. Im Workshop sieht die Grafik damit bei jedem
 * Aufruf gleich aus, was das Erklaeren erleichtert.
 */

(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  /* ------------------------------------------------------------ Helfer */

  function svgEl(tag, attrs) {
    var node = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (name) {
      var wert = attrs[name];
      if (wert === null || wert === undefined || wert === false) { return; }
      if (name === 'text') { node.textContent = wert; return; }
      node.setAttribute(name, wert);
    });
    return node;
  }

  // Deterministischer Zufall (mulberry32) — gleicher Seed, gleiches Bild.
  function prng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function wenigerBewegung() {
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------------------------------------------------------- Layout */

  /*
   * Kraftgesteuertes Layout: Abstossung zwischen allen Knoten, Federn
   * entlang der Kanten, Zug zur Mitte und — sofern gesetzt — zum Anker des
   * eigenen Clusters. Feste Iterationszahl statt Abbruchkriterium, damit
   * das Ergebnis reproduzierbar bleibt.
   */
  function berechneLayout(knoten, kanten, opt) {
    opt = opt || {};
    var breite = opt.breite || 960;
    var hoehe = opt.hoehe || 620;
    var schritte = opt.schritte || 320;
    var zufall = prng(opt.seed || 1);

    var nachIndex = {};
    knoten.forEach(function (k, i) {
      nachIndex[k.id] = i;
      // Start auf einem Kreis plus Rauschen: vermeidet entartete Startlagen.
      var winkel = (i / knoten.length) * Math.PI * 2;
      var radius = Math.min(breite, hoehe) * 0.32 * (0.6 + zufall() * 0.5);
      k.x = breite / 2 + Math.cos(winkel) * radius;
      k.y = hoehe / 2 + Math.sin(winkel) * radius;
      k.vx = 0; k.vy = 0;
    });

    var paare = kanten.map(function (e) {
      return { a: nachIndex[e.von], b: nachIndex[e.nach], laenge: e.laenge || opt.federlaenge || 90 };
    }).filter(function (p) { return p.a !== undefined && p.b !== undefined; });

    // Knoten mit vielen Kanten sollen sich weniger bewegen lassen.
    var grad = knoten.map(function () { return 1; });
    paare.forEach(function (p) { grad[p.a]++; grad[p.b]++; });

    for (var schritt = 0; schritt < schritte; schritt++) {
      var alpha = 1 - schritt / schritte;

      // Abstossung
      for (var i = 0; i < knoten.length; i++) {
        for (var j = i + 1; j < knoten.length; j++) {
          var a = knoten[i], b = knoten[j];
          var dx = b.x - a.x, dy = b.y - a.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 1) { d2 = 1; dx = (zufall() - 0.5); dy = (zufall() - 0.5); }
          var d = Math.sqrt(d2);
          var kraft = (opt.abstossung || 2600) / d2;
          var fx = dx / d * kraft, fy = dy / d * kraft;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }

      // Federn
      paare.forEach(function (p) {
        var a = knoten[p.a], b = knoten[p.b];
        var dx = b.x - a.x, dy = b.y - a.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        var kraft = (d - p.laenge) * 0.06;
        var fx = dx / d * kraft, fy = dy / d * kraft;
        a.vx += fx / Math.sqrt(grad[p.a]); a.vy += fy / Math.sqrt(grad[p.a]);
        b.vx -= fx / Math.sqrt(grad[p.b]); b.vy -= fy / Math.sqrt(grad[p.b]);
      });

      // Mitte und Clusteranker
      knoten.forEach(function (k) {
        k.vx += (breite / 2 - k.x) * 0.006;
        k.vy += (hoehe / 2 - k.y) * 0.006;
        if (k.anker) {
          k.vx += (k.anker.x - k.x) * (opt.ankerkraft || 0.035);
          k.vy += (k.anker.y - k.y) * (opt.ankerkraft || 0.035);
        }
      });

      // Bewegen und daempfen
      knoten.forEach(function (k) {
        k.vx *= 0.82; k.vy *= 0.82;
        k.x += k.vx * alpha; k.y += k.vy * alpha;
      });
    }

    // In den sichtbaren Bereich einpassen
    var rand = opt.rand || 46;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    knoten.forEach(function (k) {
      minX = Math.min(minX, k.x); maxX = Math.max(maxX, k.x);
      minY = Math.min(minY, k.y); maxY = Math.max(maxY, k.y);
    });
    var sx = (breite - 2 * rand) / Math.max(1, maxX - minX);
    var sy = (hoehe - 2 * rand) / Math.max(1, maxY - minY);
    var s = Math.min(sx, sy, 1.6);
    knoten.forEach(function (k) {
      k.x = rand + (k.x - minX) * s + (breite - 2 * rand - (maxX - minX) * s) / 2;
      k.y = rand + (k.y - minY) * s + (hoehe - 2 * rand - (maxY - minY) * s) / 2;
    });
    return knoten;
  }

  /* --------------------------------------------------------- Zeichnen */

  /*
   * Zeichnet ein berechnetes Netz in ein SVG. Gibt ein kleines Objekt mit
   * Methoden zurueck, ueber das die aufrufende Seite Hervorhebung und
   * Auswahl steuert.
   */
  function zeichne(svg, knoten, kanten, opt) {
    opt = opt || {};
    var breite = opt.breite || 960;
    var hoehe = opt.hoehe || 620;

    svg.setAttribute('viewBox', '0 0 ' + breite + ' ' + hoehe);
    svg.setAttribute('role', 'application');
    svg.textContent = '';

    var nachId = {};
    knoten.forEach(function (k) { nachId[k.id] = k; });

    // Nachbarschaft fuer die Hervorhebung
    var nachbarn = {};
    knoten.forEach(function (k) { nachbarn[k.id] = {}; });
    kanten.forEach(function (e) {
      if (!nachbarn[e.von] || !nachbarn[e.nach]) { return; }
      nachbarn[e.von][e.nach] = true;
      nachbarn[e.nach][e.von] = true;
    });

    var gKanten = svgEl('g', { class: 'netz-kanten' });
    var gKnoten = svgEl('g', { class: 'netz-knoten' });
    svg.appendChild(gKanten);
    svg.appendChild(gKnoten);

    var kantenKnoten = [];
    kanten.forEach(function (e) {
      var a = nachId[e.von], b = nachId[e.nach];
      if (!a || !b) { return; }
      var pfad = svgEl('path', {
        class: 'netz-kante' + (e.art ? ' kante-' + e.art : ''),
        'marker-end': e.gerichtet ? 'url(#netz-pfeil)' : null
      });
      pfad.__daten = e;
      gKanten.appendChild(pfad);
      kantenKnoten.push({ el: pfad, e: e, a: a, b: b });
    });

    // Pfeilspitze fuer gerichtete Kanten (konditionale Abhaengigkeiten)
    var defs = svgEl('defs', {});
    var marker = svgEl('marker', {
      id: 'netz-pfeil', viewBox: '0 0 10 10', refX: '9', refY: '5',
      markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse'
    });
    marker.appendChild(svgEl('path', { d: 'M 0 1 L 9 5 L 0 9 z', class: 'netz-pfeilspitze' }));
    defs.appendChild(marker);
    svg.insertBefore(defs, gKanten);

    var knotenKnoten = [];
    knoten.forEach(function (k) {
      var g = svgEl('g', {
        class: 'netz-knoten-gruppe gruppe-' + (k.gruppe || 'a'),
        tabindex: '0',
        role: 'button',
        'aria-label': k.ariaLabel || k.label
      });
      var r = k.radius || 7;
      // 2px Flaechenring statt Rahmen, damit sich ueberlappende Knoten trennen
      g.appendChild(svgEl('circle', { class: 'netz-ring', r: r + 2 }));
      g.appendChild(svgEl('circle', { class: 'netz-punkt', r: r }));
      if (k.label) {
        g.appendChild(svgEl('text', {
          class: 'netz-label' + (k.gross ? ' label-gross' : ''),
          x: 0, y: r + 13, 'text-anchor': 'middle', text: k.label
        }));
      }
      g.__daten = k;
      gKnoten.appendChild(g);
      knotenKnoten.push({ el: g, k: k });
    });

    function positioniere() {
      kantenKnoten.forEach(function (kk) {
        var a = kk.a, b = kk.b;
        var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        // Leichte Kruemmung, damit parallele Kanten unterscheidbar bleiben
        var dx = b.x - a.x, dy = b.y - a.y;
        var biegung = 0.12;
        var cx = mx - dy * biegung, cy = my + dx * biegung;

        // Die Kante endet am Knotenrand, nicht im Knotenmittelpunkt. Sonst
        // verschwindet die Pfeilspitze unter dem Zielknoten — und damit die
        // Richtung, die bei konditionalen Abhaengigkeiten die Aussage traegt.
        var ex = b.x - cx, ey = b.y - cy;
        var el = Math.sqrt(ex * ex + ey * ey) || 1;
        var kuerzeZiel = (b.radius || 7) + 2 + (kk.e.gerichtet ? 7 : 0);
        var zx = b.x - ex / el * kuerzeZiel, zy = b.y - ey / el * kuerzeZiel;

        var sx = a.x - cx, sy = a.y - cy;
        var sl = Math.sqrt(sx * sx + sy * sy) || 1;
        var kuerzeStart = (a.radius || 7) + 2;
        var qx = a.x - sx / sl * kuerzeStart, qy = a.y - sy / sl * kuerzeStart;

        kk.el.setAttribute('d', 'M ' + qx + ' ' + qy + ' Q ' + cx + ' ' + cy + ' ' + zx + ' ' + zy);
      });
      knotenKnoten.forEach(function (nk) {
        nk.el.setAttribute('transform', 'translate(' + nk.k.x + ' ' + nk.k.y + ')');
      });
    }

    /*
     * Beschriftungen entzerren. Erst nach dem Einschwingen aufgerufen, damit
     * die teure Messung nur einmal anfaellt. Zwei Schritte: Labels am Rand
     * bekommen einen anderen Textanker, damit sie nicht abgeschnitten werden;
     * danach werden sich ueberlappende Labels nach unten ausgewichen.
     */
    function entzerreLabels() {
      var boxen = [];
      knotenKnoten.forEach(function (nk) {
        var text = nk.el.querySelector('text');
        if (!text || !text.textContent) { return; }
        var w;
        try { w = text.getComputedTextLength(); } catch (fehler) { w = text.textContent.length * 5.6; }
        boxen.push({
          text: text, k: nk.k, w: w,
          basisY: parseFloat(text.getAttribute('y')) || 0,
          dy: 0, anker: 'middle', dx: 0
        });
      });

      boxen.forEach(function (b) {
        var links = b.k.x - b.w / 2, rechts = b.k.x + b.w / 2;
        if (links < 6) {
          b.anker = 'start'; b.dx = 6 - b.k.x;
          b.text.setAttribute('text-anchor', 'start');
          b.text.setAttribute('x', b.dx);
        } else if (rechts > breite - 6) {
          b.anker = 'end'; b.dx = (breite - 6) - b.k.x;
          b.text.setAttribute('text-anchor', 'end');
          b.text.setAttribute('x', b.dx);
        }
      });

      function kasten(b) {
        var mitte = b.k.x + b.dx;
        var x = b.anker === 'start' ? mitte : b.anker === 'end' ? mitte - b.w : mitte - b.w / 2;
        return { x: x, y: b.k.y + b.basisY + b.dy - 10, w: b.w, h: 13 };
      }

      for (var runde = 0; runde < 14; runde++) {
        var bewegt = false;
        for (var i = 0; i < boxen.length; i++) {
          for (var j = i + 1; j < boxen.length; j++) {
            var A = kasten(boxen[i]), B = kasten(boxen[j]);
            if (A.x + A.w < B.x || B.x + B.w < A.x) { continue; }
            if (A.y + A.h < B.y || B.y + B.h < A.y) { continue; }
            var unten = A.y >= B.y ? boxen[i] : boxen[j];
            if (unten.dy >= 34) { continue; }
            unten.dy += 7;
            bewegt = true;
          }
        }
        if (!bewegt) { break; }
      }

      boxen.forEach(function (b) {
        if (b.dy) { b.text.setAttribute('y', b.basisY + b.dy); }
      });
    }

    // Einschwingen: von der Mitte auf die berechnete Lage
    function schwingeEin(fertig) {
      if (wenigerBewegung()) { positioniere(); if (fertig) { fertig(); } return; }
      var ziel = knoten.map(function (k) { return { x: k.x, y: k.y }; });
      knoten.forEach(function (k) {
        k.x = breite / 2 + (k.x - breite / 2) * 0.12;
        k.y = hoehe / 2 + (k.y - hoehe / 2) * 0.12;
      });
      var start = null, dauer = 720;
      function rahmen(zeit) {
        if (start === null) { start = zeit; }
        var t = Math.min(1, (zeit - start) / dauer);
        var e = 1 - Math.pow(1 - t, 3); // ease-out
        knoten.forEach(function (k, i) {
          k.x = k.x + (ziel[i].x - k.x) * (t === 1 ? 1 : e * 0.25 + 0.02);
          k.y = k.y + (ziel[i].y - k.y) * (t === 1 ? 1 : e * 0.25 + 0.02);
        });
        positioniere();
        if (t < 1) { global.requestAnimationFrame(rahmen); }
        else {
          knoten.forEach(function (k, i) { k.x = ziel[i].x; k.y = ziel[i].y; });
          positioniere();
          if (fertig) { fertig(); }
        }
      }
      global.requestAnimationFrame(rahmen);
    }

    var aktiv = null;

    function setzeHervorhebung(id) {
      aktiv = id;
      svg.classList.toggle('hat-auswahl', !!id);
      knotenKnoten.forEach(function (nk) {
        var beteiligt = !id || nk.k.id === id || nachbarn[id][nk.k.id];
        nk.el.classList.toggle('gedimmt', !!id && !beteiligt);
        nk.el.classList.toggle('gewaehlt', nk.k.id === id);
      });
      kantenKnoten.forEach(function (kk) {
        var beteiligt = !id || kk.e.von === id || kk.e.nach === id;
        kk.el.classList.toggle('gedimmt', !!id && !beteiligt);
        kk.el.classList.toggle('betont', !!id && beteiligt);
      });
    }

    knotenKnoten.forEach(function (nk) {
      function waehle() {
        setzeHervorhebung(aktiv === nk.k.id ? null : nk.k.id);
        if (opt.beiAuswahl) { opt.beiAuswahl(aktiv ? nk.k : null); }
      }
      nk.el.addEventListener('click', waehle);
      nk.el.addEventListener('keydown', function (ereignis) {
        if (ereignis.key === 'Enter' || ereignis.key === ' ') { ereignis.preventDefault(); waehle(); }
        if (ereignis.key === 'Escape') { setzeHervorhebung(null); if (opt.beiAuswahl) { opt.beiAuswahl(null); } }
      });
      nk.el.addEventListener('focus', function () {
        if (!aktiv && opt.beiVorschau) { opt.beiVorschau(nk.k); }
      });
      nk.el.addEventListener('mouseenter', function () {
        if (!aktiv && opt.beiVorschau) { opt.beiVorschau(nk.k); }
      });
    });

    svg.addEventListener('keydown', function (ereignis) {
      if (ereignis.key === 'Escape') { setzeHervorhebung(null); if (opt.beiAuswahl) { opt.beiAuswahl(null); } }
    });

    positioniere();
    schwingeEin(entzerreLabels);

    return {
      hervorheben: setzeHervorhebung,
      knoten: knoten,
      fokussiere: function (id) {
        var treffer = knotenKnoten.filter(function (nk) { return nk.k.id === id; })[0];
        if (treffer) { treffer.el.focus(); }
      }
    };
  }

  global.EduNetz = {
    layout: berechneLayout,
    zeichne: zeichne,
    svgEl: svgEl,
    wenigerBewegung: wenigerBewegung
  };
})(window);
