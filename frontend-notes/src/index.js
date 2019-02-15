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
  restaurants: [],
  restaurantMarkers: [],
  restaurantSelected: null,
  selectedRestaurantMarker: null,
  restaurantAdded: false,
  bars: [],
  barMarkers: [],
  barSelected: null,
  selectedBarMarker: null,
  barAdded: false,
  restSearchedFor: false,
  barSearchedFor: false
}

// ---------------------- login & sign up ---------------------------
// event listeners for signing up and logging into the app
function signingInEventListener() {
  document.addEventListener('click', event => {
    if(event.target.className === 'btn btn-info signup-btn'){
      renderSignUpForm();
    } else if(event.target.className === 'btn btn-info login-btn') {
      renderLogInForm();
    }
  })
}

const rearrangeTitleBox = () => {
  signInEl.style.width = '300px'
  signInEl.style.marginLeft = '-150px'
}

const signInEl = document.querySelector('#title-box')
// render sign up form
function renderSignUpForm() {
  rearrangeTitleBox()
  signInEl.style.height = '450px'
  signInEl.style.marginBottom = '-225px'
  signInEl.innerHTML = `
    <h2 style='margin: 20px;'>NightCrawler</h2>
    <form>
      First name:<br>
      <input type="text" name="firstname" style="margin-bottom: 20px;"><br>
      Last name:<br>
      <input type="text" name="lastname" style="margin-bottom: 20px;"><br>
      Username:<br>
      <input type="text" name="username" style="margin-bottom: 20px;"><br>
      Password:<br>
      <input type="password" name="username" style="margin-bottom: 20px;"><br>
      <input type="submit" value="Sign Up" class='btn btn-info'>
    </form>
  `
  const subBtn = signInEl.querySelector('input[type=submit]');
  subBtn.addEventListener('click', registersAndWelcomeUser);
}

// registers and welcomes the user to the app
function registersAndWelcomeUser() {
  const form = signInEl.querySelector('form');
  const fullname = form.firstname.value + ' ' + form.lastname.value;
  signInEl.style.width = '550px'
  signInEl.style.marginLeft = '-275px'
  signInEl.style.height = '240px'
  signInEl.style.marginBottom = '-120px'
  signInEl.innerHTML = `
      <h2 style='margin: 20px;'>NightCrawler</h2>
      <p>Hello ${fullname}, let's start planning your night. If you'd like to search for events around your current location please click on the target icon, or if you want to search a location of your choice just type it in the search bar.</p>
  `
  renderGeolocaterAndSearchBarOnMap();
}

// render log in form
function renderLogInForm() {
  rearrangeTitleBox();
  signInEl.style.height = '300px'
  signInEl.style.marginBottom = '-150px'
  signInEl.innerHTML = `
    <h2 style='margin: 20px;'>NightCrawler</h2>
    <form>
      Username:<br>
      <input type="text" name="lastname" style="margin-bottom: 20px;"><br>
      Password:<br>
      <input type="password" name="username" style="margin-bottom: 20px;"><br>
      <input type="submit" value="Log In" class='btn btn-info'>
    </form>
  `
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

function timeNow() {
  const today = new Date();
  return now = today.getHours() + ":" + today.getMinutes();
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
        markerEl.className = 'community icon';
        break;
      case 'concerts':
        markerEl.className = 'concert icon';
        break;
      case 'performing-arts':
        markerEl.className = 'theatre icon';
        break;
      case 'conferences':
        markerEl.className = 'conference icon';
        break;
      case 'sports':
        markerEl.className = 'sport icon';
        break;
      default:
        markerEl.className = 'icon';
    }
    markerEl.dataset.id = marker.properties.id;
    const mapMarker = new mapboxgl.Marker(markerEl)
      .setLngLat(marker.geometry.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML(`
          <h6>${marker.properties.title}</h6>
        `))
      .addTo(map);
    state.markers.push(mapMarker);
  })
}

