formatDate = d3.time.format("%b %y");
d3.timeslider = function() {
    var parentNode = null,
      nodeId = null,
      offset    = d3_slider_offset,
      html      = d3_slider_html,
      svg       = null,
      target    = null,
      tRange = null,
      sDate = null,
      sWidth = null,
      sHeight = null,
      sMarginLeft = 0,
      sMarginRight = 0,
      sMarginTop = 0,
      scMarginTop = 600,
      sMarginBottom = 0,
      brush = null,
      handle = null,
      timeScale = null,
      sMonth = null;
  
  timeslider.draw = function() {
	nodeId = "timeslider"
      timeScale = d3.time.scale()
      .domain(tRange)
      .range([0, sWidth - sMarginLeft - sMarginRight])
      .clamp(true);

      sMonth = sDate;
      brush = d3.svg.brush()
        .x(timeScale)
        .extent([sDate, sDate])
        .on("brush", brushed);

      var svg = d3.select("#"+nodeId)
        .append("svg")
        .attr("transform", "translate("+sMarginLeft+","+ scMarginTop+")")
        .attr("width", sWidth)
        .attr("height", sHeight)
        .append("g")
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, "+sHeight/2+")")
        .call(d3.svg.axis()
          .scale(timeScale)
          .orient("bottom")
          .tickFormat(function(d) {
            return formatDate(d);
          })
          .tickSize(1)
          .tickPadding(12)
          .tickValues([timeScale.domain()[0], timeScale.domain()[1]]))
          .select(".domain")
          .select(function() {
            return this.parentNode.appendChild(this.cloneNode(true));
          })
          .attr("class", "halo");

      var slider = svg.append("g")
        .attr("class", "slider")
        .call(brush);

      slider.selectAll(".extent,.resize").remove();
      slider.select(".background").attr("height", sHeight);

      handle = slider.append("g").attr("class", "handle")
      handle.append("path")
        .attr("transform", "translate(0," + sHeight / 2 + ")")
        .attr("d", "M 0 -30 V 25")
      handle.append('text')
        .attr("class", "slider-month")
        .text(sDate)
        .attr("transform", "translate(-22 ," + ((sHeight / 2) - 5) + ")");
      handle.append('text')
        .attr("class", "slider-year")
        .text(sDate)
        .attr("transform", "translate(-22 ," + ((sHeight / 2) + 15) + ")");
      slider.call(brush.event);
      return timeslider;
  }

  function timeslider() {
  }


  timeslider.attr = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return d3.select("#"+nodeId).attr(n)
    } else {
      var args =  Array.prototype.slice.call(arguments)
      d3.selection.prototype.attr.apply(d3.select("#"+nodeId), args)
    }

    return timeslider
  }

 
  timeslider.style = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return d3.select("#"+nodeId).style(n)
    } else {
      var args =  Array.prototype.slice.call(arguments)
      d3.selection.prototype.style.apply(d3.select("#"+nodeId), args)
    }

    return timeslider
  }

   timeslider.marginBottom = function(margin){
      if (!arguments.length) return sMarginBottom;
      sMarginBottom = margin;
      return timeslider;
    }

   timeslider.marginTop = function(margin){
      if (!arguments.length) return scMarginTop;
      scMarginTop = margin;
      return timeslider;
    }

  timeslider.offset = function(v) {
    if (!arguments.length) return offset
    offset = v == null ? v : d3.functor(v)
    return timeslider
  }

  timeslider.html = function(v) {
    if (!arguments.length) return html
    html = v == null ? v : d3.functor(v)
    return timeslider
  }

  timeslider.timeScale = function(){
    return timeScale
  }

  function d3_slider_offset() { return [0, 0] }
  function d3_slider_html() { return '<b>oh yeah!</b>' }

  function brushed() {

    var value = brush.extent()[0];
    if (d3.event.sourceEvent) { // not a programmatic event
      value = timeScale.invert(d3.mouse(this)[0]);
      brush.extent([value, value]);
    }
    selectedMonth = value;
    var halfOfMonth = new Date(value.getFullYear(), value.getMonth(), 15);
    var xmove = timeScale(halfOfMonth);
    var formattedMonth = d3.time.format("%b")(value).toUpperCase()
    var formattedYear =  d3.time.format("%Y")(value)

    handle.attr("transform", "translate("+xmove+",0)");
    handle.select('text.slider-month').text(formattedMonth);
    handle.select('text.slider-year').text(formattedYear);

    onBrush(value);
  }

  function onBrush(value){
  }
  timeslider.onBrush = function(f){
  	if (!arguments) return onBrush;
  	onBrush = f;
  	return timeslider;
  }

  timeslider.selectedMonth = function(d){
  	if (!arguments) return sMonth;
  	sMonth = d;
  	timeslider.draw();
  	return timeslider;
  }

  timeslider.height = function(h){
    if (!arguments) return sHeight;
    sHeight = h;
    return timeslider;
  }

  timeslider.width = function(w){
    if (!arguments) return sWidth;
    sWidth = w;
    return timeslider;
  }

  timeslider.timeRange = function(range){
    if (!arguments) return tRange;
    tRange = range;
    return timeslider;
  }


  timeslider.startDate = function(date){
    if (!arguments) return sDate;
    sDate = date;
    return timeslider;
  }

  return timeslider;
}


