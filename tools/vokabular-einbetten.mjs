/*
 * Erzeugt aus jeder Vokabulardatei prototype/vocab/<name>.json die zugehoerige
 * Datei <name>.js.
 *
 * Warum beides: Die JSON-Datei ist die Quelle — sie laesst sich von
 * Pruefwerkzeugen, von einem Server und von anderen Plattformen ohne Umweg
 * lesen. Der Klickdummy muss aber per Doppelklick laufen, und Browser
 * blockieren fetch() auf file:// mit CORS. Die .js-Datei ist deshalb nichts
 * weiter als dieselbe JSON, eingepackt in einen Aufruf von EduVocab.register.
 *
 * Aufruf: node tools/vokabular-einbetten.mjs [--pruefen]
 * Mit --pruefen wird nichts geschrieben, sondern nur gemeldet, ob die
 * erzeugten Dateien noch zur Quelle passen. Das eignet sich fuer die
 * Fortschreibung im Arbeitsablauf.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const vokabularOrdner = join(wurzel, 'prototype', 'vocab');
const nurPruefen = process.argv.includes('--pruefen');

function kopfzeile(daten) {
  const teile = [daten.label];
  if (daten.hinweis) { teile.push(daten.hinweis); }
  return teile.join('\n * ').replace(/\*\//g, '* /');
}

function einbetten(daten) {
  return [
    '/*',
    ' * ' + kopfzeile(daten),
    ' *',
    ' * Erzeugt aus ' + daten.id + '.json durch tools/vokabular-einbetten.mjs.',
    ' * Nicht von Hand aendern — Aenderungen gehoeren in die JSON-Datei.',
    ' */',
    '',
    'EduVocab.register(' + JSON.stringify(daten, null, 2) + ');',
    ''
  ].join('\n');
}

const dateien = (await readdir(vokabularOrdner))
  .filter((n) => n.endsWith('.json'))
  .sort();

let abweichungen = 0;

for (const name of dateien) {
  const quelle = join(vokabularOrdner, name);
  const ziel = join(vokabularOrdner, basename(name, '.json') + '.js');
  const daten = JSON.parse(await readFile(quelle, 'utf8'));
  const inhalt = einbetten(daten);

  if (nurPruefen) {
    let vorhanden = null;
    try { vorhanden = await readFile(ziel, 'utf8'); } catch { /* fehlt */ }
    if (vorhanden !== inhalt) {
      abweichungen += 1;
      console.error('abweichend: ' + basename(ziel));
    }
  } else {
    await writeFile(ziel, inhalt, 'utf8');
  }
}

if (nurPruefen) {
  if (abweichungen) {
    console.error(abweichungen + ' Datei(en) sind nicht aus der Quelle erzeugt. '
      + 'node tools/vokabular-einbetten.mjs ausfuehren.');
    process.exit(1);
  }
  console.log(dateien.length + ' Vokabulardateien stimmen mit ihrer Quelle ueberein.');
} else {
  console.log(dateien.length + ' Vokabulardateien erzeugt.');
}
