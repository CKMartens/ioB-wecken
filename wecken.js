/**
  ##########         WECKER          ##########
Script zum Wecken per iCal mit Alexa

  12.12.2018:   V0.0.1  Initialrelease (quick&Durty)
  14.06.2019:   V0.1.0  Code funktional überarbeitet
  15.06.2019:   V0.1.5  Individuelle Weckzeiten
  28.07.2019:   V0.3.0  Code vollständig umgebaut; Individueller Wecker vorübergehend entfernt; Datenpunkte neu angelegt
  21.08.2019:   V0.3.1  Helligkeitserhöhung und Lautstärkenerhöhung angepasst
  18.09.2019:   V0.3.3  Spotify Playlist eingefügt
  07.10.2019:   V0.3.5  Script generel überarbeitet; Setzen der Zeiten für VIS optimiert; Debugausgabe eingebaut

  to do:
    Subscriuption für Weckzeiten um bei Änderungen die Weckzeit neu zu Setzen
    Daten zum erstellen des Cron in DPs ablegen

  Author: CKMartens (carsten.martens@outlook.de)
  License: GNU General Public License V3, 29. Juni 2007
**/

/**
  ##########         Variablen          ##########
**/
const EchoDevice = '90F00718642500SQ';                  // ID des Echo Device über den geweckt werden soll
const EchoDeviceName = 'Echo Schlafzimmer';             // Wie heist der Echo im History Adapter

var Elke, Carsten, Name;

// Informationen mitloggen?
var DEBUG = true;

/**
  ##########         Pfade          ##########
**/
const JSPath                  = "javascript.0.";
const Path                    = JSPath + 'Wecker.';

/**
  ##########         Datenpunkte          ##########
**/
const Wecker = [
  {
    'Name':'Elke',                                      // Name für den der Wecker gilt
    'WeckzeitStd':'5',                                  // Weckzeit_Elke
    'WeckzeitMin':'20',                                 // Weckzeit_Elke
    'Wecker':true,                                      // Wecker ein
    'WeckerAn':false,                                   // Wecker läuft gerade
    'Wecken':true,                                      // Soll geweckt werden?
	  'MusicProvider' : '2',  							              // Musikanbieter 0=Amazon, 1=Spotify, 2=TuneIn
    'Playlist':'Radio Eins Coburg',                     // Playlist/Sender
    'MusikAn':true,                                     // Weckern mit Musik (Playlist)
    'LichtAn':true,                                     // Nachttischlicht an
    'LichtDev':'tradfri.0.L-65544.lightbulb.brightness',// Nachttischbeleichtung
    'iCal':'ical.1.events.0.today.Dienst',              // iCal Event
  },{
    'Name':'Carsten',
    'WeckzeitStd':'6',
    'WeckzeitMin':'30',
    'Wecker':true,
    'WeckerAn':false,
    'Wecken':false,
	  'MusicProvider' : '1',
    'Playlist':'Mono Inc',
    'MusikAn':true,
    'LichtAn':false,
    'LichtDev':'tradfri.0.L-65546.lightbulb.brightness',
    'iCal':'ical.0.events.0.today.Büro',
  }
];

for (var x in Wecker) {
  createState(Path+'iCal.'+Wecker[x].Name+'.WeckzeitStd', Wecker[x].WeckzeitStd, {read: true, write: true, type: 'string', name: 'Weckzeit', desc: 'Die einzustellende Stunde für die Wekzeit'});
  createState(Path+'iCal.'+Wecker[x].Name+'.WeckzeitMin', Wecker[x].WeckzeitMin, {read: true, write: true, type: 'string', name: 'Weckzeit', desc: 'Die einzustellende Minuten für die Wekzeit'});
  createState(Path+'iCal.'+Wecker[x].Name+'.WeckerEin', Wecker[x].Wecker, {read: true, write: true, type: 'boolean', name: 'Wecker eingeschaltet', desc: 'Signalisiert das der Wecker eingeschaltet ist'});
  createState(Path+'iCal.'+Wecker[x].Name+'.WeckerMusik', Wecker[x].MusikAn, {read: true, write: true, type: 'boolean', name: 'Wecken mit Musik', desc: 'Soll mit Musik geweckt werden?'});
  createState(Path+'iCal.'+Wecker[x].Name+'.WeckerLicht', Wecker[x].LichtAn, {read: true, write: true, type: 'boolean', name: 'Licht beim Wecken einschalten', desc: 'Soll die Nachttischbeleichtung eingeschaltet werden wenn geweckt wird?'});
  createState(Path+'iCal.'+Wecker[x].Name+'.WeckerAn', Wecker[x].WeckerAn, {read: true, write: true, type: 'boolean', name: 'Der Wecker ist an', desc: 'Zeigt an ob die Weckzeit erreicht wurde und gerade weckt'});
  createState(Path+'iCal.'+Wecker[x].Name+'.Wecken', Wecker[x].Wecken, {read: true, write: true, type: 'boolean', name: 'Soll geweckt werden', desc: 'Zeigt an ob überhaupt der Wecker gestellt werden soll'});
  createState(Path+'iCal.'+Wecker[x].Name+'.LichtDev', Wecker[x].LichtDev, {read: true, write: true, type: 'string', name: 'Der DP des Lichtes', desc: 'Welches Licht wird eingeschaltet beim wecken? Kompletter OID des Aktors.'});
  createState(Path+'iCal.'+Wecker[x].Name+'.Playlist', Wecker[x].Playlist, {read: true, write: true, type: 'string', name: 'Playlist zum Wecken', desc: 'Welche Amazon-Playlist zum Wecken mit Musik verwendet werden soll'});
  createState(Path+'iCal.'+Wecker[x].Name+'.MusicProvider', Wecker[x].MusicProvider, { read: true, write: true, type: 'number', name: 'Musik Anbieter', min: '0', max: '2', states: '0:Amazon;1:Spotify;2:TuneIn', desc: 'Welcher MUsik Anbieter verwendet werden soll'});
}

