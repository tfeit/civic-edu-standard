# Eine gemeinsame Sprache für unsere Wirkung

## Sachstand des Akteursprofils · Version 0.1

**Stand:** 15. September 2026
**Rahmen:** Koordinierungskreis Außerschulische Bildungsanbieter (KKAB)
**Status:** Arbeitsstand, offen für Rückmeldungen
**Repository:** https://github.com/tfeit/civic-edu-standard

---

## 1 Worum es geht

Der gemeinnützige Bildungssektor in Deutschland ist organisatorisch stark fragmentiert. Im KKAB sind mehrere Verbände zusammengeschlossen, die gemeinsam weit über 400 Organisationen repräsentieren. Jeder Verband erhebt Daten über seine Mitgliedsorganisationen individuell: nach eigenen Kategorien, in eigenen Systemen, für eigene Plattformen. Die Folge ist strukturelle Inkompatibilität. Sektorweite Auswertungen, Vergleiche oder die Identifikation unterversorgter Regionen sind nur mit erheblichem manuellem Aufwand möglich, wenn überhaupt.

**Ziel** ist ein gemeinsames Datenschema für Organisationsprofile — im Arbeitsgebrauch *Akteursprofil* —, das von den beteiligten Verbänden und ihren Plattformen als Austauschformat genutzt wird.

**Nicht das Ziel** ist, bestehende Plattformen zu ersetzen oder zu zentralisieren. Jede Plattform bleibt bestehen und bedient ihre Zielgruppen. Standardisiert wird die Semantik der Organisationsdaten — die gemeinsame Beschreibungssprache, auf die alle Systeme abbilden können.

**Der Geltungsbereich ist der Bildungssektor.** Ein Standard für die gesamte Zivilgesellschaft wäre ein zu großer Wurf und ist auch nicht nötig: Es genügen bestimmte Datenpunkte, um Akteure auffindbar und verknüpfbar zu machen. Bräuchte etwa die soziale Arbeit einen Standard, entstünde er sinnvollerweise aus einer eigenen Arbeitsgruppe — mit demselben Grundsatz, bestehende Konventionen nicht neu zu erfinden.

An der Erarbeitung beteiligt sind Vertreterinnen und Vertreter der Plattformen Nettiefinder (Netzwerk Stiftungen und Bildung), Kompass Bildungsförderung, Lernraumradar sowie MINT vernetzt und junge Tüftler.

---

## 2 Wie gearbeitet wurde

### Zwei Ebenen: Erfassung und Auswertung

Plattformen dürfen feiner erfassen, als der Standard abbildet. Eine der beteiligten Plattformen arbeitet bereits so: Erfasst werden Schlagworte, ausgewertet wird über eine Kodierung auf Handlungsfeld-Ebene. Dieses Muster wurde für den Standard übernommen. Es löst den Konflikt zwischen Erfassungsnähe und Auswertbarkeit, ohne dass eine Seite nachgeben muss.

### Zwei Durchgänge

Der erste Durchgang entscheidet nur, ob ein Feld in den Standard gehört. Der zweite bestimmt Vokabular, Datentyp und Verbindlichkeit. Diese Trennung verhindert, dass die Existenzfrage eines Feldes an einer Vokabulardiskussion scheitert.

Seit dem vierten Workshop werden je Feld vier Fragen beantwortet: Was bedeutet es? Welcher Datentyp steckt dahinter? Festes Vokabular, Mehrfachauswahl oder Freitext? Welche Verbindlichkeit?

### Zurückstellen statt streichen

Felder, die es nicht in Version 1.0 schaffen, werden mit dokumentierter Begründung zurückgestellt, nicht verworfen. Das hält spätere Versionen offen und macht die Entscheidungen nachvollziehbar, wenn jemand Monate später nachfragt.

### Erhebung und Publikation sind zweierlei

