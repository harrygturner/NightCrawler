// things we will need to select/append element to
const sidebar = document.querySelector('#side-nav');
const btn = document.querySelector('#geocoder');

// state

const state = {
  date: todayDate(),
  clientToken: 'hS6UafQpEo2tCAKxSUcFP04hy48V02',
  tracker: false,
  search: false,
  currentLocation: null, // [long, lat]
  events: [],
  selectedEvent: null,
  geojsonIcons: {},
  markers: [],
  selectedMarker: null,
  unselectedMarkers: [],
  restaurants: [],
  bars: []
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
    let d = new Date(date),
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

// ---------------------- Truncate word limit --------------------------

function truncate(str, no_words) {
    return str.split(" ").splice(0,no_words).join(" ");
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
  return fetch(`https://api.predicthq.com/v1/events/?within=${range}km@${userLatitude},${userLongitude}`, {
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
  renderMarkers();
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
       "category": `${event.category}`,
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
}

// render icons onto page
function renderMarkers() {
  state.geojsonIcons.features.forEach( marker => {
    const markerEl = document.createElement('div');
    switch(marker.properties.category){
      case 'community':
        markerEl.className = 'marker community';
        break;
      case 'concerts':
        markerEl.className = 'marker concert';
        break;
      case 'performing-arts':
        markerEl.className = 'marker theatre';
        break;
      case 'conferences':
        markerEl.className = 'marker conference';
        break;
      case 'sports':
        markerEl.className = 'marker sport';
        break;
      default:
        markerEl.className = 'marker';
    }
    markerEl.dataset.id = marker.properties.id;
    const mapMarker = new mapboxgl.Marker(markerEl)
      .setLngLat(marker.geometry.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML(`
          <h6>${marker.properties.title}</h6>
          <button type='button' class='rest-btn hide'>Find Restaurants Nearby</button>
        `))
      .addTo(map);
    state.markers.push(mapMarker);
  })
}

// add event listener's to markers to identify the event clicked
function addEventListenerToMarkers(){
  document.addEventListener('click', event => {
    if(event.target.className.includes('marker')) {
      const eventId = event.target.dataset.id;
      state.selectedEvent = state.events.filter(event => event.id === eventId )[0];
      state.selectedMarker = state.markers.filter(marker => eventId === marker._element.dataset.id)[0];
      map.flyTo({center: state.selectedEvent.location});
      document.querySelector('#map').style.width = '80%';
      document.querySelector('#map').style.float = 'right';
      sidebar.className = '';
      sidebar.innerHTML = '';
      addAllToSideBar();
    }
  })
}

// remove unselected markers
function removeUnselectedMarkers() {
  const unselectedMarkers = [];
  state.markers.forEach( marker => {
    if(marker !== state.selectedMarker){
      unselectedMarkers.push(marker)
    }
  })
  removeMarkers(unselectedMarkers);
}

// remove all markers
function removeMarkers(array) {
  array.forEach(marker => marker.remove())
}


// -------------------- populate the side navbar -------------------------
// add user to nav bar
function addUserToSideBar() {
  usernameEl = document.createElement('div');
  usernameEl.className = 'user-info';
  usernameEl.innerHTML = `
    <h5>Harry Turner</h5>
  `
  sidebar.append(usernameEl);
}

// add event info to side bar
function addEventToSideBar() {
  eventEl = document.createElement('div');
  eventEl.className = 'event-info';
  eventEl.innerHTML = `
    <h6 style='margin: 0px 0px 20px 10px;'>${state.selectedEvent.title}</h6>
    <div id="accordion">
      <div class="card">
        <div class="card-header" id="headingOne">
          <h5 class="mb-0">
            <button class="btn collapsed" data-toggle="collapse" data-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
              Event Details
            </button>
          </h5>
        </div>
        <div id="collapseOne" class="collapse" aria-labelledby="headingOne" data-parent="#accordion">
          <div class="card-body">
          <p style='font-size: 14px;'>Category: ${state.selectedEvent.category}<br>
          Local Ranking: ${state.selectedEvent.rank ? `${state.selectedEvent.rank}` : '1'}<br>
          Start Time: ${state.selectedEvent.start.split(/T|:00Z/)[1]}<br>
          ${ state.selectedEvent.duration ? `End Time: ${state.selectedEvent.end.split(/T|:00Z/)[1]}` : '' }
          </p>
        </div>
      </div>
      <div class="card">
        <div class="card-header" id="headingTwo">
          <h5 class="mb-0">
            <button class="btn collapsed" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
              About the Event
            </button>
          </h5>
        </div>
        <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordion">
          <div class="card-body">
            <p style='font-size: 14px;'>${state.selectedEvent.description !== '' ? `${truncate(state.selectedEvent.description, 80)}...` : 'No information has been provided about this event please visit there website for further details.'}</p>
          </div>
        </div>
      </div>
    </div>
  `
  sidebar.append(eventEl)
}

// add add button to the side bar
function addAddBtn() {
  const addBtn = document.createElement('button')
  addBtn.className = 'btn btn-light add-btn'
  addBtn.innerText = 'Add to Night'
  addBtn.addEventListener('click', () => {
    document.querySelector('.rest-btn').classList.remove('hide');
  })
  sidebar.append(addBtn)
}

// populate entire side bar
function addAllToSideBar() {
  addUserToSideBar()
  addEventToSideBar()
  addAddBtn()
}

// ---------------------- map stuff -------------------------------

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  zoom: 14.5
});

const findLocation = map.addControl(geocoder);

// Here's the code for locating the user, need to have event listener for if either this or the findLocation is clicked. And then to find events based on that
const tracker = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
});