// add event listener's to markers to identify the event clicked
function addEventListenerToMarkers(){
  document.addEventListener('click', event => {
    if(event.target.className.includes('icon')) {
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
    <h5 style='margin-top: 20px;'>Harry Turner</h5>
    <button class='btn btn-light save-btn hide' style='margin-top: 10px;'>Save My Night</button>
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
    addEventToSchedule();
  })
  sidebar.append(addBtn)
}

// populate entire side bar
function addAllToSideBar() {
  addUserToSideBar()
  addEventToSideBar()
  addAddBtn()
}

// when add event button is clicked will add the event to users schedule
function addEventToSchedule() {
  const eventInfo = document.querySelector('.event-info');
  document.querySelector('.save-btn').classList.remove('hide');
  document.querySelector('.add-btn').remove();
  const ev = state.selectedEvent;
  eventInfo.innerHTML = ''
  eventInfo.className = 'side-schedule'
  eventInfo.innerHTML = `
  	<h6 style='margin-left: 8px; padding-top: 20px;'>Schedule</h6>
    <p style='margin-left: 8px; font-size: 13px'>Current Time: ${timeNow()}</p>
  	<hr style='width: 90%;'>
  	<div class='today-events'>
  		<h6>${ev.title}</h6>
  		<p>${ev.start.split(/T|:00Z/)[1]}</p>
  	</div>
    <hr style='width: 90%;'>
  `
  const btns = document.createElement('div');
  btns.className = 'rest-bar-btns'
  btns.innerHTML = `
    <button class='btn btn-light rest-btn'>Find a Restaurant</button><br>
    <button class='btn btn-light bar-btn'>Find a Bar</button>
  `
  sidebar.append(btns);
}

// -------------------------- map stuff -------------------------------
// function renderGeolocaterAndSearchBarOnMap() {
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
      signInEl.remove();
      map.getSource('single-point').setData(ev.result.geometry);
      state.currentLocation  = geocoder._map._easeOptions.center;
      getEventsFromUserLocation(2);
      addEventListenerToMarkers();
    });

    tracker.on('geolocate', ev => {
      if(!state.tracker) {
        signInEl.remove();
        state.search = true;
        state.tracker = true;
        const userLoc = [ ev.coords.longitude, ev.coords.latitude ]
        state.currentLocation = userLoc;
        getEventsFromUserLocation(2);
        addEventListenerToMarkers();
        restaurantBtnListener();
      }
    })
    eventListenerForAddRestToSchedule();
  });
// }

// ---------------------------- restaurants -----------------------------------
// add event listener to find restaurant and bar button
function restaurantBtnListener() {
  document.addEventListener('click', event => {
    if(event.target.className.includes('rest-btn')) {
      state.restSearchedFor = true;
      removeUnselectedMarkers();
      getNearbyRestaurants();
      if(state.barSearchedFor){
        removeUnselectedBarMarkers();
        state.bars = [];
        state.barMarkers = [];
        state.barSearchedFor = false
      }
    } else if (event.target.className.includes('bar-btn')) {
      state.barSearchedFor = true;
      removeUnselectedMarkers();
      getNearbyBars();
      if(state.restSearchedFor){
        removeUnselectedRestaurantMarkers();
        state.restaurantMarkers = [];
        state.restSearchedFor = false
      }
    }
  })
}

const getNearbyRestaurants = () => {
  if(!state.restaurantAdded){
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
  }
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
    priceLevel: placePriceLevel
  }
  state.restaurants.push(newRestaurant);
  ++i;
}

// render restaurant markers
function renderRestaurantMarkers() {
  state.restaurants.forEach( marker => {
    const markerEl = document.createElement('div');
    markerEl.dataset.id = marker.id;
    markerEl.className = 'rest-marker';
    const mapMarker = new mapboxgl.Marker(markerEl)
      .setLngLat(marker.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML(`
          <h6>${marker.name}</h6>
          <p>${marker.priceLevel ? `Price Level: ${marker.priceLevel}<br>` : ''}
          Rating: ${marker.rating}<br>
          Total Reviews: ${marker.totalReviews}
          </p>
          <button class='btn btn-light add-rest-btn'>Add to Night</button>
        `))
      .addTo(map);
    state.restaurantMarkers.push(mapMarker);
    markerEl.addEventListener('click', event => {
      restId = parseInt(event.target.dataset.id)
      state.restaurantSelected = state.restaurants.filter(r => r.id === restId)[0];
      state.selectedRestaurantMarker = state.restaurantMarkers.filter(marker => restId == marker._element.dataset.id)[0];
    })
  })
}

