/*
 * js/histogram.js
 * A custom d3 component to draw an histogram
 */
d3.histogram = function(config){
	var _cfg = config;
	var _workspace = null, _barWidth = 0, 
	_timeScale = function(){}, _onEvent = function() {};
	
	function getBarHeight(strikes, state){
		return (strikes / state.absMaxStrikes()) * _cfg.bars.h.max + _cfg.bars.h.min;
	}

	function getBarX(conflictMonth){
    	var date = moment.utc(conflictMonth.values.year
    		+"-"+padMonth(conflictMonth.values.month)+"-01")
  		var x = _timeScale(date);
  		return parseInt(x);
    }

    function getBarY(conflictMonth, state){
  		var barheight = getBarHeight(conflictMonth.values.totalStrikes, state);
  		return _cfg.bars.h.max - barheight;
    }

    function barIsSelected(conflictMonth, state){
    	var cyear = conflictMonth.values.year;
    	var cmonth = conflictMonth.values.month;
    	var conflictDate = moment.utc(cyear+"-"+padMonth(cmonth)+"-15");
    	var result = conflictDate.isSameOrAfter(state.fromDate())
			&& conflictDate.isSameOrBefore(state.toDate());
		return result;
    }

    function getBarOpacity(conflictMonth, state){
		return barIsSelected(conflictMonth, state) 
			? _cfg.bars.opacity.max 
			: _cfg.bars.opacity.min
    }

    function getBarTickOpacity(conflictMonth, state){
		return barIsSelected(conflictMonth, state) 
			? _cfg.bars.opacity.max 
			: _cfg.bars.opacity.min * 2
    }
    histogram.onEvent = function(f){
    	if (!arguments.length) return _onEvent;
    	_onEvent = f;
    	return this;
    }

	histogram.barWidth = function(bw){
		if (!arguments.length) return _barWidth;
		_barWidth = bw;
		return this;
	}

	histogram.init = function(state){
		_workspace
			.attr("class", "bars")
			.attr("transform", "translate("
				+(_cfg.margin.left + _cfg.slider.margin.left)
				+","
				+(_cfg.maph 
					+ _cfg.margin.top 
					- _cfg.slider.margin.bottom 
					- _cfg.bars.h.max)+")")
			.attr("width", _cfg.slider.w)
			.attr("height", _cfg.bars.h.max + _cfg.slider.h*2)
		return this;
	}

	function getConflictMonthId(conflictMonth){
		return "cm"+conflictMonth.values.year+padMonth(conflictMonth.values.month)
	}

	function onHistogramMouseover(conflictMonth){
		var opacity = barIsSelected(conflictMonth, state) 
		? 1 
		:_cfg.bars.opacity.max;
		var id = "#"+getConflictMonthId(conflictMonth);
		d3.selectAll(id).attr("opacity", opacity);
	}

	function onHistogramMouseleave(conflictMonth){
		d3.selectAll(".histogramBar,.barCaption,.barTick,.barYearTick")
		  .attr("opacity", function (conflictMonth) { 
			return getBarOpacity(conflictMonth, state) 
		});
	}

	function onHistogramClick(conflictMonth, state){
		var fromDate = moment.utc(conflictMonth.values.year
			+"-"+padMonth(conflictMonth.values.month)+"-01");
		var toDate = moment.utc(conflictMonth.values.year
			+"-"+padMonth(conflictMonth.values.month)
			+"-"+fromDate.daysInMonth());
		state.fromDate(fromDate);
		state.toDate(toDate);
		if (!state.placeConflicts()) {
			state.placeSelected(false);
		}

		histogram.draw(state);
		_onEvent("onBarClick", { "fromDate": fromDate, "toDate": toDate })
	}

	histogram.draw = function(state){
	    this.barWidth(Math.floor(0.8*_cfg.slider.w / state.monthsData().length));

		d3.select(".bars").selectAll(".histogramBar").remove()

		d3.select(".bars")
	    .selectAll(".histogramBar")
	    .data(state.monthsData())
	    .enter()
	    .append("rect")
	    	.attr("id", getConflictMonthId)
		  	.attr("class", "histogramBar")
		  	.attr("x", getBarX)
		  	.attr("y", function(conflictMonth){
		  		return getBarY(conflictMonth, state);
		  	})
		  	.attr("width", _barWidth)
		  	.attr("height", function(conflictMonth){
		  		return getBarHeight(conflictMonth.values.totalStrikes, state);
		  	})
			.style("fill",_cfg.bars.color)
			.attr("opacity", function (conflictMonth) { 
				return getBarOpacity(conflictMonth, state) 
			})
			.on("mouseover", onHistogramMouseover)
			.on("mouseleave", onHistogramMouseleave)
			.on("click", function(cm) { return onHistogramClick(cm, state); })

		 d3.select(".bars")
		 .selectAll(".barCaption").remove();

		 d3.select(".bars")
		 .selectAll(".barCaption")
	     .data(state.monthsData())
	     .enter()
		 .append("text")
	    		.attr("id", getConflictMonthId)
				.attr("class", "barCaption")
		    	.attr("x", function(conflictMonth) {
			  		return getBarX(conflictMonth) + _barWidth/2
			  	})
	            .attr("y", function(conflictMonth) { 
	            	return getBarY(conflictMonth, state) - 10 
	            })
	            .text( function (conflictMonth) { 
	            	return conflictMonth.values.totalStrikes; 
	        	})
	            .attr("font-family", "sans-serif")
	            .attr("font-weight", 700)
	            .attr("font-size", "20px")
	            .attr("fill",_cfg.bars.text.color)
	            .style("text-anchor", "middle")
	            .attr("opacity", function (conflictMonth) { 
					return getBarOpacity(conflictMonth, state) 
				})
				.on("mouseover", onHistogramMouseover)
				.on("mouseleave", onHistogramMouseleave)
				.on("click", function(cm) { return onHistogramClick(cm, state); });

		 d3.select(".bars").selectAll(".barTick").remove()
	     
	     d3.select(".bars")
	     .selectAll(".barTick")
	     .data(state.monthsData())
	     .enter()
		 .append("text")
		    	.attr("id", getConflictMonthId)
				.attr("class", "barTick")
		    	.attr("x", function(conflictMonth) {
			  		return getBarX(conflictMonth) + _barWidth/2
			  	})
	            .attr("y", function(conflictMonth) { 
	            	return _cfg.bars.h.max + _cfg.bars.h.min +_cfg.slider.h/3})
	            .text( function (conflictMonth) { 
	            	return moment.utc(conflictMonth.values.year
	            		+"-"
	            		+padMonth(conflictMonth.values.month)+"-01")
	            	.format("MMM").toUpperCase(); 
	        	})
	            .attr("font-family", "sans-serif")
	            .attr("font-weight", 500)
	            .attr("font-size", "20px")
	            .attr("fill",_cfg.bars.tick.color)
	            .style("text-anchor", "middle")
	            .attr("opacity", function (conflictMonth) { 
					return getBarTickOpacity(conflictMonth, state) 
				})
				.on("mouseover", onHistogramMouseover)
				.on("mouseleave", onHistogramMouseleave)
				.on("click", function(cm) { return onHistogramClick(cm, state); });

        d3.select(".bars").selectAll(".barYearTick").remove()
	     
	     d3.select(".bars")
	     .selectAll(".barYearTick")
	     .data(state.monthsData())
	     .enter()
		 .append("text")
		    	.attr("id", getConflictMonthId)
				.attr("class", "barTick")
		    	.attr("x", function(conflictMonth) {
			  		return getBarX(conflictMonth) + _barWidth/2
			  	})
	            .attr("y", function(conflictMonth) { 
	            	return _cfg.bars.h.max + _cfg.bars.h.min +_cfg.slider.h/3 + 12})
	            .text( function (conflictMonth) { 
	            	return moment.utc(conflictMonth.values.year
	            		+"-"
	            		+padMonth(conflictMonth.values.month)+"-01")
	            	.format("YYYY"); 
	        	})
	            .attr("font-family", "sans-serif")
	            .attr("font-weight", 500)
	            .attr("font-size", "12px")
	            .attr("fill",_cfg.bars.tick.color)
	            .style("text-anchor", "middle")
	            .attr("opacity", function (conflictMonth) { 
					return getBarTickOpacity(conflictMonth, state) 
				})
				.on("mouseover", onHistogramMouseover)
				.on("mouseleave", onHistogramMouseleave)
				.on("click", function(cm) { return onHistogramClick(cm, state); })
		
		return this;
	}

	histogram.workspace = function(ws){
		if (!arguments.length) return _workspace;
		_workspace = ws;
		return this;
	}

	histogram.timeScale = function(ts){
		if (!arguments.length) return _timeScale;
		_timeScale = ts;
		return this;
	}
	return histogram;
}
