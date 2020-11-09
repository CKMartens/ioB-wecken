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
  08.11.2020    V0.4.0  Script generel überarbeitet; Setzen der Weckzeit nach Verkehr und Dienstplan
  09.11.2020    V0.4.1  Error NaN abfangen
  09.11.2020    V0.4.2  Auswahl einmal/mehrmals am Tag wecken
  09.11.2020    V0.4.3  Fehler bei der Weckzeitberechnung behoben
  
  to do:
    jedem Benutzer eigene Alexa ID zuordnen
    alternativ Alexa-Wecker stellen

  Author: CKMartens (carsten.martens@outlook.de)
  License: GNU General Public License V3, 29. Juni 2007
**/

/**
  ##########         Variablen          ##########
**/
const EchoDevice = '90F00718642500SQ';                                          // ID des Echo Device über den geweckt werden soll
const EchoDeviceName = 'Echo Schlafzimmer';                                     // Wie heist der Echo im History Adapter
const Benutzer = [{'Name':'Elke'}, {'Name':'Carsten'}];                         // Namen der Benutzer

// Informationen mitloggen?
var DEBUG = true;

/**
  ##########         Pfade          ##########
**/
const Path = 'Wecker.';

/**
  ##########         Datenpunkte          ##########
**/
for (var x in Benutzer) {
  let Name = Benutzer[x].Name;
  var DPPath = Path + Name + '.';
  let IsState = '0_userdata.0.' + DPPath + 'iCal_Instanz';
  if (existsState(IsState)) {
    if (DEBUG) log('Wecker: Datenpunkte für ' + Name + ' bereits angelegt');
  } else {
    let statesToCreate = [
      [DPPath + 'iCal_Instanz', {'name':'Nummer der iCal Instanz', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'0' }],
      [DPPath + 'iCal_Event', {'name':'iCal Event', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'Arbeit' }],
      [DPPath + 'RoadTraffic_Name', {'name':'Name der Strecke', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'Weg zur Arbeit' }],
      [DPPath + 'RoadTraffic_LastDurration', {'name':'Letzte Streckenzeit', 'type':'number', 'read':true, 'write':true, 'role':'info', 'def':0 }],
      [DPPath + 'RoadTraffic', {'name':'Roadtraffic Zeit einrechnen?', 'type':'boolean', 'read':true, 'write':true, 'role':'info', 'def':true }],
      [DPPath + 'Weckzeit', {'name':'Weckzeit vor Abfahrt in Minuten', 'type':'number', 'read':true, 'write':true, 'role':'info', 'def':45 }],
      [DPPath + 'WeckerAn', {'name':'Wecker anschalten?', 'type':'boolean', 'read':true, 'write':true, 'role':'info', 'def':false }],
      [DPPath + 'WeckerHeute', {'name':'Wurde heute schon einmal geweckt?', 'type':'boolean', 'read':true, 'write':true, 'role':'info', 'def':false }],
      [DPPath + 'WeckerMehrmals', {'name':'Soll mehrmals am Tag geweckt werden?', 'type':'boolean', 'read':true, 'write':true, 'role':'info', 'def':false }],
      [DPPath + 'WeckerGesetzt', {'name':'Wecker gesetzt?', 'type':'boolean', 'read':true, 'write':true, 'role':'info', 'def':false }],
      [DPPath + 'MusicProvider', {'name':'Welcher Musikanbieter', 'type':'number', 'read':true, 'write':true, 'states': '0:Amazon;1:Spotify;2:TuneIn', 'min':'0', 'max':'2', 'role':'info', 'def':0 }],
      [DPPath + 'Playlist', {'name':'Name der Playlist', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'Weg zur Arbeit' }],
      [DPPath + 'LichtAn', {'name':'Licht beim wecken anschalten?', 'type':'boolean', 'read':true, 'write':true, 'role':'info', 'def':false }],
      [DPPath + 'LichtAktor', {'name':'Was soll eingeschaltet werden', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'deconz.0.xxx.yyy.state' }],
    ];
    createUserStates('0_userdata.0', false, statesToCreate);
    if (DEBUG) log('Wecker: Datenpunkte für ' + Name + ' angelegt');
  }
}


