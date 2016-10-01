(function(){d3.layout = {};
	d3.layout.conflictmap = function(){

	var size = [1, 1] // width, height
	, conflicts = []
	, places = {}
	, mapwidth = 0
	, mapheight = 0;

	function init(x){
		console.log("init...");
		conflicts = parseConflicts(x);
	    places = parsePlaces(x);
	    for (var idx=0;idx<conflicts.length;idx++){
	    	var conflict = conflicts[idx];
	    	conflict.place = places[conflict.place] || conflict.place;
	    }
	}

	function conflictmap(){
		return this;
	};

	function parseConflicts(x){
		return x.conflicts;
	}
	function parsePlaces(x){
		// first is up-down, second is left-right
	    var minLon = 35.0766907;
	    var maxLon = 48.9177807;

	    var minLat = 29.9311616;
	    var maxLat = 37.5518742;

	    var lonLen = maxLon	- minLon;
	    var lonLat = maxLat - minLat;

	    for (var placeIdx in x.places){
	    	var place = x.places[placeIdx];
	    	var realLon = place.coordinates.lon;
	    	var realLat = place.coordinates.lat;
	    	place.coordinates.x = Math.floor(((realLon - minLon)/lonLen)*mapwidth);
	    	place.coordinates.y = Math.floor(((maxLat - realLat)/lonLat)*mapheight);

	    }
		return x.places;
	}

	conflictmap.nodes = function(x, mapw, maph) {
	    if (!arguments.length) return conflicts;

	    mapwidth = mapw || mapwidth
	    mapheight = maph || mapheight
	    init(x);
	    return conflictmap;
  	};

	conflictmap.size = function(x) {
	    if (!arguments.length) return size;
	    size = x;
	    return conflictmap;
	};

	conflictmap.value = function(x) {
	    if (!arguments.length) return value;
	    value = x;
	    return conflictmap;
	};

	return conflictmap;
  }
})();