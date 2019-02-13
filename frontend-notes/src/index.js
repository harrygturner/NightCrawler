// things we will need to select/append element to
const sidebar = document.querySelector('#side-nav');


// state

const state = {
  date: todayDate(),
  clientToken: 'hS6UafQpEo2tCAKxSUcFP04hy48V02',
  currentLocation: null, // [long, lat]
  events: [],
  selectedEvent: null,
  geojsonIcons: {}
}

//------------------------- Map Box API -----------------------------

mapboxgl.accessToken = 'pk.eyJ1IjoiY2xhdWRpZm94IiwiYSI6ImNqczFud2tiNzBlbTI0M2t2aGpuMzBqb2QifQ.xc_ZOhqTlgjd3sIoLBrS9Q';
let map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
  center: [-0.127888, 51.507734], // starting position [lng, lat]
  zoom: 7 // starting zoom
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
  const userLongitude = state.currentLocation[0]
  const userLatitude = state.currentLocation[1]

  // will return a bunch of events a hazy distance from loactaion
  // return fetch(`https://api.predicthq.com//v1/events/?location_around.origin=${userLatitude},${userLongitude}`, {
    // method: 'GET',
    // headers: {
    //   'Authorization': 'Bearer ' + state.clientToken
    // })
    // .then(resp => resp.json())

  // will return an array of events within a specific range
  return fetch(`https://api.predicthq.com/v1/events/?limit=40&within=${range}km@${userLatitude},${userLongitude}`, {
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
}

// renders an icon for each event and places it in there correct position on map
function convertToGeoJSON(event) {
  const eventLong = event.location[0];
  const eventLat = event.location[1];
  const icon = {
    "id": `marker`,
    "type": "Feature",
     "properties": {
       "id": `${event.id}`,
       "marker-color": "#2c607e",
       "marker-size": "medium",
       "marker-symbol": "",
       "title": `${event.title}`,
       "description": `${event.description}`
     },
     "geometry": {
       "type": "Point",
       "coordinates": [
         eventLong,
         eventLat
       ]
     }
  };
  state.geojsonIcons.features.push(icon);
  renderMarkers();
}

// render icons onto page
function renderMarkers() {
  state.geojsonIcons.features.forEach( marker => {
    const markerEl = document.createElement('div');
    markerEl.className = 'marker';
    markerEl.dataset.id = marker.properties.id;
    new mapboxgl.Marker(markerEl)
      .setLngLat(marker.geometry.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML(`
          <p>${marker.properties.title}<p>
        `))
      .addTo(map);
    // map.on('click', `marker`, function (marker) {
    //   map.flyTo({center: marker.geometry.coordinates});
    // });
  })
}

// add event listener's to markers to identify the event clicked
function addEventListenerToMarkers(){
  document.addEventListener('click', event => {
    if(event.target.className.includes('marker')) {
      const eventId = event.target.dataset.id;
      state.selectedEvent = state.events.filter( event => event.id === eventId )[0];
      map.flyTo({center: state.selectedEvent.location});
      document.querySelector('#map').style.width = '80%';
      sidebar.className = '';
      // addToNavBar();
    }
  })
}

// -------------------- populate the side navbar -------------------------
// function addToNavBar() {
//   usernameEl = do
// }

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  zoom: 14.5
});

const findLocation = map.addControl(geocoder);

// Here's the code for locating the user, need to have event listener for if either this or the findLocation is clicked. And then to find events based on that
const userLocation = map.addControl(new mapboxgl.GeolocateControl({
positionOptions: {
enableHighAccuracy: true
},
trackUserLocation: true
}));

// After the map style has loaded on the page, add a source layer and default
// styling for a single point.
  map.on('load', function() {
    map.addSource('single-point', {
      "type": "geojson",
      "data": {
      "type": "FeatureCollection",
      "features": []
    }
  });

  map.addLayer({
    "id": "point",
    "source": "single-point",
    "type": "circle",
    "paint": {
      "circle-radius": 10,
      "circle-color": "#007cbf"
    }
  });

// Center map on the coordinates of any clicked marker

// Listen for the `result` event from the MapboxGeocoder that is triggered when a user
// makes a selection and add a symbol that matches the result.
  geocoder.on('result', function(ev) {
    map.getSource('single-point').setData(ev.result.geometry);
    state.currentLocation  = geocoder._map._easeOptions.center;
    getEventsFromUserLocation(1);
    addEventListenerToMarkers();
  });
});