/**
  ##########         Funktionen          ##########
**/

/**
   ######################################################################
   ##### Wecker wird gestellt                                       #####
   ######################################################################
**/
function iCalWecker_stellen (Name) {
  let WeckerName = 'Wecker' + Name;
  let iCal_Event = getState('0_userdata.0.Wecker.' + Name + '.iCal_Event').val;
  let iCal_Instanz = getState('0_userdata.0.Wecker.' + Name + '.iCal_Instanz').val;
  let RoadTraffic_Name = getState('0_userdata.0.Wecker.' + Name + '.RoadTraffic_Name').val;
  let RoadTraffic = getState('0_userdata.0.Wecker.' + Name + '.RoadTraffic').val;
  let Weckzeit = getState('0_userdata.0.Wecker.' + Name + '.Weckzeit').val;
  let WeckerAn = getState('0_userdata.0.Wecker.' + Name + '.WeckerAn').val;
  let WeckerGesetzt = getState('0_userdata.0.Wecker.' + Name + '.WeckerGesetzt').val;
  let WeckerMehrmals = getState('0_userdata.0.Wecker.' + Name + '.WeckerMehrmals').val;
  let WeckerHeute = getState('0_userdata.0.Wecker.' + Name + '.WeckerHeute').val;

  if (!WeckerMehrmals && WeckerHeute) {
    clearSchedule(WeckerName);
    WeckerName = null;
    setState('0_userdata.0.Wecker.' + Name + '.WeckerGesetzt', false);
    if (DEBUG) log('Wecker: Wecker wurde heute für ' + Name + ' schon ausgeführt');
    return;
  }

  if (getState('ical.' + iCal_Instanz + '.events.0.today.' + iCal_Event).val && WeckerAn ) { // Ist heute ein Arbeitsttag und soll der Wecker angeschaltet werden?
    if (DEBUG) log('Wecker: Wecker für ' + Name + ' wird gestellt');
    let iCal = getState('ical.' + iCal_Instanz + '.data.text').val;
    let WeckStd = parseFloat(iCal.slice(iCal.indexOf(iCal_Event) - 12, iCal.indexOf(iCal_Event) - 10));
    let WeckMin = parseFloat(iCal.slice(iCal.indexOf(iCal_Event) - 9, iCal.indexOf(iCal_Event) - 7));
    let TrafficTime = Math.ceil(getState('roadtraffic.0.' + RoadTraffic_Name + '.route.duration').val / 60);
    setState('0_userdata.0.Wecker.' + Name + '.RoadTraffic_LastDurration', getState('roadtraffic.0.' + RoadTraffic_Name + '.route.duration').val);

    if (!RoadTraffic) {
        TrafficTime = 0
    }
    
    Weckzeit = Weckzeit + TrafficTime;

    let Std = Math.round(Weckzeit / 60);
    let Min = Weckzeit - Std * 60;
    WeckStd = WeckStd - Std;
    WeckMin = WeckMin - Min;
    if (WeckMin < 0) {
      WeckMin = 60 + WeckMin;
      WeckStd = WeckStd - 1;
    }

    clearSchedule(WeckerName);                                                  // lösche evtl laufenden Wecker
    WeckerName = null;

    if (isNaN(WeckMin) || isNaN(WeckStd)) {
      if (DEBUG) log('Wecker: Weckzeit kann nicht gestellt werden, iCal liefert keine Zeiten');
      setState('0_userdata.0.Wecker.' + Name + '.WeckerGesetzt', false);        // State das der Wecker aktiviert wurde auf true
    } else {
      const heute = new Date();                                                 // Tag und Monat für Cron ermitteln
      let WeckzeitTag = heute.getDate();
      let WeckzeitMonat = heute.getMonth() + 1;
      let WeckzeitStd = ('' + WeckStd);
      let WeckzeitMin = ('' + WeckMin);

      Weckzeit = WeckzeitMin + ' ' + WeckzeitStd + ' ' + WeckzeitTag + ' ' + WeckzeitMonat + ' *';

      if (DEBUG) log('Wecker: Weckzeit nach iCal für ' + Name + ': ' + WeckzeitStd + ':' + WeckzeitMin + ' Weckcron='+Weckzeit);

      setState('0_userdata.0.Wecker.' + Name + '.WeckerGesetzt', true);         // State das der Wecker aktiviert wurde auf true

      WeckerName = schedule(Weckzeit, function() {                              // Neuen Weckcron setzen
          Wecken(Name);
      });
    }
  } else {
    clearSchedule(WeckerName);
    WeckerName = null;
    setState('0_userdata.0.Wecker.' + Name + '.WeckerGesetzt', false);
    if (DEBUG) log('Wecker: Weckzeit ' + Name + ' gelöscht');
  }
}