Eine Plattform erhebt die Angabe, ob eine Organisation fördernd oder operativ arbeitet, veröffentlicht sie aber bewusst nicht — um zu verhindern, dass das Netzwerk als Fundraising-Verteiler genutzt wird. Der Standard muss abbilden können, dass ein Feld erhoben, aber nicht publiziert wird. Diese Unterscheidung war zunächst nicht vorgesehen und ist aus der Praxis hinzugekommen.

### Identität und Wirkungsraum getrennt

Wo eine Organisation ansässig ist und wo sie wirkt, sind zwei verschiedene Dinge. Ein Hauptsitz in Berlin mit einem Lernlabor in München erzeugt einen Standort in der Identität und ein Wirkungsgebiet in der Geografie. Werden beide in ein Feld gelegt, ist die Auswertung wertlos.

### Der Maßstab

Zwei Sätze aus der Arbeitsgruppe markieren das Spannungsfeld, in dem alle Entscheidungen liegen:

> Wenn der Standard plötzlich Goldstandard ist und keiner kann ihn erfüllen, dann ist es auch Quatsch.

> Ein Standard muss ambitioniert sein — man kann nicht die schlechteste aller Grundgesamtheiten zur Grundlage machen.

Praktisch heißt das: Jedes Feld wird auch aus der Umsetzungsperspektive geprüft, nicht nur aus der Datenperspektive. Wenn ein Feld einzelne Organisationen vor Probleme stellt, kann das vertretbar sein. Wenn es viele sind, hindert es den Standard daran, in die Welt zu kommen.

---

## 3 Sachstand der Felder

Von 44 geprüften Feldern sind 21 aufgenommen, 18 für Version 1.0 zurückgestellt, der Rest offen. Die Blöcke Jahresstatistik und Personenkontext sind vollständig zurückgestellt; Version 1.0 ist ein reines Organisationsprofil.

### Block A · Identität

| Feld | Status | Anmerkung |
|---|---|---|
| Name | aufgenommen | |
| Rufname / Kurzform | offen | |
| Website | aufgenommen | Nicht jede Organisation hat eine |
| Allgemeine E-Mail-Adresse | offen | Rechtliche Klärung ausstehend |
| Telefon | offen | Organisationsbezogen, plattformunabhängig |
| Adresse / Standorte | aufgenommen | Granularität offen; getrennt vom Wirkungsraum |
| Stabile Organisations-ID | aufgenommen | Systemvergeben; Matching-Ziel für Plattform-IDs |
| Letzte Aktualisierung | aufgenommen | Nur manuelle Aktualisierungen zählen |
| Logo | aufgenommen, optional | |
| Cover | aufgenommen, optional | Nicht jede Organisation führt ein Bannerbild |
| Beschreibung | aufgenommen | |
| Detaillierte Beschreibung | offen | |
| Rechtsform | aufgenommen | Inklusive nicht eingetragener Initiativen und Einzelpersonen |
| Mutterorganisation | offen | Als Referenz, nicht als Freitext |
| Status | aufgenommen | Werteliste wird reduziert |
| Wikidata-Kennung | aufgenommen | |
| Handels- / Vereinsregister-Kennung | aufgenommen, bedingt | Nur bei registerpflichtiger Rechtsform |
| Geokoordinaten | zurückgestellt | Abhängig von der Adressentscheidung |
| Gründungsdatum, Governance-Gremien | zurückgestellt | |

### Block C · Tätigkeitsprofil

| Feld | Status | Anmerkung |
|---|---|---|
| Handlungsfelder | aufgenommen | Vokabular liegt vor: 23 Felder, Definitionen im Entwurf |
| Bildungsabschnitte | aufgenommen | Beide Modelle liegen vor, Entscheidung offen, siehe 4.4 |
| Zielgruppen | aufgenommen | Rollenmodell, Vokabular ausstehend |
| Nachhaltigkeitsziele (SDG) | aufgenommen, freiwillig | Begrenzung offen |
| Verwirklichung (operativ / fördernd / beides) | aufgenommen | Mit Sichtbarkeitssteuerung |
| Angebote | zurückgestellt | Eigener Eintragstyp, geringe Halbwertszeit |
| Kooperationspartner | zurückgestellt | Sinnvoll erst mit festen Identifikatoren |

