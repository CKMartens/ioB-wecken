
Deutsche Beschreibung/German discription:
-----------------------------------------

ioBroker Javascript um an Arbeitstagen pünktlich geweckt zu werden. Der Arbeitstag wird durch den iCal-Adapter ermittelt. Geweckt wird über eine anzugebende Playlist wahlweise von Amazon Music,
Spotify oder TuneIn. Die Genaue Weckzeit wird in einem Datenpunk angelegt. Zum Wecken kann auch ein angegebener Aktor für Licht angeschaltet werden. Das Licht und die Lautstärke werden langsam
hochgefahren.

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
  
  to do:
  - Variable mit Anzahl der zu weckenden Personen
  - Weckzeit aus iCal-Adapter übernehmen
  - Subscriuption für Weckzeiten um bei Änderungen die Weckzeit neu zu Setzen
  - Daten zum erstellen des Cron in DPs ablegen