/**
  ##########         Pfade          ##########
**/


/**
  ##########         Funktionen          ##########
**/
function iCalWecker_stellen () {
  for (var x in Wecker) {
    let Name = Wecker[x].Name;
    let WeckerName = 'Wecker'+Name;

    if (getState(Wecker[x].iCal).val === true) {                                // Ist heute ein Arbeitstag?
      if (DEBUG) log('Wecker: Weckzeit nach iCal für '+Wecker[x].Name+' da ein Werktag ist');

      clearSchedule(WeckerName);                                                // lösche evtl laufenden Wecker
      WeckerName = null;

      if (getState(Path+'iCal.'+Name+'.Wecken').val === true) {                 // Prüfen ob an dem heutigen Arbeitstag geweckt werden soll
        if (DEBUG) log('Wecker: Weckzeit nach iCal für '+Wecker[x].Name+' Cron setzen da geweckt werden soll');

        const heute = new Date();                                               // Tag und Monat für Cron ermitteln
        let Tag = heute.getDate();
        let Monat = heute.getMonth() + 1;

        let WeckzeitStd = getState(Path+'iCal.'+Wecker[x].Name+'.WeckzeitStd').val;
        let WeckzeitMin = getState(Path+'iCal.'+Wecker[x].Name+'.WeckzeitMin').val;

        Weckzeit = WeckzeitMin + ' ' + WeckzeitStd + ' ' + Tag + ' ' + Monat + ' *';

        if (DEBUG) log('Wecker: Weckzeit nach iCal für '+Wecker[x].Name+': Weckcron='+Weckzeit);
        setState(Path + 'iCal.'+Wecker[x].Name+'.WeckerEin', true);             // State das der Wecker aktiviert wurde auf true
        setState(Path + 'iCal.'+Wecker[x].Name+'.WeckerAn', false);             // State das der Wecker gerade weckt auf false

        WeckerName = schedule(Weckzeit, function() {                            // Neuen Weckcron setzen
          Wecken(Name);
        });
      }
    } else {
      clearSchedule(WeckerName);
      WeckerName = null;
      setState(Path + 'iCal.'+Wecker[x].Name+'.WeckerEin', false);
      setState(Path + 'iCal.'+Wecker[x].Name+'.WeckerAn', false);
      if (DEBUG) log('Wecker: Weckzeit '+Wecker[x].Name+' gelöscht');
    }
  }
}