### Block D · Wirkungsraum

| Feld | Status | Anmerkung |
|---|---|---|
| Aktiv in (Bundesland) | aufgenommen | Ableitbar, keine eigene Pflege |
| Reichweite | aufgenommen | Vokabular offen |
| Wirkungsgebiete | aufgenommen | Auflösung offen |

---

## 4 Entscheidungen mit Begründung

### 4.1 Warum Nachhaltigkeitsziele aufgenommen wurden, obwohl sie intern wenig bringen

Das Feld hat intern kaum Trennschärfe — Bildungsorganisationen zahlen auf wenige Ziele ein, erwartbar auf hochwertige Bildung und auf weniger Ungleichheiten. Auch das Auslaufen der Agenda 2030 sprach dagegen.

Aufgenommen wurde es trotzdem, aus einem Kosten-Nutzen-Argument statt einem Erkenntnisargument: Gerade weil die Kategorien intern wenig differenzieren, ist die Zuordnung aufwandsarm. Der Nutzen liegt außerhalb des Bildungssektors — die Nachhaltigkeitsziele sind derzeit das einzige global definierte, sektorenübergreifende Kategoriensystem, über das sich Daten aus verschiedenen Feldern verschneiden lassen. An Nachfolgearbeiten für die Zeit nach 2030 wird gearbeitet.

**Vorbehalt:** Steht ein besseres sektorenübergreifendes Vokabular zur Verfügung, wird getauscht.

### 4.2 Warum beendete Organisationen im Datenbestand bleiben

Der naheliegende Einwand lautet: Wenn eine Organisation nicht mehr existiert, sollte ihr Eintrag verschwinden. Dagegen spricht die Beziehungslogik. Kooperieren zwei Organisationen und fällt der Eintrag einer von beiden weg, verweist die Beziehung ins Leere. Die Entität hat bestanden, ihr Zustand hat sich geändert, und vergangene Beziehungen bleiben Teil der Datenlage. Erst wenn Einträge erhalten bleiben, ergibt ein Statusfeld überhaupt Sinn.

Praktischer Nebeneffekt: Ohne Statusfeld bleiben Einträge unbemerkt veraltet. In einer der beteiligten Plattformen sind zwischenzeitliche Insolvenzen nie nachgetragen worden.

**Offen:** Die Werteliste wird voraussichtlich reduziert. Der Wert „in Gründung" ist schwer zu pflegen und vermutlich nicht handlungsrelevant; entscheidend ist die Unterscheidung zwischen aktiv und aufgelöst.

### 4.3 Warum ein geografischer Bezug aufgenommen wird, obwohl er kaum differenziert

Der Einwand ist berechtigt: Wenn fast alle Organisationen dasselbe angeben, hat das Feld keinen Differenzierungscharakter und könnte entfallen. Innerhalb des eigenen Datenbestands stimmt das.

Aus größerer Perspektive stimmt es nicht. Sobald Daten mit anderen Beständen verschnitten werden, wird der Raumbezug entscheidend — und dort existieren Bezüge, die im eigenen Bestand nicht vorkommen. Für die Nutzbarkeit vor Ort gilt dasselbe: Wer in Potsdam sucht, will wissen, was in Potsdam ist, nicht was irgendwo in Brandenburg ist.

**Festgelegt:** Es wird kein eigenes Geo-Vokabular erfunden. Der Standard nutzt bestehende Systematiken administrativer Grenzen.

**Offen:** Welche. Diskutiert werden ein Trichterprinzip, bei dem man nur den präzisesten Raum angibt und alle übergeordneten Ebenen sich daraus ergeben, sowie eine grobe Stufenangabe von lokal bis supranational. Beide Varianten kommen in den Prototyp und werden daran getestet, was Ausfüllende tatsächlich verstehen.