/**
   ######################################################################
   ##### Benutzer wird geweckt                                      #####
   ######################################################################
**/
function Wecken(Name) {
  let WeckerName = 'Wecker'+Name;
  if (DEBUG) log('Wecker: Weckzeit für ' + Name + ' erreicht');
  if (getState('0_userdata.0.Wecker.' + Name + '.WeckerAn').val === false) {     // Wecker ist ausgeschatet
    if (DEBUG) log('Wecker: Wecker für ' + Name + ' nach Aktivierung ausgeschaltet, Cron löschen');
    clearSchedule(WeckerName);
    WeckerName = null;
    return;
  } else {
    if (DEBUG) log('Wecker: Wecker für ' + Name + ' eingeschaltet, Cron löschen, Wecker starten');
    setState('0_userdata.0.Wecker.' + Name + '.WeckerGesetzt', false);
    setState('0_userdata.0.Wecker.' + Name + '.WeckerHeute', true);             // State das der Wecker heute schon gestartet wurde auf true
    clearSchedule(WeckerName);
    WeckerName = null;
  }
  setState('alexa2.0.Echo-Devices.' + EchoDevice + '.Commands.speak-volume', 40);
  let temp_text = 'Guten Morgen ' + Name + ', Du musst leider aufstehen!';
  setState('alexa2.0.Echo-Devices.' + EchoDevice + '.Commands.speak', temp_text);
  setStateDelayed('alexa2.0.Echo-Devices.' + EchoDevice + '.Commands.speak-volume', 20, 7500, false);
  // Musik-Lautstärke auf 5%, wird kontinuielich gesteigert auf 20%
  setState('alexa2.0.Echo-Devices.' + EchoDevice + '.Player.volume', 5);
  let MusicProvider = getState('0_userdata.0.Wecker.' + Name + '.MusicProvider').val;
  let Playlist = getState('0_userdata.0.Wecker.' + Name + '.Playlist').val;
  if (DEBUG) log('Wecker: Wecker für ' + Name + ' Musikwecker für Provider:' + MusicProvider + ' mit Playlist ' + Playlist);

  if (MusicProvider == 0) {
    setStateDelayed('alexa2.0.Echo-Devices.' + EchoDevice + '.Music-Provider.Amazon-Music-Playlist', Playlist, 8000, false);
    if (DEBUG) log('Wecker: Wecker für ' + Name + ' Playlist gesetzt');
  } else if (MusicProvider == 1) {
    setStateDelayed('alexa2.0.Echo-Devices.' + EchoDevice + '.Music-Provider.Spotify-Playlist', Playlist, 8000, false);
    if (DEBUG) log('Wecker: Wecker für ' + Name + ' Playlist gesetzt');
  } else if (MusicProvider == 3) {
    setStateDelayed('alexa2.0.Echo-Devices.' + EchoDevice + '.Music-Provider.TuneIn', Playlist, 8000, false);
    if (DEBUG) log('Wecker: Wecker für ' + Name + ' Playlist gesetzt');
  }
  let ii = 8000;
  for (let i = 10; i <= 20; i += 5) {
    ii = ii + 5000;
    setStateDelayed('alexa2.0.Echo-Devices.' + EchoDevice + '.Player.volume', i, ii, false);
    if (DEBUG) log('Wecker: Wecker für ' + Name + ' Lautstärkenerhöhung für Delay in ' + ii + ' MSek und Lautstärke ' + i);
  }
  let LichtAn = getState('0_userdata.0.Wecker.' + Name + '.LichtAn').val;

  if (LichtAn) {                                                                // Wenn beim Wecken licht eingeschaltet werden soll
    let LichtAktor = getState('0_userdata.0.Wecker.' + Name + '.LichtAktor').val;
    if (DEBUG) log('Wecker: Wecker für ' + Name + ' Licht mit OID ' + LichtAktor + ' wird angeschaltet');
    setState(LichtAktor, 5);
    let ii = 5000;
    for (var i = 10; i <= 40; i += 5) {
      ii = ii + 2000;
      setStateDelayed(LichtAktor, i, ii, false);
      if (DEBUG) log('Wecker: Wecker für ' + Name + ' Helligkeitserhöhung für Delay in ' + ii + ' MSek und Helligkeit ' + i);
    }
  }
}