const userLocation = map.addControl(tracker);


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


// Listen for the `result` event from the MapboxGeocoder that is triggered when a user
// makes a selection and add a symbol that matches the result.
  geocoder.on('result', function(ev) {
    if(!state.search){
      state.search = true;
    } else {
      removeMarkers(state.markers)
    }
    map.getSource('single-point').setData(ev.result.geometry);
    state.currentLocation  = geocoder._map._easeOptions.center;
    getEventsFromUserLocation(2);
    addEventListenerToMarkers();
  });

  tracker.on('geolocate', ev => {
    if(!state.tracker) {
      state.search = true;
      state.tracker = true;
      const userLoc = [ ev.coords.longitude, ev.coords.latitude ]
      state.currentLocation = userLoc;
      getEventsFromUserLocation(2);
      addEventListenerToMarkers();
      restaurantBtnListener();
    }
  })
});

// ---------------------------- restaurants -----------------------------------
// add event listener to find restaurant button
function restaurantBtnListener() {
  document.addEventListener('click', event => {
    if(event.target.className.includes('rest-btn')) {
      removeUnselectedMarkers();
      getNearbyRestaurants();
    }
  })
}

const getNearbyRestaurants = () => {
  const service = new google.maps.places.PlacesService(document.createElement('div'))
  const markerLatLng = new google.maps.LatLng({lat: state.selectedEvent.location[1], lng: state.selectedEvent.location[0]})
  const request = {
    location: markerLatLng,
    radius: '500',
    type: ['restaurant']
  };
  state.restaurants = [];
  let i = 0;
  service.nearbySearch(request, (places) => {
    places.forEach((place, i) => renderPlace(place, i))
    renderRestaurantMarkers();
  })
};

const renderPlace = (place, i) => {
  const placeName = place.name
  const placeCoordinates = [place.geometry.location.lng(), place.geometry.location.lat()]
  const placeTotalReviews = place.user_ratings_total
  const placeRating = place.rating
  const placePriceLevel = place.price_level
  const newRestaurant = {
    id: i,
    name: placeName,
    coordinates: placeCoordinates,
    totalReviews: placeTotalReviews,
    rating: placeRating,
    priveLevel: placePriceLevel
  }
  state.restaurants.push(newRestaurant);
  ++i;
}

// render restaurant markers
function renderRestaurantMarkers() {
  debugger
  state.restaurants.forEach( marker => {
    const markerEl = document.createElement('div');
    markerEl.dataset.id = marker.id;
    markerEl.className = 'rest-marker';
    const mapMarker = new mapboxgl.Marker(markerEl)
      .setLngLat(marker.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML(`
          <h6>${marker.name}</h6>
        `))
      .addTo(map);
  })
}

// ---------------------------------- bars ----------------------------------------

const getNearbyBars = () => {
  const service = new google.maps.places.PlacesService(document.createElement('div'))
  const markerLatLng = new google.maps.LatLng({lat: state.selectedEvent.location[1], lng: state.selectedEvent.location[0]})
  const request = {
    location: markerLatLng,
    radius: '500',
    type: ['bar']
  }
  service.nearbySearch(request, (bars) => bars.forEach(renderBar));
}

const renderBar = bar => {
  const barName = bar.name
  const barCoordinates = [bar.geometry.location.lat(), bar.geometry.location.lng()]
  const barRating = bar.rating
  const barPriceLevel = bar.price_level
  const newBar = {
    name: barName,
    coordinates: barCoordinates,
    rating: barRating,
    priveLevel: restaurantPriceLevel
  }
  state.bars.push(newBar)
}
