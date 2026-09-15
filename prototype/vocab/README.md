# Vokabulare

Eine Datei je Werteliste. Jede trägt Version, Quelle, Abrufdatum und
Prüfstand. Der aktuelle Stand und die offenen Punkte stehen in
`../VOKABULARSTAND.md`.

## Format

```js
EduVocab.register({
  "id": "handlungsfelder",
  "label": "Handlungsfelder",
  "version": "0.2.0",
  "status": "arbeitsstand",
  "quelle": {
    "bezeichnung": "…",
    "url": null,
    "abgerufen": "2026-09-15",
    "pruefstand": "unbestaetigt"
  },
  "hinweis": "…",
  "concepts": [
    { "key": "…", "label": "…", "definition": "…",
      "beispiele": ["…"], "negativbeispiel": "…",
      "deprecated": false, "ersetztDurch": null }
  ]
});
```

**Warum `.js` und nicht `.json`:** Der Klickdummy muss per Doppelklick laufen.
Browser blockieren `fetch()` auf `file://` mit CORS — echte JSON-Dateien wären
dort nicht ladbar. Der Inhalt unterhalb von `register(` ist wörtlich das
vereinbarte JSON-Format und lässt sich ohne Verlust nach `.json` überführen,
sobald der Prototyp über einen Server ausgeliefert wird.

## Regeln

- **Schlüssel sind stabil** und getrennt vom Anzeigenamen. Eine Umbenennung
  des Labels ändert nie den Schlüssel.
- **Begriffe werden nie gelöscht**, nur auf `deprecated: true` gesetzt,
  optional mit `ersetztDurch`. Veraltete Begriffe erscheinen nicht mehr in der
  Auswahl, bleiben in bestehenden Datensätzen aber sichtbar.
- `prueftstand` ist `bestaetigt`, `unbestaetigt` oder `abgeleitet`.
- Der Loader prüft die Struktur beim Start und meldet Verstöße **sichtbar in
  der Seite** — nicht nur in der Konsole.

## Wikidata-Kennungen für spätere Auswertungen

Aus der Recherche, nicht selbst gegengeprüft (siehe `../VOKABULARSTAND.md`,
Lauf 3):

| Kennung | Bedeutung |
|---|---|
| `P227` | GND-ID |
| `P10301` | Lobbyregister-ID |
| `Q3305867` | eingetragener Verein |
| `Q157031` | Stiftung |
| `Q183` | Deutschland |

Zählabfragen für den Wikidata Query Service:

```sparql
# Eingetragene Vereine mit Sitz in Deutschland
SELECT (COUNT(DISTINCT ?org) AS ?anzahl) WHERE {
  ?org wdt:P31 wd:Q3305867 .
  ?org wdt:P17 wd:Q183 .
}
```

```sparql
# Stiftungen in Deutschland mit GND-Kennung
SELECT (COUNT(DISTINCT ?org) AS ?anzahl) WHERE {
  ?org wdt:P31 wd:Q157031 .
  ?org wdt:P17 wd:Q183 .
  ?org wdt:P227 ?gnd .
}
```

Die Abdeckung kleiner Vereine in Wikidata ist lückenhaft. Der Prototyp
behandelt „kein Treffer" deshalb als Normalfall, nicht als Fehlschlag.
