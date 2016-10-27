d3.explorer = function(config){
	var _cfg = config;

	explorer.init = function(state){
		d3.select("div.main")
		  .select("svg")
		  .append("rect")
		  	.attr("x", _cfg.mapw)
		  	.attr("y", 0)
		  	.attr("width", _cfg.margin.right)
		  	.attr("height", _cfg.maph)
		  	.attr("fill", "black");
		var explorer = d3.select("div.main")
	    .append("div")
	    	.attr("class","explorer")
	    	.style("width", _cfg.margin.right 
	    		- _cfg.explorer.margin.left)
	    	.style("top", _cfg.explorer.margin.top)
	    	.style("left", _cfg.w 
	    		- _cfg.margin.right
	    		+ _cfg.explorer.margin.left)
		    .style("position", "absolute")
		    .style("z-index", "10")

	    explorer.append("div")
	    		.attr("class", "explorer-title")
			    .style("color", _cfg.explorer.title.color)
			    .style("font-size", _cfg.explorer.title.size+"px")
			    .text(_cfg.explorer.title.default);
		
		explorer.append("div")
			.attr("class", "explorer-filters")
			.style("top", 10)
		    .style("font-size", _cfg.explorer.filters.size+"px")
		    .style("color", _cfg.explorer.filters.color)
			.text(_cfg.explorer.filters.default)
		explorer.append("div")
			.attr("class", "explorer-strikes")
			.style("top", 10)
		    .style("font-size", _cfg.explorer.strikes.size+"px")
		    .style("color", _cfg.explorer.strikes.color)
			.text(_cfg.explorer.strikes.default)
		var list = explorer.append("div")
			.attr("class", "explorer-list")
			.style("top", 40)
			.style("display","block")
			.style("width", _cfg.margin.right 
				- _cfg.explorer.margin.left)
			.style("height", _cfg.maph*0.8)
			.style("overflow-y","scroll")
		return this;
	}

	explorer.draw = function(state){
		var title = "Select a place";
		var filters = "From "+state.fromDate().format("YYYY/MM/DD") +" to "+state.toDate().format("YYYY/MM/DD");
		var strikes = ""; 		
		if (state.placeConflicts()){
			title = "Near "+state.placeConflicts().key.toUpperCase();
			strikes = state.placeConflicts().values.totalStrikes + " strikes";
		}
		d3.select(".explorer-title").text(title);
		d3.select(".explorer-filters").text(filters);
		d3.select(".explorer-strikes").text(strikes)
		d3.select(".explorer-list").selectAll(".explorer-list-item").remove();
		d3.select(".explorer-list").selectAll(".explorer-list-item")
			.data(state.allconflicts())
			.enter()
			.append("div")
				.attr("class","explorer-list-item")
				.style("width", "80%")
				.style("margin", 5)
				.style("padding", 5)
				.style("background", "white")
				.style("opacity", 0.8)
				.text(function(conflict){
					var conflictDate = moment.utc(conflict.date.year
						+"-"+padMonth(conflict.date.month)
						+"-"+padMonth(conflict.date.day));
					return "On "+conflictDate.format("YYYY-MM-DD") 
					+ ": "+ conflict.strikes+" strikes";
				});
		return this;
	}

	return explorer;	
}