**Wichtig dabei:** Gebiet und Reichweite sind nicht dasselbe. Wer in Bonn tätig ist, ist nicht automatisch landesweit tätig. Die Angabe, *wo* jemand wirkt, ersetzt nicht die Angabe, *auf welcher Ebene* — beides bleibt getrennt.

### 4.4 Bildungsabschnitte: zwei Modelle, Entscheidung offen

Die bisher geführte Werteliste vermischt zwei Systematiken. Sie liegen jetzt getrennt vor:

**Modell A — Bildungsabschnitte im Sinne lebenslangen Lernens.** Biografische Stationen von der frühkindlichen bis zur nachberuflichen Bildung, inklusive Übergangsphasen. Nah an der Selbstbeschreibung der Akteure. Schwäche: „Schulische Bildung" als ein Wert ist für einen Bildungsstandard zu grob — gerade dort ist die Mehrheit der Akteure unterwegs, und zwischen Grundschule, Sekundarstufe I und II bestehen erkennbare Unterschiede.

**Modell B — Bildungsbereiche.** Elementarbereich, Primarstufe, Sekundarstufe I und II, Tertiär- und Quartärbereich. Etabliert und trennscharf, anschlussfähig an Statistik und an die internationale Klassifikation. Schwäche: bildet Übergänge nicht ab und liegt weiter von der Alltagssprache entfernt.

**Zur Übergangsfrage** liegt ein Vorschlag vor: Übergänge werden nicht als eigene Kategorien geführt, sondern als Zusatzangabe neben den angrenzenden Bereichen. Wer nur „Übergang Sekundarstufe I" wählen könnte, fiele sonst aus der Kategorie Sekundarstufe I heraus, obwohl er damit zu tun hat. Der offene Punkt dabei: Wer den Übergang Schule–Beruf führt, müsste konsequenterweise auch den Übergang Primarstufe–Sekundarstufe I führen, der für Bildungsgerechtigkeit mindestens so bedeutsam ist.

**Ein technisches Argument gehört in die Entscheidung:** Aus „schulische Bildung" lässt sich die Stufe nicht rekonstruieren. Wer nach Modell A erhebt und später auf Modell B umstellt, verliert diese Information dauerhaft. Umgekehrt ist die Übersetzung möglich.

**Die Übersetzung zwischen beiden Modellen liegt vor** — und sie enthält ein aufschlussreiches Detail: Um Modell A in Modell B abzubilden, muss der Wert „Schulische Bildung" dreimal aufgeführt werden, jeweils mit einem Klammerzusatz für die Stufe. Genau diese Information steckt im Wert selbst nicht. Wer nach Modell A erhebt und später auf Modell B umstellt, verliert sie dauerhaft; umgekehrt ist die Übersetzung verlustfrei.

Drei Punkte der Zuordnung sind noch zu klären: Weiterbildungsangebote sind derzeit dem Tertiär- statt dem Quartärbereich zugeordnet, obwohl die gängige Systematik Weiterbildung im Quartärbereich führt. Der Auffangwert „Sonstiges" ist einem bestimmten Bereich zugeordnet, obwohl er sachlich in keinen gehört. Und ob Primarstufe und Sekundarstufe I einen oder zwei Bereiche bilden, ist in der Quelle uneindeutig.

Beide Modelle liegen als maschinenlesbare Vokabulare vor, dazu die Übersetzung zwischen ihnen und zur internationalen Klassifikation. Die Entscheidung fällt nach fachlicher Rückmeldung.

### 4.5 Zielgruppen: die Leitfrage entscheidet

Zielgruppen lassen sich **nicht** aus Bildungsabschnitten ableiten. Fachkräfte oder Eltern sind an keine Bildungsphase gebunden. Diese Frage war zwei Workshops lang offen und ist damit beantwortet.

