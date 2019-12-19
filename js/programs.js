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
  // MainVue.GetMiTalentPrograms();
});


// Create event listener for menu element open and close
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
    filter_from: '',
    filter_distance: null,
    pending: false,
    results: [],
    results_filtered: [],
    result_selected: null,
    result_selected_facilities: [],
    facilities_pending: false
  },
  methods: {
    GetMiTalentProgramsUnique: function() {
      MainVue.search = MainVue.search.trim().replace(/\./g, '').replace(/\'/g, '');
      var search_value = MainVue.search;

      if (search_value === '') {
        search_value = 'all';
      }

      let request = new XMLHttpRequest();

      var url = app_environment.SAA_Program_Unique.replace('__SearchVariable__', encodeURI(search_value));

      request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          let response = JSON.parse(this.responseText);
          MainVue.results = [];
          if (response.length > 0) {
            response.forEach(function(item) {
              MainVue.results.push(item);
            });
          }

          MainVue.pending = false;
        }
      }

      request.open("GET", url, true);
      request.send();

      MainVue.pending = true;
    },
    GetMiTalentPrograms: function() {
      MainVue.search = MainVue.search.trim().replace(/\./g, '').replace(/\'/g, '');

      let request = new XMLHttpRequest();

      var url = app_environment.SAA_Program.replace('__SearchVariable__', encodeURI(MainVue.search));

      request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          let response = JSON.parse(this.responseText);
          MainVue.results = [];
          if (response.length > 0) {
            response.forEach(function(item) {
              MainVue.results.push(item);
            });
          }

          MainVue.pending = false;
        }
      }

      request.open("GET", url, true);
      request.send();

      MainVue.pending = true;
    },
    SelectResult: function(result) {
      MainVue.result_selected = result;
      MainVue.LoadFacilities(result.title);
    },
    LoadFacilities: function(course_name) {
      let request = new XMLHttpRequest();

        var url = app_environment.SAA_Program_Facilities.replace('__SearchVariable__', encodeURIComponent(course_name));

        request.onreadystatechange = function() {
          if (this.readyState === 4 && this.status === 200) {
            let response = JSON.parse(this.responseText);
            MainVue.result_selected_facilities = [];
            if (response.length > 0) {
              response.forEach(function(item) {
                MainVue.result_selected_facilities.push(item);
              });
            }

            MainVue.facilities_pending = false;
          }
        }

        request.open("GET", url, true);
        request.send();

        MainVue.facilities_pending = true;
    },
    ClearSelectedResult: function() {
      MainVue.result_selected = null;
      MainVue.result_selected_facilities = [];
    },
    FilterResults: function() {
      var build_results = [];

      if (MainVue.filter_type !== '' && MainVue.filter_distance !== null && MainVue.filter_distance_from !== null) {
        MainVue.results.forEach(function(result) {
          if (result.latitude) {
            if (parseFloat(MainVue.GetLatLongDistance([result.latitude, result.longitude])) <= parseFloat(MainVue.filter_distance)) {
              if (result.type === MainVue.filter_type) {
                build_results.push(result);
              }
            }
          }
        });
        MainVue.results_filtered = build_results;
      }
      else if (MainVue.filter_type !== '') {
        MainVue.results.forEach(function(result) {
          if (result.type === MainVue.filter_type) {
            build_results.push(result);
          }
        });
        MainVue.results_filtered = build_results;
      }
      else if (MainVue.filter_distance !== null && MainVue.filter_distance_from !== null) {
        MainVue.results.forEach(function(result) {
          if (result.latitude) {
            if (parseFloat(MainVue.GetLatLongDistance([result.latitude, result.longitude])) <= parseFloat(MainVue.filter_distance)) {
              build_results.push(result);
            }
          }
        });
        MainVue.results_filtered = build_results;
      }
      else {
        MainVue.results_filtered = MainVue.results;
      }
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