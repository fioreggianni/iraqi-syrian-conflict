/*
 * state.js
 * A module to save current state of the interactive map
 */

d3.state = function module(config) {
	var _cfg = config;
	var _fromDate, _toDate, _minDate, _maxDate, _data, 
	_monthsData, _placeConflicts, _maxStrikes, _absMaxStrikes, _filtered, 
	_allconflicts, _placeSelected, _conflictsByPlace;

	state.monthsData = function(md){
		if (!arguments.length) return _monthsData;
		_monthsData = md;
		return this;
	}

	state.allconflicts = function(){
		return _allconflicts || [];
	}

	state.maxStrikes = function(ms){
		if (!arguments.length) return _maxStrikes;
		_maxStrikes = ms;
		return this;
	}

	state.absMaxStrikes = function(ms){
		if (!arguments.length) return _absMaxStrikes;
		_absMaxStrikes = ms;
		return this;
	}


	state.init = function(){
		_fromDate = _minDate = reverseDate(d3.min(_data.conflicts,function(conflict){
			return conflict.date.year * 10000 + conflict.date.month * 100 + 1
		}))
		_toDate = _maxDate = reverseDate(d3.max(_data.conflicts,function(conflict){
			return conflict.date.year * 10000 + conflict.date.month * 100 + 31
		}))
		_monthsData = d3.nest()
		.key(function(conflict){
	    	return [conflict.date.year, conflict.date.month];
	    })
	    .rollup(function(conflictsGroup){
		      return {
		        totalAttacks: conflictsGroup.length,
		        totalStrikes: d3.sum(conflictsGroup, function(c){
		        	return c.strikes;
		        }),
		        month: conflictsGroup[0].date.month,
		        year: conflictsGroup[0].date.year
		      }
	    })
	    .entries(_data.conflicts);
		_absMaxStrikes = d3.max(_monthsData, function(monthData){
	    	return monthData.values.totalStrikes;
	    });
	}
	state.data = function(ldata){
		if (!arguments.length) return _data;
		ldata.conflicts = ldata.conflicts.filter(function(conflict){
			return conflict.date.year < 2016 
				|| (conflict.date.year == 2016 && conflict.date.month <= 8);
		})
		_data = ldata;
		_data.places = setPlacesCoordinates(_data.places);
	    for (var idx=0;idx<_data.conflicts.length;idx++){
	    	var conflict = _data.conflicts[idx];
	    	conflict.place = _data.places[conflict.place] || conflict.place;
	    }
		this.init();
		this.updateStats();
		return this;
	}

	state.updateStats = function(){
		_filtered = _data.conflicts.filter(function(conflict){
			return filterByMonth(conflict, state);
		});

	    _conflictsByPlace = d3.nest()
		.key(function(conflict){
			return conflict.place.name;
		})
		.rollup(function(conflictsGroup){
	      return {
	        totalAttacks: conflictsGroup.length,
	        totalStrikes: d3.sum(conflictsGroup, function(c){
	        	return c.strikes;
	        }),
	        place: conflictsGroup[0].place,
	        enumeration: conflictsGroup
	      }
		})
		.entries(_filtered);
		
		_maxStrikes = d3.max(_conflictsByPlace, function(monthData){
	    	return monthData.values.totalStrikes;
	    });

		if (_placeConflicts && _placeConflicts.values) {
			var filterResult = _conflictsByPlace.filter(function(pc){
				return pc.key == _placeConflicts.key;
			})
			if (filterResult.length > 0) _placeConflicts = filterResult[0]
			else _placeConflicts = null;

			if (_placeConflicts && _placeConflicts.values){
				var ac = _placeConflicts.values.enumeration.sort(function(a,b){
					return d3.ascending(getSortableDate(a), getSortableDate(b));
				})
				_allconflicts = ac;
			} else _allconflicts = [];
		} else _allconflicts = [];
	}

	state.filtered = function(){
		return _filtered;
	}
	state.conflicts = function(){
		return _data.conflicts;
	}
	state.conflictsByPlace = function(){
		return _conflictsByPlace;
	}

	state.placeSelected = function(selected){
		if (!arguments.length) return _placeSelected;
		_placeSelected = selected;
		return this;
	}

	state.placeConflicts = function(pc){
		if (!arguments.length) return _placeConflicts;
		_placeConflicts = pc;
		if (_placeConflicts) {	
			var ac = _placeConflicts.values.enumeration.sort(function(a,b){
				return d3.ascending(getSortableDate(a), getSortableDate(b));
			})
			_allconflicts = ac;
		} else _allconflicts = [];
		return this;
	}

	state.fromDate = function(date){
		if (!arguments.length) return _fromDate;
		_fromDate = date;
		this.updateStats();
		return this;
	}

	state.toDate = function(date){
		if (!arguments.length) return _toDate;
		_toDate = date;
		this.updateStats();
		return this;
	}

	state.minDate = function(){
		return _minDate;
	}

	state.maxDate = function(date){
		return _maxDate;
	}

	function setPlacesCoordinates(places){
	    var lonDiff =_cfg.coordinates.lon.max -_cfg.coordinates.lon.min;
	    var latDiff =_cfg.coordinates.lat.max -_cfg.coordinates.lat.min;
	    for (var placeIdx in places){
	    	var place = places[placeIdx];
	    	var realLon = place.coordinates.lon;
	    	var realLat = place.coordinates.lat;
	    	place.coordinates.x = 
	    		Math.floor(((realLon -_cfg.coordinates.lon.min)/lonDiff)*_cfg.mapw);
	    	place.coordinates.y = 
	    		Math.floor(((_cfg.coordinates.lat.max - realLat)/latDiff)*_cfg.maph);
	    }
		return places;
	}	
	return state;

}