/**
   ######################################################################
   ##### Subscriptons für Wecker setzen                             #####
   ######################################################################
**/
function setSubscriptions(Name) {
  let RoadTraffic_Name = getState('0_userdata.0.Wecker.' + Name + '.RoadTraffic_Name').val;
  let RoadTraffic = getState('0_userdata.0.Wecker.' + Name + '.RoadTraffic').val;
  let iCal_Instanz = getState('0_userdata.0.Wecker.' + Name + '.iCal_Instanz').val;

  // iCal Daten haben sich geändert
  on({id: 'ical.' + iCal_Instanz + '.data.text', change: "ne"}, async function (obj) {
    if (DEBUG) log('Wecker: iCal wurde geändert, Wecker neu stellen');
    iCalWecker_stellen(Name);
  });

  // Wecker wurde an-/ausgeschaltet
  on({id: '0_userdata.0.Wecker.' + Name + '.WeckerAn', change: "ne"}, async function (obj) {
    if (DEBUG) log('Wecker: WeckerAn wurde geändert, Wecker neu stellen');
    iCalWecker_stellen(Name);
  });

  // Weckzeit vor Abfahrt wurde geändert
  on({id: '0_userdata.0.Wecker.' + Name + '.Weckzeit', change: "ne"}, async function (obj) {
    if (DEBUG) log('Wecker: Weckerzeit wurde geändert, Wecker neu stellen');
    iCalWecker_stellen(Name);
  });

  // Fahrzeit hat sich um mind. 5 Minuten geändert
  on({id: 'roadtraffic.0.' + RoadTraffic_Name + '.route.duration', change: "ne"}, async function (obj) {
    let RoadTraffic_LastDurration = getState('0_userdata.0.Wecker.' + Name + '.RoadTraffic_LastDurration').val;
    let RoadTraffic_Durration = getState('roadtraffic.0.' + RoadTraffic_Name + '.route.duration').val
    if ((RoadTraffic_LastDurration - 300) > RoadTraffic_Durration || (RoadTraffic_LastDurration + 300) < RoadTraffic_Durration) {
      if (DEBUG) log('Wecker: Fahrzeit wurde um 5 Minuten geändert, Wecker neu stellen');
      iCalWecker_stellen(Name);
    }
  });

}


/**
   ######################################################################
   ##### Wecker stellen nach iCal um 3:05 Uhr                       #####
   ######################################################################
**/
schedule("5 1 * * *", function () {                                             // Checken ob heute Dienst ist
  for (var y in Benutzer) {
    let Name = Benutzer[y].Name;
    setState('0_userdata.0.Wecker.' + Name + '.WeckerHeute', false);            // Der Wecker wurde heute noch nicht gesetzt
    iCalWecker_stellen(Name);
    if (DEBUG) log('Wecker: Wecker nach iCal werden gesetzt nach Cron');
  }
});


/**
   ######################################################################
   ##### Wecker stellen bei Scriptstart                             #####
   ######################################################################
**/
setTimeout(function () {
  for (var y in Benutzer) {
    let Name = Benutzer[y].Name;
    setSubscriptions(Name);
    if (DEBUG) log('Wecker: Subscriptinons für ' + Name + ' angelegt');
    iCalWecker_stellen(Name);
    if (DEBUG) log('Wecker: Wecker nach iCal werden gesetzt wegen Skriptstart');
  }
}, 1500);
