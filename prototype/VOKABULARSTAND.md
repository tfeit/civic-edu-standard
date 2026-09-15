# Vokabularstand

Diese Datei ist als Erstes zu lesen, wenn Vokabulare geprüft oder
fortgeschrieben werden. Sie hält fest, woher jede Werteliste stammt, wann sie
zuletzt abgerufen wurde und wie belastbar sie ist.

**Nichts hiervon ist von der Arbeitsgruppe beschlossen.** Die Prüfstände sagen
etwas über die Herkunft der Liste aus, nicht über ihre Verbindlichkeit.

---

## Stand je Vokabular

| Datei | Version | Quelle | Abgerufen | Prüfstand | Offene Punkte |
|---|---|---|---|---|---|
| `handlungsfelder.js` | 0.2.0 | Platzhalterliste KKAB | 2026-09-15 | unbestätigt | Anzahl offen (23 oder 24); Konsolidierung aus dem Hausaufgabenformat steht aus |
| `ziviz-engagementfelder.js` | 1.0.0 | ZiviZ-Survey 2023, Hauptbericht | 2026-09-15 | bestätigt | Eigener Gegenprüflauf war nicht möglich (siehe unten) |
| `icnpo-gruppen.js` | 1.0.0 | ICNPO (Salamon/Anheier 1997) | 2026-09-15 | bestätigt | Deutsche Bezeichnungen sind Arbeitsübersetzungen |
| `bildungsabschnitte.js` | 0.2.0 | Achterliste der Arbeitsgruppe | 2026-09-15 | unbestätigt | Drei Bruchstellen im Crosswalk, siehe `crosswalks.js` |
| `lernformen.js` | 0.1.0 | openeduhub `educationalContext` | 2026-09-15 | bestätigt | Vorschlag, nicht beschlossen |
| `isced.js` | 1.0.0 | ISCED 2011 (UNESCO UIS) | 2026-09-15 | abgeleitet | Deutsche Stufenbezeichnungen nicht gegen Eurostat geprüft |
| `reichweite.js` | 0.1.0 | Festlegung der Arbeitsgruppe | 2026-09-15 | unbestätigt | — |
| `rechtsformen.js` | 0.3.0 | Festlegung der Arbeitsgruppe, erweitert | 2026-09-15 | unbestätigt | Stiftungsregister: zur Entscheidung in WS 4 |
| `organisationsstatus.js` | 0.1.0 | Festlegung der Arbeitsgruppe | 2026-09-15 | unbestätigt | — |
| `zielgruppenrollen.js` | 0.2.0 | Festlegung der Arbeitsgruppe, erweitert | 2026-09-15 | unbestätigt | — |
| `sdg.js` | 1.0.0 | Agenda 2030, deutsche Kurztitel | 2026-09-15 | bestätigt | Post-2030-Agenda nach dem Gipfel 2027 |
| `adresstypen.js` | 0.2.0 | Festlegung der Arbeitsgruppe, erweitert | 2026-09-15 | unbestätigt | — |
| `verwirklichung.js` | 0.1.0 | Festlegung der Arbeitsgruppe | 2026-09-15 | unbestätigt | — |
| `sichtbarkeit.js` | 0.1.0 | Festlegung der Arbeitsgruppe | 2026-09-15 | unbestätigt | — |
| `bundeslaender.js` | 1.0.0 | Amtlicher Gemeindeschlüssel | 2026-09-15 | bestätigt | Bei Gebietsreformen prüfen |
| `herkunftsquellen.js` | 0.1.0 | Ableitung aus der Rechtsrecherche | 2026-09-15 | abgeleitet | Vorschlag, nicht beschlossen |
| `crosswalks.js` | 0.1.0 | Eigene Zuordnung; ISCED teils belegt | 2026-09-15 | abgeleitet | Zuordnung zu ZiviZ und ICNPO ist eine Setzung |

---

## Ungeprüfte Angaben

Wörtlich übernommen aus der Vokabularrecherche, plus die Ergebnisse der
Prüfläufe vom 15.09.2026:

- **Deutsche Labels aus `educationalContext`.** Die Recherche markierte fünf
  Labels als aus URI-Slugs abgeleitet und nicht verifiziert: `schule`,
  `grundschule`, `foerderschule`, `fernunterricht`, `informelles_lernen`.
  **Geprüft am 15.09.2026 — vier bestätigt, eines abweichend:**
  `schule` → „Schule", `foerderschule` → „Förderschule", `fernunterricht` →
  „Fernunterricht", `informelles_lernen` → „Informelles Lernen" stimmen mit
  dem kanonischen `prefLabel@de` überein. **`grundschule` trägt das prefLabel
  „Primarstufe", nicht „Grundschule".** Der Slug bleibt `grundschule`.
  Die zwölf Slugs selbst sind bestätigt.
- **Zahl der KKAB-Handlungsfelder.** Offen (23 oder 24); die eingearbeitete
  Liste ist ein Platzhalter mit 18 Einträgen.
- **Vokabulare von betterplace, Stiftungssuche und DSEE.** Nicht als
  geschlossene Listen öffentlich, deshalb nicht übernommen.
- **Wikidata-Abdeckungszahlen.** Nicht datiert verfügbar; die Einschätzung
  „lückenhaft bei kleinen Vereinen" ist qualitativ. Der Prototyp behandelt
  „kein Treffer" deshalb als Normalfall.
