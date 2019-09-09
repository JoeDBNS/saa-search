// IE11 / Polyfill Array.from fix - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
// Production steps of ECMA-262, Edition 6, 22.1.2.1
if(!Array.from){Array.from=function(){var toStr=Object.prototype.toString;var isCallable=function(fn){return typeof fn==="function"||toStr.call(fn)==="[object Function]"};var toInteger=function(value){var number=Number(value);if(isNaN(number)){return 0}if(number===0||!isFinite(number)){return number}return(number>0?1:-1)*Math.floor(Math.abs(number))};var maxSafeInteger=Math.pow(2,53)-1;var toLength=function(value){var len=toInteger(value);return Math.min(Math.max(len,0),maxSafeInteger)};
// The length property of the from method is 1.
return function from(arrayLike/*, mapFn, thisArg */){
// 1. Let C be the this value.
var C=this;
// 2. Let items be ToObject(arrayLike).
var items=Object(arrayLike);
// 3. ReturnIfAbrupt(items).
if(arrayLike==null){throw new TypeError("Array.from requires an array-like object - not null or undefined")}
// 4. If mapfn is undefined, then let mapping be false.
var mapFn=arguments.length>1?arguments[1]:void undefined;var T;if(typeof mapFn!=="undefined"){
// 5. else
// 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
if(!isCallable(mapFn)){throw new TypeError("Array.from: when provided, the second argument must be a function")}
// 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
if(arguments.length>2){T=arguments[2]}}
// 10. Let lenValue be Get(items, "length").
// 11. Let len be ToLength(lenValue).
var len=toLength(items.length);
// 13. If IsConstructor(C) is true, then
// 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
// 14. a. Else, Let A be ArrayCreate(len).
var A=isCallable(C)?Object(new C(len)):new Array(len);
// 16. Let k be 0.
var k=0;
// 17. Repeat, while k < len… (also steps a - h)
var kValue;while(k<len){kValue=items[k];if(mapFn){A[k]=typeof T==="undefined"?mapFn(kValue,k):mapFn.call(T,kValue,k)}else{A[k]=kValue}k+=1}
// 18. Let putStatus be Put(A, "length", len, true).
A.length=len;
// 20. Return A.
return A}}()}


window.addEventListener('load', function() {
  SetMenuListener();
	MainVue.LoadMapboxMap();
});


// Create event listener for menu element open
// and close
function SetMenuListener() {
  document.querySelector('[class="nav-button"]').addEventListener('click', function() {
    if (document.body.classList.value.indexOf('nav-open') !== -1) {
      document.body.classList.remove('nav-open');
      document.body.classList.add('nav-closed');
    }
    else {
      document.body.classList.add('nav-open');
      document.body.classList.remove('nav-closed');
    }
  });
}




