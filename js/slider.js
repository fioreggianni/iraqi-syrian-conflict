d3.slider = function(config){
	var _cfg = config;
	var _workspace, _onEvent = function(){}, 
	_timeScale, _brush, _sliderHandler;

	slider.workspace = function(ws){
		if (!arguments.length) return _workspace;
		_workspace = ws;
		return this;
	}

	slider.init = function(state){
		_workspace
			.attr("class", "slider")
			.attr("transform", "translate("
				+(_cfg.margin.left 
					+ _cfg.slider.margin.left)
				+","
				+(_cfg.maph 
					+ _cfg.margin.top 
					- _cfg.slider.margin.bottom)+")")
			.attr("width", _cfg.slider.w)
			.attr("height", _cfg.slider.h * 2)
		_workspace
			.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", _cfg.slider.w)
			.attr("height", _cfg.slider.h)
			.attr("fill", "black");

		var _handlerWorkspace = _workspace
			.append("g")
			.attr("class","slider-handler-container")
			.attr("width", _cfg.slider.w)
			.attr("x", 0)
			.attr("y", _cfg.slider.handler.h)
			.attr("height", _cfg.slider.handler.h)

		_handlerWorkspace
			.append("rect")
				.attr("x", 0)
				.attr("y", _cfg.slider.handler.h)
				.attr("width", _cfg.slider.w)
				.attr("height", _cfg.slider.handler.h)
				.attr("fill", "lightgray")
				.attr("opacity", 0.7);
		

		_sliderHandler = _handlerWorkspace
			.append("rect")
				.attr("class", "slider-handler")
				.attr("x",0)
				.attr("y", _cfg.slider.handler.h)
				.attr("height", _cfg.slider.handler.h)
				.attr("fill", "gray")
				.attr("opacity", 0.7);

		_handlerWorkspace
			.append("text")
			.attr("x", Math.floor(_cfg.slider.w / 2))
			.attr("y", _cfg.slider.handler.h*1.6)
			.attr("class", "drag-tip")
			.attr("fill", "brown")
            .style("text-anchor", "middle")
			.text("<-- drag here to select multiple months or click on a column -->")

		_timeScale = d3.time.scale.utc()
	      .range([0, _cfg.slider.w])
	      .clamp(true)
		  .domain([new Date(state.minDate().format()), 
	      		new Date(state.maxDate().format())]);

		_brush = d3.svg.brush()
		.x(_timeScale)
		.on("brush", function(){
		    if (d3.event.sourceEvent)  {
		    	var selectionStart = moment.utc(_brush.extent()[0]);
			    var selectionEnd = moment.utc(_brush.extent()[1]);
				slider.onChange(selectionStart, selectionEnd);
		    }
		    
		});

	    _handlerWorkspace.call(_brush)
		_handlerWorkspace.selectAll(".extent,.resize").remove();
		_workspace.call(_brush.event);
		return this;
	}
	
	slider.onChange = function(selectionStart, selectionEnd) {
		selectionStart = selectionStart.date(1)
		selectionEnd = selectionEnd.date(selectionEnd.daysInMonth())
		var selectionStartDate = new Date(selectionStart.format())
		var selectionEndDate = new Date(selectionEnd.format())
		_brush.extent([selectionStartDate, selectionEndDate])
		_sliderHandler.attr("x", _timeScale(selectionStartDate))
		_sliderHandler.attr("width", Math.abs(_timeScale(selectionEndDate)-_timeScale(selectionStartDate)))
    	slider.onMove(selectionStart, selectionEnd)
	}

	slider.draw = function(state){
		var brushFromDate = moment.utc(state.fromDate().format())
		var brushToDate = moment.utc(state.toDate().format())
		this.onChange(brushFromDate, brushToDate);
	}

	slider.timeScale = function(ts){
		if (!arguments.length) return _timeScale;
		_timeScale = ts;
		return this;
	}

	slider.onEvent = function(f){
		if (!arguments.length) return _onEvent;
		_onEvent = f;
		return this;
	}

	slider.onMove = function(fromDate, toDate){
		if (fromDate.format() != state.fromDate().format() || toDate.format() != state.toDate().format()){
			state.fromDate(fromDate);
			state.toDate(toDate);
			if (!state.placeConflicts()) state.placeSelected(false);
			_onEvent("onSliderMove", { "fromDate": fromDate, "toDate": toDate })
		}
	}

	return slider;
}