function Wecken(Name) {
  let WeckerName = 'Wecker'+Name;
  if (DEBUG) log('Wecker: Weckzeit für '+WeckerName+' erreicht');
  if (getState(Path + 'iCal.'+Name+'.WeckerEin').val == false) { // Wecker ist ausgeschatet
    if (DEBUG) log('Wecker: Wecker für '+WeckerName+' ausgeschaltet, Cron löschen');
    setState(Path + 'iCal.'+Name+'.WeckerEin',false);
    setState(Path + 'iCal.'+Name+'.WeckerAn', false);
    clearSchedule(WeckerName);
    WeckerName = null;
    return;
  } else {
    if (DEBUG) log('Wecker: Wecker für '+WeckerName+' eingeschaltet, Cron löschen, Wecker starten');
    setState(Path + 'iCal.'+Name+'.WeckerEin',false);
    setState(Path + 'iCal.'+Name+'.WeckerAn', true);
    clearSchedule(WeckerName);
    WeckerName = null;
  }

  if (getState(Path + 'iCal.'+Name+'.WeckerMusik').val == false) { // Wecker ohne Musik
    if (DEBUG) log('Wecker: Wecker für '+WeckerName+' ohne Musik');
    while (getState('alexa2.0.History.summary').val == 'stopp' && getState('alexa2.0.History.name').val == EchoDevice && getState(Path + 'Dienst.'+Name+'.WeckerAn').ts < getState('alexa2.0.History.summary').ts) {
      var Intervall = setInterval(function () {
        if (DEBUG) log('Wecker: Wecker für '+WeckerName+' Intervall für Weckansage gestartet');
        setState('alexa2.0.Echo-Devices.'+EchoDevice+'.Commands.speak-volume', 50);
        let temp_text = 'Guten Morgen '+Name+', Du musst leider aufstehen!'
        setState('alexa2.0.Echo-Devices.'+EchoDevice+'.Commands.speak', temp_text);
      }, 500);
    }
    clearInterval(Intervall);
    Intervall = null;
    if (DEBUG) log('Wecker: Wecker für '+WeckerName+' Intervall für Weckansage gestopt');
    setStateDelayed('alexa2.0.Echo-Devices.'+EchoDevice+'.Commands.speak-volume', 10, 7500, false);
  }

  if (getState(Path + 'iCal.'+Name+'.WeckerMusik').val == true) { // Wecker mit Musik aus Playlist
    if (DEBUG) log('Wecker: Wecker für '+WeckerName+' mit Musik');
    // Erst Alexa Wecken lassen, dann Musik an
    setState('alexa2.0.Echo-Devices.'+EchoDevice+'.Commands.speak-volume', 40);
    let temp_text = 'Guten Morgen '+Name+', Du musst leider aufstehen!';
    setState('alexa2.0.Echo-Devices.'+EchoDevice+'.Commands.speak', temp_text);
    setStateDelayed('alexa2.0.Echo-Devices.'+EchoDevice+'.Commands.speak-volume', 20, 7500, false);

    // Musik-Lautstärke auf 5%, wird kontinuielich gesteigert auf 20%
    setState('alexa2.0.Echo-Devices.'+EchoDevice+'.Player.volume', 5);
    let tmpPlLstNr = getState(Path + 'iCal.'+Name+'.MusicProvider').val;
    let tmpPlLst = getState(Path + 'iCal.'+Name+'.Playlist').val;
    if (DEBUG) log('Wecker: Wecker für '+WeckerName+' Musikwecker für Provider:'+tmpPlLstNr+' mit Playlist '+tmpPlLst);

    if (tmpPlLstNr == 0) {
		  setStateDelayed('alexa2.0.Echo-Devices.'+EchoDevice+'.Music-Provider.Amazon-Music-Playlist', tmpPlLst, 8000, false);
      if (DEBUG) log('Wecker: Wecker für '+WeckerName+' Playlist gesetzt');
	  } else if (tmpPlLstNr == 1) {
		  setStateDelayed('alexa2.0.Echo-Devices.'+EchoDevice+'.Music-Provider.Spotify-Playlist', tmpPlLst, 8000, false);
      if (DEBUG) log('Wecker: Wecker für '+WeckerName+' Playlist gesetzt');
	  } else if (tmpPlLstNr == 3) {
		  setStateDelayed('alexa2.0.Echo-Devices.'+EchoDevice+'.Music-Provider.TuneIn', tmpPlLst, 8000, false);
      if (DEBUG) log('Wecker: Wecker für '+WeckerName+' Playlist gesetzt');
	  }
    let ii = 8000;
    for (let i = 10; i <= 20; i += 5) {
      ii = ii + 5000;
      setStateDelayed('alexa2.0.Echo-Devices.'+EchoDevice+'.Player.volume', i, ii, false);
      if (DEBUG) log('Wecker: Wecker für '+WeckerName+' Lautstärkenerhöhung für Delay in '+ii+' MSek und Lautstärke '+i);
    }
  }

  if (getState(Path + 'iCal.'+Name+'.WeckerLicht').val == true) { // Wenn beim Wecken licht eingeschaltet werden soll
    var tmp_lichtDev = getState(Path + 'iCal.'+Name+'.LichtDev').val;
    if (DEBUG) log('Wecker: Wecker für '+WeckerName+' Licht miz OID '+tmp_lichtDev+' wird angeschaltet');
    setState(tmp_lichtDev, 5);
    let ii = 5000;
    for (var i = 10; i <= 40; i += 5) {
      ii = ii + 2000;
      setStateDelayed(tmp_lichtDev, i, ii, false);
      if (DEBUG) log('Wecker: Wecker für '+WeckerName+' Helligkeitserhöhung für Delay in '+ii+' MSek und Helligkeit '+i);
    }
  }
}

/**
   ######################################################################
   ##### Wecker stellen nach iCal um 3:05 Uhr                       #####
   ######################################################################
**/
schedule("5 3 * * *", function () {                                 // Checken ob heute Dienst ist
    iCalWecker_stellen();
    if (DEBUG) log('Wecker: Wecker nach iCal werden gesetzt nach Cron');
});


/**
   ######################################################################
   ##### Wecker stellen bei Scriptstart                             #####
   ######################################################################
**/
setTimeout(function () {
  iCalWecker_stellen();
  if (DEBUG) log('Wecker: Wecker nach iCal werden gesetzt wegen Skriptstart');
}, 1500);
