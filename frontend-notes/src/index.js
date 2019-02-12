// Quick change

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