Die Leitfrage, die das Feld erhebbar macht: **Wer nimmt an euren Angeboten teil?** Waren Schülerinnen und Schüler da? Lehrkräfte? Eltern? Damit wird die Primärzielgruppe erfasst — wer unmittelbar beteiligt ist, nicht wo mittelbar Wirkung entsteht. Eine Organisation, die über Lehrkräfte auf Schülerinnen und Schüler wirkt, bildet beides ab: die Lehrkräfte als Primärzielgruppe, die Schülerinnen und Schüler als Endbegünstigte.

Erfasst wird die **Rolle**, in der jemand teilnimmt. Eine erwachsene Person kann Lehrkraft und Elternteil zugleich sein; maßgeblich ist, in welcher Rolle sie am Angebot teilnimmt.

**Offen:** Das konkrete Vokabular. Die Herausforderung ist bekannt — Organisationen definieren Zielgruppen sehr unterschiedlich, und für die Aggregation braucht es Vergleichbarkeit. Auch eine grobe Angabe hilft aber schon: Zu wissen, ob eine Organisation mit Kindern oder mit Seniorinnen und Senioren arbeitet, schließt bei einer Auswertung vieles aus, was nicht gebraucht wird.

### 4.6 Ein wiederkehrendes Muster: Felder mit Qualitätsdimension

Sobald ein Feld eine Qualitätsaussage mittransportiert, entsteht ein Anreiz zur Übererfüllung. „Wir arbeiten in allen siebzehn Nachhaltigkeitszielen" klingt nach mehr als „in einem, sublokal im Viertel" — und in einer der beteiligten Plattformen findet sich genau dieser Fall. Solche Felder tendieren zu Eingaben, die nicht aussagekräftig sind, und verlieren damit die Trennschärfe, wegen der sie erhoben werden.

Gegenmittel sind eine Obergrenze für Mehrfachnennungen oder die Auszeichnung eines Primärwerts neben der Mehrfachauswahl. Welches wo greift, ist noch nicht entschieden — das Muster gilt es bei jedem betroffenen Feld mitzudenken.

### 4.7 Warum offene Daten auch gegenüber KI-Systemen sinnvoll sind

Ein zunehmender Teil der Suchanfragen läuft nicht mehr über Portale, sondern über KI-Systeme. Der naheliegende kritische Einwand: Unsere Webseiten werden gepflegt, aber nicht mehr besucht — sie werden nur noch ausgelesen.

Daraus zu folgern, man halte die Daten lieber zurück, führt in die falsche Richtung. Wer mit Informationen etwas bewirken will, ist an ihrer Qualität und Genauigkeit interessiert — und strukturierte, offene Daten verbessern genau das. Die eigene Arbeitsqualität nicht zu verbessern, damit andere davon nicht profitieren, trägt nicht weit.

Die Erwartung ist, dass ein Standard zuerst im eigenen Netzwerk wirkt: Die Beteiligten werden handlungsfähiger, weil sie einfacher zusammenarbeiten können. Was darüber hinaus geschieht, ist nachrangig.

Offen bleibt eine Frage, die alle Plattformbetreibenden betrifft: Woran messen wir künftig Erfolg? An Aufrufen — oder an dem, was nur auf der eigenen Plattform möglich ist?

---

## 5 Wo Rückmeldung gebraucht wird

Dies sind die Punkte, an denen die Arbeitsgruppe noch keine tragfähige Antwort hat.

**Bildungsabschnitte.** Welches der beiden Modelle bildet die Praxis besser ab? Ist die Differenzierung innerhalb der schulischen Bildung nötig? Und wie werden Übergänge sinnvoll abgebildet, ohne die Stringenz zu verlieren?

**Geografische Auflösung.** Welche Granularität ist realistisch pflegbar — und welche wird für Auswertungen tatsächlich gebraucht? Wer kann was liefern?

**Zielgruppenvokabular.** Wie lassen sich Zielgruppen so fassen, dass sie über Organisationstypen hinweg vergleichbar bleiben, ohne zu grob zu werden?

