
// state

const state = {
  date: todayDate(),
  clientToken: 'hS6UafQpEo2tCAKxSUcFP04hy48V02',
  currentLocation: [51.520470, -0.087260],
  events: [],
  geojsonIcons: {}
}

// ------------------------ Format Date ---------------------------------

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function todayDate() {
  const today = new Date();
  return formatDate(today);
}
// ------------------------- PredictHQ --------------------------------

// returns an array of events around the users location
function getEventsFromUserLocation(range=2) {
  const userLatitude = state.currentLocation[0]
  const userLongitude = state.currentLocation[1]

  // will return a bunch of events a hazy distance from loactaion
  // return fetch(`https://api.predicthq.com//v1/events/?location_around.origin=${userLatitude},${userLongitude}`, {
    // method: 'GET',
    // headers: {
    //   'Authorization': 'Bearer ' + state.clientToken
    // })
    // .then(resp => resp.json())

  // will return an array of events within a specific range
  return fetch(`https://api.predicthq.com/v1/events/?limit=40&end.lte=${state.date}&within=${range}km@${userLatitude},${userLongitude}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + state.clientToken
    }
  })
    .then(resp => resp.json())
    .then(getEventsLocation);
}

// get location of all the events
function getEventsLocation(array) {
  state.events = array.results;
  state.geojsonIcons = {
    "type": "FeatureCollection",
    "features": []
  }
  state.events.forEach(convertToGeoJSON);
  debugger
}

// renders an icon for each event and places it in there correct position on map
function convertToGeoJSON(event) {
  const eventLat = event.location[0];
  const eventLong = event.location[1];
  const icon = {
    "type": "Feature",
     "properties": {
       "marker-color": "#2c607e",
       "marker-size": "medium",
       "marker-symbol": ""
       "title": `${event.title}`
       "description": `${event.description}`
     },
     "geometry": {
       "type": "Point",
       "coordinates": [
         eventLat,
         eventLong
       ]
     }
  };
  state.geojsonIcons.features.push(icon);
}

function initMap() {
  const latlng = new google.maps.LatLng(51.507734, -0.127888)
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: latlng
  });
}

// function geoLocationMap() {
//   const
// }
