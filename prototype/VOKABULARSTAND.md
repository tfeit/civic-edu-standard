# Vokabularstand

Diese Datei ist als Erstes zu lesen, wenn Vokabulare geprüft oder
fortgeschrieben werden. Sie hält fest, woher jede Werteliste stammt, wann sie
zuletzt abgerufen wurde und wie belastbar sie ist.

**Nichts hiervon ist von der Arbeitsgruppe beschlossen.** Der Prüfstand sagt
etwas über die Herkunft der Liste aus, nicht über ihre Verbindlichkeit.

Stand: 15.09.2026, nach Workshop 4.

---

## Wie die Dateien zusammenhängen

Die `.json` ist die Quelle. Die gleichnamige `.js` wird daraus erzeugt und
ist nichts weiter als dieselben Angaben, eingepackt in einen Aufruf von
`EduVocab.register`. Grund: Der Klickdummy muss per Doppelklick laufen, und
Browser blockieren `fetch()` auf `file://` mit CORS.

```
node tools/vokabular-einbetten.mjs             erzeugt die .js aus der .json
node tools/vokabular-einbetten.mjs --pruefen   meldet, ob beide auseinanderlaufen
node tools/validate.mjs                        prüft den Beispieldatensatz
```

Änderungen gehören immer in die `.json`.

---

## Prüfstände

| Wert | Bedeutung |
|---|---|
| `bestaetigt` | gegen die benannte Quelle geprüft |
| `teilweise_bestaetigt` | ein Teil geprüft, der Rest nicht — `quelle.pruefstandDetail` sagt, welcher |
| `recherchiert` | aus Sekundärquellen zusammengetragen, nicht am Original abgerufen |
| `unbestaetigt` | Setzung der Arbeitsgruppe, keine externe Quelle |
| `abgeleitet` | aus einem anderen Vokabular dieses Repositoriums errechnet |

---

## Stand je Vokabular