**Handlungsfelder.** Die Liste umfasst 23 Felder und liegt vor; die Definitionen sind Entwürfe. Zur Diskussion stehen drei Punkte: Die Begriffe sind nicht alle dieselbe Art von Kategorie — neben thematischen Feldern stehen zielgruppenbezogene (Lehrkräftebildung, Elternbildung) und Meta-Ebenen (Bildungssystem, Bildungsmanagement). Diversität und Inklusion überschneiden sich. Und es fehlt ein Feld für Interessenvertretung. Als Aggregationsachsen nach außen sind die Engagementfelder der Zivilgesellschaftsstatistik und die internationale Klassifikation gemeinnütziger Organisationen vorgeschlagen — abgeleitet, nicht abgefragt.

**Anreize.** Die offenste Frage überhaupt: Welcher Hebel bringt Organisationen dazu, Daten bereitzustellen? Sichtbarkeit allein reicht nach mehrjähriger Erfahrung nicht aus. Denkbar wäre, dass Standardisierung dort greift, wo sie an bestehende Berichtspflichten anschließt — etwa wenn Fördermittelgebende ein gemeinsames Berichtsformat setzen.

**Aufwand.** Was braucht eine Organisation, um solche Daten überhaupt liefern zu können? Die Antwort dürfte je nach Größe deutlich verschieden ausfallen — zwischen rein ehrenamtlichen Initiativen und Organisationen mit hauptamtlicher Struktur.

---

## 6 Wie es weitergeht

Der Stand vom 15. September wird unter dem Vorbehalt *safe enough to try* als Version 0.1 gesetzt. Das ist ausdrücklich keine abschließende Festlegung, sondern eine Arbeitsgrundlage: Auf ihrer Basis entsteht ein Beispieldatensatz aus realen Organisationsdaten, der zeigt, was in dem Schema steckt. Ein Standard, der nur auf dem Papier existiert, hilft niemandem.

Parallel entsteht ein Prototyp in Formularform. Er ist kein Produkt, sondern ein Verständigungsmittel: Er zeigt links, was eine Organisation eingeben würde, und rechts, was daraus als Austauschformat entsteht. Für die offenen Vokabularfragen dient er als Testumgebung — die Varianten werden eingebaut und daran geprüft, was Ausfüllende verstehen.

**Mitwirkung** ist an mehreren Stellen möglich: Rückmeldung zu den offenen Fragen in Abschnitt 5, Bereitstellung von Beispieldatensätzen aus bestehenden Plattformen, oder Mitarbeit an der Weiterentwicklung. Der Arbeitsstand liegt öffentlich im Repository.

---

## Anhang · Referenzen

**Vorbilder**
Nova SBE Social Database (Portugal) — Kartierung sozialer Organisationen, zeigt die Machbarkeit sektorweiter Aggregation
IATI — föderierte Datenpublikation über standardisierte Schnittstellen ohne zentrale Datenhaltung
Social Reporting Standard — inhaltlicher Bezugspunkt im deutschen Kontext, als Berichtsdokument konzipiert, nicht als maschinenlesbares Format

**Vokabulare und Systematiken, an die angeknüpft wird**
Amtliche Gemeinde- und Regionalschlüssel für den Raumbezug
DCAT-AP.de für die Publikation als offene Daten
ISCED 2011 als internationale Referenz für Bildungsstufen
Wikidata als öffentlicher, nicht-kommerzieller Identifikator für Organisationen

**Dokumente in diesem Repository**
`BILDUNGSABSCHNITTE.md` — die zwei Modelle im Detail, mit Übersetzung und offenen Punkten
`HANDLUNGSFELDER.md` — die 23 Felder, mit Analyse der Abgrenzungen und Aggregationsvorschlag
`vocab/` — maschinenlesbare Vokabulare mit Herkunftsangabe und Prüfstand
`schema/` — JSON-Schema-Fragmente, gegen Testfälle validiert
