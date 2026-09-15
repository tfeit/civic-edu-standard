/*
 * Prueft den Beispieldatensatz gegen das Schemafragment fuer Bildungsabschnitte
 * und gegen die Vokabulare.
 *
 * Warum von Hand und nicht mit einer Schemabibliothek: Der Prototyp kommt ohne
 * Abhaengigkeiten aus, und das soll auch fuer die Pruefung gelten. Der hier
 * ausgewertete Teil von Draft-07 ist klein — type, enum, required, minItems,
 * uniqueItems, additionalProperties und die beiden if/then-Zweige.
 *
 * Aufruf: node tools/validate.mjs
 * Rueckgabe: 0 wenn alles passt, sonst 1 mit Fundstellen auf stderr.
 */

import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const fehler = [];

function melde(stelle, text) { fehler.push(stelle + ': ' + text); }

/* --------------------------------------------------- Schemapruefung */

function loeseRef(schema, wurzelSchema) {
  if (!schema || !schema.$ref) { return schema; }
  const pfad = schema.$ref.replace(/^#\//, '').split('/');
  return pfad.reduce((k, teil) => (k ? k[teil] : undefined), wurzelSchema);
}

function pruefeGegenSchema(wert, schema, wurzelSchema, stelle) {
  schema = loeseRef(schema, wurzelSchema);
  if (!schema) { return; }

  if (schema.type === 'object') {
    if (typeof wert !== 'object' || wert === null || Array.isArray(wert)) {
      melde(stelle, 'erwartet ein Objekt.');
      return;
    }
    for (const pflicht of schema.required || []) {
      if (wert[pflicht] === undefined) { melde(stelle, 'Pflichtangabe "' + pflicht + '" fehlt.'); }
    }
    if (schema.additionalProperties === false) {
      for (const name of Object.keys(wert)) {
        if (!schema.properties || !schema.properties[name]) {
          melde(stelle, 'unbekannte Angabe "' + name + '".');
        }
      }
    }
    for (const [name, teilSchema] of Object.entries(schema.properties || {})) {
      if (wert[name] !== undefined) {
        pruefeGegenSchema(wert[name], teilSchema, wurzelSchema, stelle + '.' + name);
      }
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(wert)) { melde(stelle, 'erwartet eine Liste.'); return; }
    if (schema.minItems !== undefined && wert.length < schema.minItems) {
      melde(stelle, 'braucht mindestens ' + schema.minItems + ' Eintrag/Einträge.');
    }
    if (schema.uniqueItems && new Set(wert.map(String)).size !== wert.length) {
      melde(stelle, 'enthält Doppelungen.');
    }
    wert.forEach((x, i) => pruefeGegenSchema(x, schema.items, wurzelSchema, stelle + '[' + i + ']'));
  } else if (schema.type === 'string') {
    if (typeof wert !== 'string') { melde(stelle, 'erwartet eine Zeichenkette.'); return; }
    if (schema.enum && !schema.enum.includes(wert)) {
      melde(stelle, '"' + wert + '" ist kein zulässiger Wert (erlaubt: ' + schema.enum.join(', ') + ').');
    }
    if (schema.minLength !== undefined && wert.length < schema.minLength) {
      melde(stelle, 'ist kürzer als ' + schema.minLength + ' Zeichen.');
    }
  }

  // Die beiden if/then-Zweige binden die zulaessigen Werte an das Modell.
  for (const zweig of schema.allOf || []) {
    if (!zweig.if) { continue; }
    const trifftZu = Object.entries(zweig.if.properties || {}).every(
      ([name, bedingung]) => wert && wert[name] === bedingung.const
    );
    if (trifftZu && zweig.then) {
      pruefeGegenSchema(wert, { type: 'object', properties: zweig.then.properties || {} },
        wurzelSchema, stelle);
    }
  }
}

/* ------------------------------------------------ Vokabularpruefung */

async function ladeVokabulare() {
  const ordner = join(wurzel, 'prototype', 'vocab');
  const vokabulare = {};
  for (const name of (await readdir(ordner)).filter((n) => n.endsWith('.json'))) {
    const v = JSON.parse(await readFile(join(ordner, name), 'utf8'));
    vokabulare[v.id] = v;
  }
  return vokabulare;
}

function kennt(vokabulare, id, key) {
  const v = vokabulare[id];
  return !!(v && (v.concepts || []).some((c) => c.key === key));
}

/* ------------------------------------------------------------ Lauf */

const schema = JSON.parse(
  await readFile(join(wurzel, 'schema', 'bildungsabschnitt.schema.json'), 'utf8'));
const daten = JSON.parse(
  await readFile(join(wurzel, 'prototype', 'data', 'beispiel.json'), 'utf8'));
const vokabulare = await ladeVokabulare();

/*
 * Erst die sieben Testfaelle aus dem Schema selbst. Sie stehen dort unter
 * examples und sind der Massstab: Was das Schema als Beispiel fuehrt, muss es
 * auch akzeptieren.
 */
let testfaelle = 0;
(schema.examples || []).forEach((fall, i) => {
  testfaelle += 1;
  const vorher = fehler.length;
  pruefeGegenSchema(fall, schema, schema, 'schema.examples[' + i + ']');
  if (fehler.length > vorher) { melde('schema', 'Testfall ' + i + ' erfüllt das eigene Schema nicht.'); }
});

daten.akteure.forEach((a) => {
  const stelle = a.id + ' (' + a.name + ')';

  pruefeGegenSchema(a.educationStages, schema, schema, stelle + '.educationStages');

  // Die Werte muessen zum gewaehlten Modell gehoeren.
  const modell = (a.educationStages || {}).modell;
  for (const wert of (a.educationStages || {}).werte || []) {
    if (!kennt(vokabulare, modell, wert)) {
      melde(stelle, 'Bildungsabschnitt "' + wert + '" steht nicht im Vokabular ' + modell + '.');
    }
  }

  // Ein Uebergang setzt beide angrenzenden Bereiche voraus. Diese Regel prueft
  // das Schema ausdruecklich nicht — sie gehoert in die Anwendung, und damit
  // hierher.
  const cw = vokabulare['crosswalk-bildungsabschnitte'];
  for (const ueb of (a.educationStages || {}).uebergaenge || []) {
    const eintrag = ((cw.uebergaenge || {}).werte || []).find((u) => u.key === ueb);
    if (!eintrag) { melde(stelle, 'Übergang "' + ueb + '" ist unbekannt.'); continue; }
    const fehlend = eintrag.voraussetzt.filter((b) => !a.educationStages.werte.includes(b));
    if (fehlend.length) {
      melde(stelle, 'Übergang "' + ueb + '" setzt ' + fehlend.join(' und ') + ' voraus.');
    }
  }

  for (const feld of a.fieldsOfAction || []) {
    if (!kennt(vokabulare, 'handlungsfelder', feld)) {
      melde(stelle, 'Handlungsfeld "' + feld + '" steht nicht im Vokabular.');
    }
  }
  if (a.primaryFieldOfAction && !(a.fieldsOfAction || []).includes(a.primaryFieldOfAction)) {
    melde(stelle, 'Der Schwerpunkt ist kein gewähltes Handlungsfeld.');
  }
  if (a.status && !kennt(vokabulare, 'organisationsstatus', a.status)) {
    melde(stelle, 'Status "' + a.status + '" steht nicht im Vokabular.');
  }
  if (a.legalForm && !kennt(vokabulare, 'rechtsformen', a.legalForm)) {
    melde(stelle, 'Rechtsform "' + a.legalForm + '" steht nicht im Vokabular.');
  }
  for (const t of a.targetGroups || []) {
    if (!kennt(vokabulare, 'zielgruppenrollen', t.role)) {
      melde(stelle, 'Zielgruppenrolle "' + t.role + '" steht nicht im Vokabular.');
    }
  }
});

if (fehler.length) {
  console.error(fehler.length + ' Beanstandung(en):');
  fehler.forEach((f) => console.error('  ' + f));
  process.exit(1);
}

console.log('In Ordnung: ' + testfaelle + ' Testfälle aus dem Schema und '
  + daten.akteure.length + ' Beispielorganisationen geprüft.');