// add event listener to document for when bars and restaurants are added to sidebar schedule
function eventListenerForAddRestToSchedule() {
  document.addEventListener('click', event => {
    if(event.target.className.includes('add-rest-btn')) {
      state.restaurantAdded = true;
      addRestToSchedule();
      removeUnselectedRestaurantMarkers();
    } else if(event.target.className.includes('add-bar-btn')) {
      state.barAdded = true;
      addBarToSchedule();
      removeUnselectedBarMarkers();
    }
  })
}

// remove unselected restaurant markers
function removeUnselectedRestaurantMarkers() {
  const unselectedMarkers = [];
  state.restaurantMarkers.forEach( marker => {
    if(marker !== state.selectedRestaurantMarker){
      unselectedMarkers.push(marker)
    }
  })
  unselectedMarkers.forEach(marker => {
    marker.remove();
  })
}

// add restaurant to sidebar Schedule
function addRestToSchedule() {
  const schedule = sidebar.querySelector('.side-schedule');
  const r = state.restaurantSelected;
  const rInfo = document.createElement('div');
  rInfo.innerHTML = ''
  rInfo.className = 'today-events';
  rInfo.innerHTML = `
  	<h6>${r.name}</h6>
    <hr style='width: 90%;'>
  `
  schedule.append(rInfo);
  document.querySelector('.rest-btn').remove();
}

// ---------------------------------- bars ----------------------------------------

const getNearbyBars = () => {
  if(!state.barAdded) {
    const service = new google.maps.places.PlacesService(document.createElement('div'))
    const markerLatLng = new google.maps.LatLng({lat: state.selectedEvent.location[1], lng: state.selectedEvent.location[0]})
    const request = {
      location: markerLatLng,
      radius: '500',
      type: ['bar']
    }
    service.nearbySearch(request, (bars) => {
      bars.forEach((bar, i) => renderBar(bar, i));
      renderBarMarkers();
    });
  }
}

const renderBar = (bar, i) => {
  const barName = bar.name;
  const barCoordinates = [bar.geometry.location.lng(), bar.geometry.location.lat()];
  const barRating = bar.rating;
  const barPriceLevel = bar.price_level;
  const newBar = {
    id: i,
    name: barName,
    coordinates: barCoordinates,
    rating: barRating,
    priveLevel: barPriceLevel
  };
  state.bars.push(newBar);
  ++i;
}

// render restaurant markers
function renderBarMarkers() {
  state.bars.forEach( marker => {
    const markerEl = document.createElement('div');
    markerEl.dataset.id = marker.id;
    markerEl.className = 'bar-marker';
    const mapMarker = new mapboxgl.Marker(markerEl)
      .setLngLat(marker.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML(`
          <h6>${marker.name}</h6>
          <p>${marker.priceLevel ? `Price Level: ${marker.priceLevel}<br>` : ''}
          Rating: ${marker.rating}<br>
          </p>
          <button class='btn btn-light add-bar-btn'>Add to Night</button>
        `))
      .addTo(map);
    state.barMarkers.push(mapMarker);
    markerEl.addEventListener('click', event => {
      barId = parseInt(event.target.dataset.id)
      state.barSelected = state.bars.filter(bar => bar.id === barId)[0];
      state.selectedBarMarker = state.barMarkers.filter(marker => barId == marker._element.dataset.id)[0];
    })
  })
}

// add bar to side bar schedule
function addBarToSchedule() {
  const schedule = sidebar.querySelector('.side-schedule');
  const bar = state.barSelected;
  const barInfo = document.createElement('div');
  barInfo.innerHTML = ''
  barInfo.className = 'today-events';
  barInfo.innerHTML = `
  	<h6>${bar.name}</h6>

    <hr style='width: 90%;'>
  `
  schedule.append(barInfo);
  document.querySelector('.bar-btn').remove();
}

// remove unselected bar markers
function removeUnselectedBarMarkers() {
  const unselectedMarkers = [];
  state.barMarkers.forEach( marker => {
    if(marker !== state.selectedBarMarker){
      unselectedMarkers.push(marker)
    }
  })
  unselectedMarkers.forEach(marker => {
    marker.remove();
  })
}

// -------------------- on page load -----------------------

signingInEventListener();