| Datei | Version | Begriffe | Quelle | Abgerufen | Prüfstand | Offene Punkte |
|---|---|---|---|---|---|---|
| `adresstypen.json` | 0.2.0 | 4 | Festlegung der Arbeitsgruppe KKAB, erweitert | 2026-09-15 | unbestaetigt | — |
| `bildungsabschnitte-lebenslang.json` | 0.2.0 | 11 | Bildungsabschnitte des Nettiefinders (Netzwerk Stiftungen und Bildung), überno… | 2026-09-15 | bestaetigt | Definitionen im Entwurf; Modellentscheidung offen |
| `bildungsstruktur-bereiche.json` | 0.2.0 | 6 | Arbeitskarte Bildungsstruktur im Miro-Board, gestützt auf den Artikel Bildungs… | 2026-09-15 | bestaetigt <br><small>bestaetigt_gegen_arbeitskarte</small> | Zuschreibung „KMK“ nicht belegt; Primarstufe und Sekundarstufe I als ein oder zwei Bereiche zu bestätigen |
| `bundeslaender.json` | 1.0.0 | 16 | Amtlicher Gemeindeschluessel, erste zwei Stellen (Statistisches Bundesamt) | 2026-09-15 | bestaetigt | Bei Gebietsreformen prüfen |
| `crosswalk-bildungsabschnitte.json` | 0.2.0 | 6 | Zuordnung Modell A zu Modell B aus der Arbeitskarte Bildungsstruktur im Miro-B… | 2026-09-15 | teilweise_bestaetigt <br><small>A-zu-B bestaetigt, ISCED recherchiert_nicht_abgerufen</small> | Drei offene Punkte: Weiterbildung im Tertiär- statt Quartärbereich, Auffangwert, Primarstufe/Sek I |
| `crosswalk-handlungsfelder.json` | 0.1.0 | 23 | Eigener Zuordnungsvorschlag auf Basis der recherchierten Systematiken; nicht m… | 2026-09-15 | unbestaetigt | Vorschlag, nicht mit der Arbeitsgruppe abgestimmt; zwei Zuordnungen mit niedriger Sicherheit |
| `engagementfelder.json` | 1.0.0 | 16 | Systematik der Engagementfelder aus der Zivilgesellschaftsforschung (16 Felder… | 2026-09-15 | recherchiert <br><small>recherchiert_nicht_abgerufen</small> | Labels nicht gegen den ZiviZ-Hauptbericht abgerufen |
| `handlungsfelder.json` | 0.2.0 | 23 | Handlungsfelder der Arbeitsgruppe, übernommen aus der Arbeitsliste; 23 Begriff… | 2026-09-15 | teilweise_bestaetigt <br><small>begriffe_bestaetigt_definitionen_entwurf</small> | Definitionen im Entwurf; Lobbyarbeit fehlt; Auffangwert offen; Obergrenze und Schwerpunkt nicht beschlossen |
| `herkunftsquellen.json` | 0.1.0 | 4 | Ableitung aus der Rechtsrecherche (Art. 14 DSGVO, Fall Bisnode Polska UODO 15.… | 2026-09-15 | abgeleitet | Vorschlag, nicht beschlossen |
| `icnpo-gruppen.json` | 1.0.0 | 16 | International Classification of Non-profit Organizations (Salamon/Anheier 1997… | 2026-09-15 | bestaetigt | Deutsche Bezeichnungen sind Arbeitsübersetzungen |
| `isced-2011.json` | 1.0.0 | 9 | UNESCO ISCED 2011; maschinenlesbare Fassung als Eurostat-Vokabular | 2026-09-15 | recherchiert <br><small>recherchiert_nicht_abgerufen</small> | Labels nicht gegen die Eurostat-Quelle abgerufen |
| `lernformen.json` | 0.1.0 | 4 | openeduhub, Vokabular educationalContext (SKOS, CC0); prefLabel@de woertlich u… | 2026-09-15 | bestaetigt | Vorschlag, nicht beschlossen |
| `organisationsstatus.json` | 0.2.0 | 5 | Festlegung der Arbeitsgruppe KKAB, in Workshop 4 auf drei Werte reduziert | 2026-09-15 | unbestaetigt | Schlüssel von Englisch auf Deutsch umgestellt; zwei Werte deprecated |
| `raumgliederung.json` | 0.1.0 | 32 | Amtlicher Gemeindeschlüssel (AGS). Die 16 Länderschlüssel stammen aus vocab/bu… | 2026-09-15 | recherchiert <br><small>Abrufversuch am 15.09.2026 von der Egress-Richtlinie dieser Umgebung mit 403 abgelehnt. Nicht geraten, sondern</small> | Gemeindeschlüssel nicht gegen das amtliche Verzeichnis abgeglichen (Abruf am 15.09.2026 mit 403 abgelehnt) |
| `rechtsformen.json` | 0.3.0 | 18 | Festlegung der Arbeitsgruppe KKAB, erweitert um Rechtsformen des Bildungssekto… | 2026-09-15 | unbestaetigt | Stiftungsregister: zur Entscheidung |
| `reichweite-grob.json` | 0.1.0 | 4 | Variante 3 des Formulartests aus Workshop 4; Setzung der Arbeitsgruppe | 2026-09-15 | unbestaetigt | Variante 3 des Formulartests, nicht beschlossen |
| `reichweite.json` | 0.1.0 | 6 | Festlegung der Arbeitsgruppe KKAB | 2026-09-15 | unbestaetigt | — |
| `sdg.json` | 1.0.0 | 17 | Agenda 2030 der Vereinten Nationen, deutsche Kurztitel | 2026-09-15 | bestaetigt | Post-2030-Agenda nach dem Gipfel 2027 |
| `sichtbarkeit.json` | 0.1.0 | 2 | Festlegung der Arbeitsgruppe KKAB | 2026-09-15 | unbestaetigt | — |
| `verwirklichung.json` | 0.1.0 | 3 | Festlegung der Arbeitsgruppe KKAB | 2026-09-15 | unbestaetigt | — |
| `zielgruppenrollen.json` | 0.2.0 | 5 | Festlegung der Arbeitsgruppe KKAB, erweitert | 2026-09-15 | unbestaetigt | Zwei Rollen deprecated, weil sie keine Teilnahmerolle beschreiben |

Nicht mehr geladen, aber erhalten: `vocab/archiv/lernformen-v0.1.json`. Das
Feld „Lernform / Schulform" war ein Vorschlag aus der Vokabularrecherche und
nicht Gegenstand eines Workshops; auf Rückmeldung aus der Arbeitsgruppe ist
es aus dem Feldmodell entfernt worden. Die Werteliste bleibt erhalten, falls
die Frage wiederkommt.

Ebenso nicht mehr geladen: `vocab/archiv/crosswalks-v0.1.json`. Die
Datei enthält den dokumentierten Prüflauf gegen openeduhub vom 15.09.2026,
einschließlich der dort festgestellten Abweichungen zur Zuordnung der
Arbeitsgruppe. Sie folgt den alten Schlüsseln und wird deshalb nicht mehr
ausgewertet.

---

## Was ausdrücklich ungeprüft ist

Diese Punkte sind vor einer Festlegung zu klären. Keiner davon ist ein
Versehen — sie sind so dokumentiert, weil die Quelle sie offenlässt oder der
Abruf nicht möglich war.

**Die Zuschreibung „KMK“ bei Modell B.** In Workshop 4 fiel die Bezeichnung,
belegt ist sie nicht; die Quellkarte verweist auf den Wikipedia-Artikel zum
Bildungssystem in Deutschland. Deshalb wird neutral von *Bildungsbereichen*
gesprochen, der Alias bleibt in der Datei.

**Die ISCED-Bezeichnungen.** Sie stammen aus einer Recherche, nicht aus einem
Abruf der Eurostat-Quelle. Vor Produktivnutzung verifizieren.

**Die Engagementfeld-Bezeichnungen.** Ebenso: die 16 Felder sind
recherchiert, der ZiviZ-Hauptbericht wurde nicht abgerufen.

**Alle Definitionen, Beispiele und Negativbeispiele.** Sie tragen je Begriff
`definitionStatus: "entwurf"` und sind mit dem Netzwerk abzustimmen —
insbesondere dort, wo sie Grenzen setzen, die in der Praxis anders gezogen
werden. Die Oberfläche weist im Tooltip darauf hin.

**Die drei offenen Punkte im Bildungs-Crosswalk.** Sie stehen in der Datei
unter `offenePunkte` und in `BILDUNGSABSCHNITTE.md` ausführlich:
Weiterbildung ist dem Tertiär- statt dem Quartärbereich zugeordnet; der
Auffangwert ist einem Bereich zugeordnet, obwohl er sachlich in keinen
gehört; ob Primarstufe und Sekundarstufe I einen oder zwei Bereiche bilden,
ist in der Quelle uneindeutig.

**Der Handlungsfeld-Crosswalk insgesamt.** Er ist ein Zuordnungsvorschlag und
nicht mit der Arbeitsgruppe abgestimmt. Jede Zeile trägt eine
Sicherheitsangabe: 14 mit hoher, 7 mit mittlerer, 2 mit niedriger Sicherheit.
Die beiden unsicheren — Diversität und Wirtschaft — erscheinen im Formular
mit ihrer Begründung im Tooltip.

**Die Gemeindeschlüssel in `raumgliederung.json`.** Der Abruf des amtlichen
Gemeindeverzeichnisses wurde am 15.09.2026 von der Egress-Richtlinie der
Arbeitsumgebung mit HTTP 403 abgelehnt. Die 16 Länderschlüssel stammen aus
`bundeslaender.json` und sind belastbar; die 16 Gemeindeschlüssel sind
recherchiert und als solche gekennzeichnet. Sie sind Demonstrationsmaterial
für die Erprobung des Trichterprinzips, keine Raumgliederung.

---

## Regeln für die Fortschreibung

1. **Schlüssel sind stabil und getrennt vom Anzeigenamen.** Ein `key` wird
   nicht umbenannt. Wer ihn ändert, bricht jeden Datensatz, der ihn führt.
2. **Terme werden nie gelöscht**, sondern auf `deprecated: true` gesetzt,
   mit `ersetztDurch`, wo es einen Nachfolger gibt. Die Oberfläche blendet
   sie aus der Auswahl aus, zeigt sie in bestehenden Datensätzen aber weiter
   an — sonst fielen sie stillschweigend heraus.
3. **Jede Änderung braucht einen Eintrag im `CHANGELOG.md`**, auch wenn das
   Ergebnis „unverändert" oder „Abruf fehlgeschlagen" lautet.
4. **Ein nicht dokumentierter Prüflauf ist kein Prüflauf.** Scheitert ein
   Abruf, bleibt die Datei unverändert, der Prüfstand bleibt stehen, und der
   Fehlversuch wird mit Datum vermerkt. Nicht raten.

Zur Ausnahme von Regel 1 bei den Handlungsfeldern und beim
Organisationsstatus siehe `CHANGELOG.md`, Eintrag vom 15.09.2026.
