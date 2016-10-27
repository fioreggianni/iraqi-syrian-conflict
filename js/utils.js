function padMonth(month){
	if (month.toString().length == 1) return "0"+month;
	return month.toString();
}

function reverseDate(date){
	var datestr = date.toString();
	var year = datestr.substring(0,4);
	var month = datestr.substring(4,6);
	var day = datestr.substring(6,8);
	var newDate = moment.utc(year+"-"+month+"-"+
		(day == "01" ? "01" : padMonth(moment(year+"-"+month, "YYYY-MM").daysInMonth())));
	return newDate;
}

function filterByMonth(conflict, state){ 
	var cyear = conflict.date.year;
	var cmonth = conflict.date.month;
	var conflictDate = moment.utc(cyear+"-"+padMonth(cmonth)+"-15");
	var fromDate = state.fromDate()
	var toDate = state.toDate()
	return conflictDate.isSameOrAfter(fromDate)
		&& conflictDate.isSameOrBefore(toDate);
}

function getSortableDate(conflict){
	var sortableValue = conflict.date.year * 10000 
	+ conflict.date.month * 100 
	+ conflict.date.day;
	return sortableValue;
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}