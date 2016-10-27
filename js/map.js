/*
 * js/map.js
 * Main representation of the interactive map engine
 */
d3.warmap = function(cfg){
	var _cfg = cfg;
	var _onEvent = function(){};
	var _workspace = {}, _targetsWorkspace = {};
 	warmap.onEvent = function(f){
 		if (!arguments.length) return _onEvent;
 		_onEvent = f;
 		return this;
 	}

	warmap.init = function(state){
		d3.select("#workspace")
	    .attr("class", "main")
		.append("svg:svg")
			.attr("x",0)
		    .attr("y",0)
		    .attr("width", _cfg.w)
		    .attr("height", _cfg.maph)
		  	.append("svg:image")
			   .attr("class", "mainmap")
			   .attr("x", _cfg.margin.left)
			   .attr("y", _cfg.margin.top)
			   .attr("width", _cfg.mapw)
			   .attr("height", _cfg.maph)
			   .attr("xlink:href","img/bgmap.svg")
   			   .on("click", function(){
					state.placeSelected(false);
					onTargetMouseout(state);
				});


		_targetsWorkspace = d3.select("div.main")
		.select("svg")
			.append("svg")
				.attr("class","targets")
				.attr("x",_cfg.margin.left)
				.attr("y",0)
				.attr("width",_cfg.mapw)
				.attr("height",_cfg.maph)

		d3.select("div.main")
	    .append("div")
	    	.attr("class","tooltip")
		    .style("position", "absolute")
		    .style("z-index", "10")
		    .style("visibility", "hidden");

		d3.select("div.main")
	    .append("div")
	    	.attr("class","map-title")
		    .html(_cfg.title);

		return this;
	}

	warmap.draw = function(state){
		d3.select(".targets").selectAll(".target")
		.remove();
		
		d3.select(".targets").selectAll(".target")
		.data(state.conflictsByPlace())
		.enter()
		.append("circle")
			.attr("id", function(placeConflicts){
				return "target"+getPlaceId(placeConflicts);
			})
			.attr("class", "target")
			.attr("cx", getTargetX)
			.attr("cy", getTargetY)
			.attr("r", function(placeConflicts){
				var min = Math.floor(cfg.targets.radius * 0.5);
				return min + (placeConflicts.values.totalStrikes / state.maxStrikes())
					 * (cfg.targets.radius - min);
			})
			.style("fill", cfg.targets.background)
			.attr("opacity", function(placeConflicts) { 
				return getTargetOpacity(placeConflicts, state)
			})
			.on("mouseover", function(placeConflicts) {
				return onTargetMouseover(placeConflicts, state);
			})
			.on("mousemove", function(placeConflicts){ 
				return onTargetMouseover(placeConflicts, state);
			})
			.on("mouseout", function(placeConflicts){
				return onTargetMouseout(state);
			})
			.on("click", function(placeConflicts){
				if (selectionIsFrozen(state)){
					if (placeIsSelected(placeConflicts, state)) {
						state.placeSelected(false);
					} else {
						state.placeConflicts(placeConflicts);
						highlightPlace(placeConflicts, state);
					}
				} else {
					state.placeSelected(true);
				}
				_onEvent("onTargetClick", { "placeConflicts": placeConflicts })
				onTargetMouseout(state);
				d3.event.stopPropagation();
			})

		d3.select(".targets").selectAll(".target")
		.data(state.conflictsByPlace())
		.attr("opacity", function(placeConflicts) {
			return getTargetOpacity(placeConflicts, state);
		})

		d3.select(".targets").selectAll(".target-label")
		.remove();

		d3.select(".targets").selectAll(".target-label")
		.data(state.conflictsByPlace())
		.enter()
		.append("text")
		.attr("class", "target-label")
		.attr("id", function(placeConflicts){
			return "label"+getPlaceId(placeConflicts);
		})
		.attr("x", getTargetX)
		.attr("y", getTargetY)
        .attr("font-family", "sans-serif")
        .attr("font-weight", 700)
        .attr("font-size", Math.floor(cfg.targets.radius*0.4)+"px")
        .attr("fill", cfg.targets.color)
        .style("text-anchor", "middle")
        .attr("opacity", function(placeConflicts){
        	return getTargetLabelOpacity(placeConflicts, state); 
        })
		.text(function(placeConflicts){
			return placeConflicts.values.totalStrikes;
		});

		d3.select(".targets").selectAll(".target-label")
		.data(state.conflictsByPlace())
		.attr("opacity", function(placeConflicts) { 
			return getTargetLabelOpacity(placeConflicts, state); 
		})
		.text(function(placeConflicts){
			return placeConflicts.values.totalStrikes;
		})

		d3.select(".tooltip")
		.style("visibility", getTooltipVisibility(state));

		if (anyPlaceSelected(state)){
			var selected = state.placeConflicts();
			d3.select("#label"+getPlaceId(selected))
				.attr("opacity", getTargetLabelOpacity(selected, state));
			d3.select("#target"+getPlaceId(selected, state))
				.attr("opacity", getTargetOpacity(selected, state));
			onTargetMouseover(selected, state);
		}
		return this;
	}

	warmap.workspace = function(ws){
		if (!arguments.length) return _workspace;
		_workspace = ws;
		return this;
	}

	var highlightPlace = function(placeConflicts, state){
		d3.selectAll(".target-label").attr("opacity", function(pc) {
				return getTargetLabelOpacity(pc, state)	
		});
		
		d3.selectAll(".target").attr("opacity", function(pc) {
				return getTargetOpacity(pc, state)	
			});
		var target = d3.select("#target"+getPlaceId(placeConflicts, state));

		target.attr("opacity",1)
		var placeName = placeConflicts.values.place.name.toUpperCase();

		d3.select(".tooltip")
			.text("Near "+placeName)
			.style("top", parseInt(target.attr("cy")) - parseInt(target.attr("r")*0.3) )
			.style("left",parseInt(target.attr("cx"))
				+ parseInt(target.attr("r")))
			.style("font-size", parseInt(_cfg.targets.radius*0.4))
			.style("color", _cfg.tooltip.color)
			.style("background", _cfg.tooltip.background)
			.style("padding", _cfg.tooltip.padding)
			.style("padding-left", _cfg.tooltip.padding*4)
			.style("visibility", "visible");

	}

	var onTargetMouseover = function(placeConflicts, state){
		if (anyPlaceSelected(state) && selectionIsFrozen(state)) return;
		state.placeConflicts(placeConflicts);
		highlightPlace(placeConflicts, state);
		_onEvent("onTargetMouseover", { "placeConflicts": placeConflicts, "state": state });
	}

	var onTargetMouseout = function(state){
		if (anyPlaceSelected(state) && selectionIsFrozen(state)) return;
		state.placeConflicts(null);
		_onEvent("onTargetMouseout", { "state": state });
		d3.selectAll(".target").attr("opacity", function(placeConflicts) {
			return getTargetOpacity(placeConflicts, state); 
		})
		d3.selectAll(".target-label").attr("opacity", function(placeConflicts) {
			return getTargetLabelOpacity(placeConflicts, state);	
		});
		d3.select(".tooltip").style("visibility", function(placeConflicts) {
			return getTooltipVisibility(state);
		});
		d3.select(".explorer-list").html("");
	}


	function selectionIsFrozen(state){
		return state.placeSelected();
	}
	function anyPlaceSelected(state){
		return state.placeConflicts();
	}

	function placeIsSelected(placeConflicts, state){
		return state.placeConflicts().values.place.name 
			== placeConflicts.values.place.name;
	}

	function getTooltipVisibility(state){
		return anyPlaceSelected(state) ? "visible" : "hidden"
	}

	function getTargetOpacity(placeConflicts, state){
		if (anyPlaceSelected(state)) 
			return placeIsSelected(placeConflicts, state) ? 1 : 0.1;
		return _cfg.targets.opacity.min 
		+ placeConflicts.values.totalStrikes
		* (_cfg.targets.opacity.max-_cfg.targets.opacity.min)/ state.maxStrikes();
	}


	function getTargetLabelOpacity(placeConflicts, state){
		if (anyPlaceSelected(state)) 
			return placeIsSelected(placeConflicts, state) ? 1 : 0;
		return 0;
	}

	function getPlaceId(placeConflicts){
	var coords = placeConflicts.values.place.coordinates;
	return "x"+Math.floor(coords.x)+"y"+Math.floor(coords.y);
	}

	function getTargetX(placeConflicts){
		var coords = placeConflicts.values.place.coordinates;
		return coords.x;
	}

	function getTargetY(placeConflicts){
		var coords = placeConflicts.values.place.coordinates;
		return coords.y;
	}

	
	return warmap;
}

