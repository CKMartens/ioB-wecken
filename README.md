
Deutsche Beschreibung/German discription:
-----------------------------------------

ioBroker Javascript um an Arbeitstagen pünktlich geweckt zu werden. Der Arbeitstag und der Beginn der Arbeitszeit wird durch den iCal-Adapter ermittelt.
Optional wird die Fahrzeit zur Arbeit über den RoadTraffic-Adapter ermittelt un in die Weckzeit einbezogen. Ändert sich die Fahrzeit um mindestens
5 Minuten wird der Wecker neu gesetzt. Es wird angegeben wie lange vor Abfahrt zur Arbeit geweckt werden soll.
Geweckt wird über eine anzugebende Playlist wahlweise von Amazon Music, Spotify oder TuneIn.
Zum Wecken kann auch ein angegebener Aktor für Licht angeschaltet werden. Das Licht und die Lautstärke werden langsam hochgefahren.

* 12.12.2018  V0.0.1  + Initialrelease (quick&Durty)
* 14.06.2019  V0.1.0  ~ Code funktional überarbeitet
* 15.06.2019  V0.1.5  + Individuelle Weckzeiten
* 28.07.2019  V0.3.0  ~ Code vollständig umgebaut
                      - Individueller Wecker vorübergehend entfernt
                      ~ Datenpunkte neu angelegt
* 21.08.2019  V0.3.1  ~ Helligkeitserhöhung und Lautstärkenerhöhung angepasst
* 18.09.2019  V0.3.3  + Spotify und TuneIn Playlist eingefügt
* 07.10.2019  V0.3.5  ~ Script generel überarbeitet
                      ~ Setzen der Zeiten für VIS optimiert
                      + Debugausgabe eingebaut
* 08.11.2020  V0.4.0  ~ Script generel überarbeitet
                      + Setzen der Weckzeit nach Verkehr und Dienstplan
* 09.11.2020  V0.4.1  - Bugfix: Error NaN abfangen
* 09.11.2020  V0.4.2  + Auswahl einmal/mehrmals am Tag wecken
* 09.11.2020  V0.4.3  - Fehler bei der Weckzeitberechnung behoben
* 10.11.2020  V0.4.4  + jedem Benutzer eigene Alexa ID zuordnen
* 11.11.2020  V0.4.5  - Bugfix für Cron zum zurücksetzen von State WeckerHeute

  to do:
   - alternativ Alexa-Wecker stellen
   
 ###SetUp:
 - Adapter iCal wird zwingend benötigt. In den Settings darf der Punkt "Ersetze Datum mit Worten" nicht aktiviert sein. Ein Event muss angelegt sein.
 - Adapter Alexa2 wird zwingen benötigt.
 - Das Script [createUserStates von Mic-C](https://github.com/Mic-M/iobroker-createUserStates) wird zwingend zum Anlegen der States benötigt.
 - Adapter RoadTraffic ist optional.
 - Im Scripte müssen die Benutzer und die AlexaID angepasst werden:
 const Benutzer = [{'Name':'Simone', 'EchoDevice':'12345678980'}, {'Name':'Simon', 'EchoDevice':'12345678980'}];
 
 ###States:
 - 0_userdata.0.Wecker.BENUTZER.LichtAktor
 hier wird der Aktor des zu schaltenden Lichts angegeben
 - 0_userdata.0.Wecker.BENUTZER.LichtAn
 soll das Licht beim wecken geschaltet werden
 -0_userdata.0.Wecker.BENUTZER.MusicProvider
 hier wird der zu benutzende MusicProvider angelegt 0=Amazon Music, 1=Spotify und 2=TuneIN
 - 0_userdata.0.Wecker.BENUTZER.Playlist
 die zu benutzende Playlist bei dem jeweiligen Provider
 - 0_userdata.0.Wecker.BENUTZER.RoadTraffic
 gibt an ob RoadTraffiux benutzt werden soll
 - 0_userdata.0.Wecker.BENUTZER.RoadTraffic_Name
 der Name der Strecke im Adapter RoadTraffic
 - 0_userdata.0.Wecker.BENUTZER.WeckerAn
 gibt an ob der Wecker angeschaltet werden soll, also aktiv sein soll
 - 0_userdata.0.Wecker.BENUTZER.WeckerGesetzt
 zeigt an ob der Wecker gesetzt wurde
 - 0_userdata.0.Wecker.BENUTZER.Wecker
 die Weckzeit die gesetzt wurde
 - 0_userdata.0.Wecker.BENUTZER.WeckerHeute
 zeigt an ob am heutigen Tag bereits einmal geweckt wurde
 - 0_userdata.0.Wecker.BENUTZER.WeckerMehrmals
 hier kann eingestellt werden, ob an einem Tag mehrmals geweckt wird, z.B. bei Früh- und Nachtschicht an einem Tag
 - 0_userdata.0.Wecker.BENUTZER.Weckzeit
 hier wird eingestellt wie lange vor Abfahrt geweckt werden soll
 - 0_userdata.0.Wecker.BENUTZER.iCal_Event
 das Event im iCal-Adapter, das Anzeigt ob an diesem Tag ein Arbeitstag ist, z.B. 'Dienst'
 - 0_userdata.0.Wecker.BENUTZER.iCal_Instanz
 die iCal-Instanz für diesen Benutzer in dem der Kallender und Event eingetragen ist, z.B. 0
