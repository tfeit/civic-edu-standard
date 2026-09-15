# Bildungsabschnitte — zwei Modelle, ein Crosswalk

**Stand:** 15.09.2026 · **Status:** Arbeitsstand v0.2 · **Entscheidung offen**

## 1 Warum zwei Modelle

In Workshop 4 hat sich gezeigt, dass die bis dahin geführte Werteliste zwei verschiedene Systematiken vermischt. Beide liegen jetzt getrennt vor, mit einer Übersetzung dazwischen. Die Entscheidung fällt, wenn die fachliche Rückmeldung aus dem Netzwerk und von den beiden Herbstveranstaltungen vorliegt.

| | Modell A · Bildungsabschnitte | Modell B · Bildungsbereiche |
|---|---|---|
| Datei | `vocab/bildungsabschnitte-lebenslang.json` | `vocab/bildungsstruktur-bereiche.json` |
| Logik | Biografische Stationen des lebenslangen Lernens, mit Übergängen | Formale Gliederung des Bildungssystems |
| Werte | 11 (inkl. Auffangwert) | 6 |
| Stärke | Nah an der Selbstbeschreibung der Akteure; benennt zwei fachlich wichtige Übergänge; hat einen Auffangwert | Trennscharf, anschlussfähig an Statistik und ISCED; differenziert die schulische Bildung |
| Schwäche | „Schulische Bildung" ist als Container für den Bildungssektor zu grob | Bildet Übergänge nicht ab; weiter weg von der Alltagssprache |
| Quelle | Arbeitskarte im Board, Begriffe bestätigt | Arbeitskarte im Board, gestützt auf den Artikel zum Bildungssystem in Deutschland |

## 2 Die Dateien

```
vocab/bildungsabschnitte-lebenslang.json  Modell A, 11 Werte
vocab/bildungsstruktur-bereiche.json      Modell B, 6 Werte
vocab/isced-2011.json                     Referenzachse ED0–ED8, wird nicht erfasst
vocab/crosswalk-bildungsabschnitte.json   Übersetzung A ↔ B ↔ ISCED, Übergänge, offene Punkte
schema/bildungsabschnitt.schema.json      JSON Schema Draft-07, gegen Testfälle validiert
```

Alle Vokabulardateien folgen demselben Format: stabile Schlüssel getrennt vom Anzeigenamen, Herkunftsblock mit Abrufdatum und Prüfstand, `deprecated` statt Löschung. Die Begriffe sind aus der Primärquelle übernommen; Definitionen, Beispiele und Negativbeispiele sind Entwürfe und tragen `definitionStatus: "entwurf"`.

## 3 Die Definition des Feldes

Maßgeblich ist die **Primärzielgruppe**: in welcher Bildungsphase stehen die Menschen, die unmittelbar an den Angeboten teilnehmen. Nicht, wo mittelbar Wirkung entsteht.

Eine Organisation, die Lehrkräfte fortbildet, arbeitet in der berufsbezogenen Bildung — nicht in der schulischen, auch wenn die Wirkung bei Schülerinnen und Schülern ankommt. Die Endbegünstigten bleiben über das Zielgruppenfeld sichtbar. Ohne diese Festlegung wandert jede Organisation mit Schulbezug in die Schulkategorie, und das Feld verliert seine Aussagekraft.

## 4 Die kanonische Zuordnung

Die Arbeitskarte löst Modell A in Modell B auf. Bemerkenswert daran: Sie muss den Containerbegriff „Schulische Bildung" dreimal aufführen, jeweils mit einem Klammerzusatz.

| Bildungsbereich | Bildungsabschnitte aus Modell A |
|---|---|
| Elementarbereich | Frühkindliche Bildung · Kita · Übergang Kita – Schule |
| Primarstufe | Schulische Bildung **(Primarstufe)** |
| Sekundarstufe I | Schulische Bildung **(Sekundarstufe I)** |
| Sekundarstufe II | Schulische Bildung **(Sekundarstufe II)** · Übergang Schule – Beruf · Berufliche Erstausbildung |
| Tertiärer Bereich | Hochschule · Berufsbezogene Bildung (Weiterbildung) · Nebenberufliche Bildung (Weiterbildung) |
| Quartärer Bereich | Nachberufliche Bildung · Bildungsabschnitt Sonstiges |

