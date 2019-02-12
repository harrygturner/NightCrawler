// Quick change



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
       "marker-symbol": "",
       "title": `${event.title}`,
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


// Map Box API

mapboxgl.accessToken = 'pk.eyJ1IjoiY2xhdWRpZm94IiwiYSI6ImNqczFud2tiNzBlbTI0M2t2aGpuMzBqb2QifQ.xc_ZOhqTlgjd3sIoLBrS9Q';
let map = new mapboxgl.Map({
container: 'map', // container id
style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
center: [-0.127888, 51.507734], // starting position [lng, lat]
zoom: 8 // starting zoom
});

map.on('load', function() {
  map.setPaintProperty('building', 'fill-color', [
    "interpolate",
    ["exponential", 0.5],
    ["zoom"],
    15,
    "#e2714b",
    22,
    "#eee695"
  ]);

  map.setPaintProperty('building', 'fill-opacity', [
    "interpolate",
    ["exponential", 0.5],
    ["zoom"],
    15,
    0,
    22,
    1
    ]);
});

document.getElementById('zoom').addEventListener('click', function () {
map.zoomTo(17, {duration: 9000});
});

const geocoder = new MapboxGeocoder({
accessToken: mapboxgl.accessToken
});

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