- **ZiviZ-Feldliste.** Als bestätigt übernommen, weil die Recherche sie
  wörtlich vorlegte. Ein eigener Gegenprüflauf war aus der Arbeitsumgebung
  nicht möglich (siehe Verifikationsläufe).
- **Deutsche ISCED-Stufenbezeichnungen.** Aus der Recherche übernommen, nicht
  gegen das Eurostat-Vokabular geprüft — der Abruf schlug fehl. Die
  Stufenkennungen ED0 bis ED8 sind unstrittig.

---

## Auslöser für Aktualisierung

Tritt eines dieser Ereignisse ein, ist das genannte Vokabular zu prüfen:

| Auslöser | Zu prüfen |
|---|---|
| NUTS-Umstellung auf Fassung 2027 | Geografie-Crosswalk |
| Neue Major-Version von DCAT-AP.de | Geobezug-URIs, Datenthemenbindung in `crosswalks.js` |
| Post-2030-Agenda nach dem SDG-Gipfel September 2027 | `sdg.js` |
| ZiviZ-Survey-Welle 2027 | `ziviz-engagementfelder.js` |
| Gebietsreformen | Gebietsstand in den Wirkungsgebieten, `bundeslaender.js` |
| Abschluss des Hausaufgabenformats der Arbeitsgruppe | `handlungsfelder.js` von Platzhalter auf Arbeitsstand heben |
| Entscheidung zum Stiftungsregister in WS 4 | `rechtsformen.js`, Registerart der rechtsfähigen Stiftung |

---

## Verifikationslauf

So wird geprüft:

1. Quelle abrufen (URL im `quelle`-Block der jeweiligen Datei).
2. Schlüssel und Labels vergleichen. **Schlüssel werden nie geändert** — auch
   dann nicht, wenn die Quelle einen anderen Slug führt; abweichende Labels
   werden übernommen, abweichende Schlüssel nur dokumentiert.
3. `quelle.abgerufen` auf das Abrufdatum setzen, `quelle.pruefstand`
   fortschreiben.
4. Änderung in `CHANGELOG.md` vermerken — auch wenn sie „unverändert" lautet.
5. Bei Fehlschlag: nichts ändern, Prüfstand belassen, den Fehlversuch mit
   Datum hier und im Changelog notieren. **Nicht raten.**

Ein nicht dokumentierter Prüflauf ist kein Prüflauf.

### Durchgeführte Läufe, 15.09.2026

| Lauf | Quelle | Ergebnis |
|---|---|---|
| 1 · educationalContext | `raw.githubusercontent.com/openeduhub/oeh-metadata-vocabs/master/educationalContext.ttl` | **Erfolgreich.** 12 Konzepte, deckungsgleich mit den deklarierten `skos:hasTopConcept`. Vier der fünf unsicheren Labels bestätigt, `grundschule` weicht ab (prefLabel „Primarstufe"). Zusätzlich ISCED-Bezüge über `skos:exactMatch` gewonnen. |
| 2 · ISCED gegen Eurostat | `dd.eionet.europa.eu/vocabulary/eurostat/isced11/` | **Fehlgeschlagen.** Der Netzzugang der Arbeitsumgebung lässt die Domain nicht durch (keine Antwort). Stufenbezeichnungen unverändert, `pruefstand` bleibt `abgeleitet`. Teilbeleg aus Lauf 1: `educationalContext` ordnet den Konzepten ISCED-2011-Stufen zu; diese Bezüge sind in `crosswalks.js` vermerkt. |
| 3 · Wikidata-Properties | `wikidata.org`, mehrere Wege | **Fehlgeschlagen.** Domain vom Netzzugang gesperrt (403). P227 und P10301 sind unverändert aus der Recherche übernommen und im Prototyp nur als Hinweistext geführt, nicht funktional ausgewertet. |
| 4 · ZiviZ-Feldliste | `ziviz.de`, `stifterverband.org` | **Fehlgeschlagen.** Beide Domains gesperrt. Die 16 Felder sind wörtlich aus der Recherche übernommen; ihre Reihenfolge ist unverändert. |

Die Beschränkung liegt am Netzzugang der Arbeitsumgebung, nicht an den
Quellen. Die drei fehlgeschlagenen Läufe sollten aus einer Umgebung mit
freiem Netzzugang wiederholt werden.

### Abweichungen, die bewusst nicht vereinheitlicht wurden

Beim Bildungs-Crosswalk weichen die ISCED-Zuordnungen der Arbeitsgruppe von
denen ab, die `educationalContext` führt:

| Abschnitt | Arbeitsgruppe | educationalContext |
|---|---|---|
| berufliche Bildung | ED3, ED4, ED5 | nur `level4` |
| Hochschulbildung | ED5 bis ED8 | `level6`, `level7`, `level8` — ohne ED5 |
| Sekundarstufe II | ED3, ggf. ED4 | nur `level3` |

Beide Lesarten stehen in `crosswalks.js`, die Abweichung ist je Abschnitt als
`anmerkung` vermerkt. Eine Vereinheitlichung wäre eine inhaltliche
Entscheidung der Arbeitsgruppe, keine redaktionelle.