**Das ist der empirische Beleg für das technische Argument:** Die Übersetzung von A nach B funktioniert nur, weil die Karte eine Information hinzufügt, die im Wert selbst nicht steckt. Aus „Schulische Bildung" allein lässt sich die Stufe nicht rekonstruieren. Wer nach Modell A erhebt und später auf Modell B umstellt, verliert diese Information dauerhaft. Umgekehrt ist die Übersetzung verlustfrei möglich.

## 5 Drei Punkte, die in der Zuordnung zu klären sind

**Weiterbildung im Tertiär- statt Quartärbereich.** Die Karte ordnet berufsbezogene und nebenberufliche Bildung dem Tertiärbereich zu, obwohl beide ausdrücklich als Weiterbildung bezeichnet sind. In der gängigen deutschen Systematik ist Weiterbildung der Quartärbereich; der Tertiärbereich umfasst Hochschul- und Fachschulbildung. Folge in der jetzigen Fassung: Der Quartärbereich enthält nur noch nachberufliche Bildung und den Auffangwert. Das ist vor einer Festlegung zu prüfen — entweder ist die Zuordnung bewusst so gewählt, oder der Quartärbereich wird unterbelegt.

**Der Auffangwert im Quartärbereich.** „Bildungsabschnitt Sonstiges" ist dort zugeordnet. Ein Auffangwert gehört sachlich in keinen bestimmten Bereich. Vorschlag: außerhalb der Systematik führen.

**Primarstufe und Sekundarstufe I als ein oder zwei Bereiche.** Die Karte führt beide unter einer gemeinsamen Überschrift, unterscheidet sie aber in den Einträgen. Dieses Vokabular führt sie als zwei Werte, weil die Unterscheidung in der Quelle vorhanden ist und Workshop 4 genau diese Differenzierung gefordert hat. Zu bestätigen.

## 6 Übergänge

Modell A führt zwei Übergänge als eigene Werte: Kita–Schule und Schule–Beruf. Modell B führt keine.

**Vorschlag aus Workshop 4, nicht beschlossen:** In Modell B werden Übergänge als Zusatzangabe neben den angrenzenden Bereichen geführt, nicht als eigene Werte. Wer nur „Übergang Sekundarstufe I" wählen könnte, fiele sonst aus der Kategorie Sekundarstufe I heraus, obwohl er damit zu tun hat.

**Regel:** Ein Übergang ist nur zulässig, wenn beide angrenzenden Bereiche ausgewählt sind. Diese Bedingung prüft die Anwendung, nicht das Schema.

**Die Stringenzlücke:** Modell A kennt nur zwei Übergänge. Der in Workshop 4 als fachlich ebenso bedeutsam benannte Übergang Primarstufe–Sekundarstufe I fehlt dort — an ihm entscheidet sich viel für Bildungsgerechtigkeit. Entweder werden alle Übergänge zwischen benachbarten Bereichen systematisch geführt, oder nur die beiden etablierten, und die Asymmetrie wird als bewusste Setzung dokumentiert. Der Crosswalk hält beide Varianten offen: Er führt fünf Übergänge und vermerkt je Eintrag, ob Modell A eine Entsprechung hat.

## 7 Crosswalk zu ISCED

| Bildungsbereich | ISCED | Qualität |
|---|---|---|
| Elementarbereich | ED0 | eindeutig |
| Primarstufe | ED1 | eindeutig |
| Sekundarstufe I | ED2 | eindeutig |
| Sekundarstufe II | ED3, teils ED4 | mehrdeutig |
| Tertiärer Bereich | ED5–ED8 | aggregiert |
| Quartärer Bereich | — | keine Entsprechung |

Zwei Bruchstellen bleiben. **ED4** liegt zwischen Sekundarstufe II und Tertiärbereich und ist nicht trennscharf. **Der Quartärbereich** hat in ISCED keine Entsprechung, weil ISCED Programme nach Niveau klassifiziert und Weiterbildung nicht als Lebensphase kennt. Nachberufliche Bildung ist damit ein eigenständiges Konzept der Arbeitsgruppe — kein Mangel, aber dokumentationspflichtig, damit es bei einer späteren internationalen Anbindung nicht stillschweigend verlorengeht.

## 8 Vorbehalte

Die Bezeichnung „KMK" aus Workshop 4 ist nicht belegt; die Arbeitskarte verweist auf den Wikipedia-Artikel zum Bildungssystem in Deutschland. Deshalb wird neutral von **Bildungsbereichen** gesprochen, der Alias bleibt in der Datei.

Die ISCED-Labels stammen aus einer Recherche, nicht aus einem Abruf der Eurostat-Quelle. Vor Produktivnutzung verifizieren.