// Vue
var MainVue = new Vue({
  el: '#app-container',
  data: {
    search: '',
    show_filter: false,
    filter_type: '',
    filter_distance: null,
    filter_distance_from: null,
    set_filter_distance_from: false,
    pending: false,
    results: [],
    results_filtered: [],
    result_selected: null,
    map: null,
    mapMarkers: [],
    mapDistanceMarker: null
  },
  methods: {
    CallMiTalentAPI: function() {
      MainVue.search = MainVue.search.trim().replace(/\./g, '').replace(/\'/g, '');

      if (MainVue.search.length > 0) {
        let request = new XMLHttpRequest();

        // var url = app_environment.MiTalentTestApi.replace('__SearchVariable__', MainVue.search);
        var url = app_environment.MiTalentTestApi.replace('__SearchVariable__', MainVue.search);

        request.onreadystatechange = function() {
          if (this.readyState === 4 && this.status === 200) {
            let response = JSON.parse(this.responseText);
            MainVue.results = [];
            if (response.value.length > 0) {
              response.value.forEach(function(item) {
                MainVue.results.push(item);
              });
            }

            MainVue.pending = false;
            MainVue.LoadMapboxMapMarkers(MainVue.results_filtered);
          }
        }

        request.open("GET", url, true);
        request.send();

        MainVue.pending = true;
      }
      else {
        MainVue.pending = false;
        MainVue.results = [];
        MainVue.LoadMapboxMapMarkers();
      }
    },
    LoadMapboxMap: function() {
      mapboxgl.accessToken = 'pk.eyJ1Ijoiam9lZGJucyIsImEiOiJjangzZjhhb2UwdXd2M3pvNHlnY2RueTk3In0.XtTyt6DTMRb4hXfJdbbzyg';

      MainVue.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-86.025094, 43.4], // starting position
        zoom: 5 // starting zoom
      });

      MainVue.map.on('click', function(e) {
        if (MainVue.set_filter_distance_from) {
          MainVue.filter_distance_from = [e.lngLat.lat, e.lngLat.lng];
          MainVue.SetDistanceCenterMarker(e.lngLat.lat, e.lngLat.lng);
          MainVue.set_filter_distance_from = false;
          MainVue.FilterResults();
        }
      });

      // Add zoom and rotation controls to the map.
      MainVue.map.addControl(new mapboxgl.NavigationControl());
    },
    LoadMapboxMapMarkers: function(markers = []) {
      MainVue.ClearSelectedResult();
      MainVue.ClearMapboxMapMarkers();

      markers.forEach(function(marker) {
        var el = document.createElement('div');
        el.id = 'marker_' + marker.SchoolID;
        el.className = 'marker';
        el.style.backgroundImage = 'url(\'./assets/images/map-marker-icon-sml.png\')';
        el.style.width = '20px';
        el.style.height = '20px';
        el.addEventListener('click', function() {
          if (!MainVue.set_filter_distance_from) {
            MainVue.SelectResult(marker);
          }
        });

        var newMarker = new mapboxgl.Marker(el)
          .setLngLat([marker.Longitude, marker.Latitude])
          .addTo(MainVue.map);

          MainVue.mapMarkers.push(newMarker);
      });
    },
    FlyToLocation: function(latlong = [-86.025094, 43.4], zoom = 5) {
      MainVue.map.flyTo({
        center: latlong,
        zoom: zoom
      });
    },
    SelectResult: function(result) {
      MainVue.HighlightMapboxMapMarker('marker_' + result.SchoolID);
      MainVue.SetSelectedResultById(result.SchoolID);
    },
    HighlightMapboxMapMarker: function(marker_id) {
      MainVue.ClearSelectedMapboxMarker();

      var newSelectedResult = document.querySelector('[data-result-id="' + marker_id + '"]');
      if (newSelectedResult !== null) {
        newSelectedResult.setAttribute('data-result-selected', 'true');
      }

      var newSelectedMarker = document.getElementById(marker_id);
      if (newSelectedMarker !== null) {
        newSelectedMarker.style.backgroundImage = 'url(\'./assets/images/map-marker-icon-sml-orange.png\')';
        newSelectedMarker.setAttribute('data-marker-selected', 'true');
      }
    },
    ClearSelectedMapboxMarker: function() {
      var currentSelectedResult = document.querySelector('[data-result-selected="true"]');
      if (currentSelectedResult !== null) {
        currentSelectedResult.setAttribute('data-result-selected', 'false');
      }

      var currentSelectedMarker = document.querySelector('[data-marker-selected="true"]');
      if (currentSelectedMarker !== null) {
        currentSelectedMarker.style.backgroundImage = 'url(\'./assets/images/map-marker-icon-sml.png\')';
        currentSelectedMarker.setAttribute('data-marker-selected', 'false');
      }
    },
    SetDistanceCenterMarker: function(setLat, setLong) {
      MainVue.ClearDistanceCenterMarker();

      MainVue.filter_distance_from = [setLat, setLong];

      var el = document.createElement('div');
      el.id = 'marker_DistanceFromCenter';
      el.className = 'marker-distance-pin';
      el.style.backgroundImage = 'url(\'./assets/images/map-marker-icon-sml-pin.png\')';
      el.style.width = '20px';
      el.style.height = '20px';

      MainVue.mapDistanceMarker = new mapboxgl.Marker(el, { draggable: true }).setLngLat([setLong, setLat]).addTo(MainVue.map);

      function onDragEnd() {
        var lngLat = MainVue.mapDistanceMarker.getLngLat();
        MainVue.SetDistanceCenterMarker(lngLat.lat, lngLat.lng);
      }

      MainVue.mapDistanceMarker.on('dragend', onDragEnd);
    },
    ClearDistanceCenterMarker: function(marker_id) {
      if (MainVue.mapDistanceMarker) {
        MainVue.mapDistanceMarker.remove();
        MainVue.mapDistanceMarker = null;
      }
    },
    SetSelectedResultById: function(result_id) {
      MainVue.ClearSelectedResult();

      MainVue.results_filtered.forEach(result => {
        if (result.SchoolID == result_id) {
          MainVue.result_selected = result;
        }
      });
    },
    ClearSelectedResult: function() {
      MainVue.result_selected = null;
    },
    ClearMapboxMapMarkers: function() {
      MainVue.HighlightMapboxMapMarker();

      while (MainVue.mapMarkers.length > 0) {
        Array.from(MainVue.mapMarkers).forEach(function(marker) {
          marker.remove();
          MainVue.mapMarkers.shift();
        });
      }
    },
    FilterResults: function() {
      var build_results = [];

      if (MainVue.filter_type !== '' && MainVue.filter_distance !== null && MainVue.filter_distance_from !== null) {
        MainVue.results.forEach(function(result) {
          if (result.Latitude) {
            if (parseFloat(MainVue.GetLatLongDistance([result.Latitude, result.Longitude])) <= parseFloat(MainVue.filter_distance)) {
              if (result.InstType === MainVue.filter_type) {
                build_results.push(result);
              }
            }
          }
        });
        MainVue.results_filtered = build_results;
      }
      else if (MainVue.filter_type !== '') {
        MainVue.results.forEach(function(result) {
          if (result.InstType === MainVue.filter_type) {
            build_results.push(result);
          }
        });
        MainVue.results_filtered = build_results;
      }
      else if (MainVue.filter_distance !== null && MainVue.filter_distance_from !== null) {
        MainVue.results.forEach(function(result) {
          if (result.Latitude) {
            if (parseFloat(MainVue.GetLatLongDistance([result.Latitude, result.Longitude])) <= parseFloat(MainVue.filter_distance)) {
              build_results.push(result);
            }
          }
        });
        MainVue.results_filtered = build_results;
      }
      else {
        MainVue.results_filtered = MainVue.results;
      }

      MainVue.LoadMapboxMapMarkers(MainVue.results_filtered);
    },
    GetLatLongDistance: function(latLongSet1) {
      var R = 6371e3; // metres
      var φ1 = MainVue.DegreesToRadians(latLongSet1[0]);
      var φ2 = MainVue.DegreesToRadians(MainVue.filter_distance_from[0]);
      var Δφ = MainVue.DegreesToRadians((MainVue.filter_distance_from[0] - latLongSet1[0]));
      var Δλ = MainVue.DegreesToRadians((MainVue.filter_distance_from[1] - latLongSet1[1]));

      var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      var d = R * c;

      return (d/1609.344).toFixed(2);
    },
    DegreesToRadians: function(degrees)
    {
      var pi = Math.PI;
      return degrees * (pi/180);
    },
    ToggleFilter: function() {
      MainVue.show_filter = !MainVue.show_filter;
      MainVue.filter_type = '';
      MainVue.filter_distance = null;
      MainVue.filter_distance_from = null;
      MainVue.ClearDistanceCenterMarker();
    }
  },
  watch: {
    results: function() {
      MainVue.FilterResults();
    },
    filter_type: function() {
      MainVue.FilterResults();
    },
    filter_distance: function() {
      MainVue.FilterResults();
    },
    filter_distance_from: function() {
      MainVue.FilterResults();
    }
  }
});