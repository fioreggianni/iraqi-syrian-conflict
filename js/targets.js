function onTargetMouseover(placeConflicts){
	if (anyPlaceSelected()) return;
	var cfg = getConfig();

	d3.select("#label"+getPlaceId(placeConflicts))
		.attr("opacity", 1);

	d3.selectAll(".target").attr("opacity", 0.1)
	d3.select(this).attr("opacity",1)

	var placeName = placeConflicts.values.place.name.toUpperCase();

	d3.select(".tooltip")
		.text("Near "+placeName)
		.style("top", d3.select(this).attr("cy"))
		.style("left",parseInt(d3.select(this).attr("cx"))
			+ Math.floor(cfg.targets.radius*0.9))
		.style("color", cfg.tooltip.color)
		.style("background", cfg.tooltip.background)
		.style("padding", cfg.tooltip.padding)
		.style("visibility", "visible");

	setExplorerTitle("Near "+placeName);
	setExplorerStrikes(placeConflicts.values.totalStrikes + " strikes");
	
	function getSortableDate(conflict){
		return conflict.date.year * 10000 
		+ conflict.date.month * 100 
		+ conflict.date.day;
	}
	var allConflicts = placeConflicts.values.enumeration.sort(function(a,b){
		return d3.ascending(getSortableDate(a), 
			getSortableDate(b));
	})

	d3.select(".explorer-list").selectAll(".explorer-list-item").remove();

	d3.select(".explorer-list").selectAll(".explorer-list-item")
		.data(allConflicts)
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

}



function drawTargets() {
	
}
