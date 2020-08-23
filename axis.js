import { scaleLinear, scaleTime, scaleLog, scaleBand } from 'd3-scale'; 
import { axisLeft, axisRight, axisBottom, axisTop } from 'd3-axis'; 
import { transition } from 'd3-transition';

function d3axis(container, myOpts) {
	let opts = {
		direction: 'x',
		length: null,
		margin: { left: 40, right: 20, top: 20, bottom: 30 } // you only need to specify two of these dependending of the `direction`
	};




	// careful deep clone
	if (myOpts.hasOwnProperty("margin")) {
		Object.assign(opts.margin, myOpts.margin);
		delete myOpts.margin;
	}

	dir = dir.toLowerCase();
	axis_opts = axis_opts || {};

	// FILL IN OPTIONS

	// range (pixels the axis will span)
	axis_opts.range = axis_opts.range || (dir === "x" ? [0, width] : [height, 0]);

	// output range (domain) of axis
	axis_opts.domain = axis_opts.domain || [0, 1];

	if (typeof axis_opts.min !== "undefined") {
		axis_opts.domain[0] = axis_opts.min;	
	}

	if (typeof axis_opts.max !== "undefined") {
		axis_opts.domain[1] = axis_opts.max;	
	}

	axis_opts.type = axis_opts.type || "linear";

	axis_opts.orientation = axis_opts.orientation || (dir === "x"? "bottom" : "left");

	// if "rules" is true, this will be overridden
	axis_opts.tickLength = axis_opts.hasOwnProperty("tickLength")? axis_opts.tickLength : 10;


	// BUILD THE AXIS

	// currently supported times are time, ordinal, log, or linear (default)
	switch(axis_opts.type.toLowerCase()) {
		case "time": scale = scaleTime(); break;
		case "ordinal": scale = scaleBand().padding(0.2); break;
		case "log": scale = scaleLog(axis_opts.log_base || 2); break;
		case "linear": scale = scaleLinear(); break;
		default: scale = scaleLinear(); break;
	}

	// input range
	if (axis_opts.type === "ordinal2") {
		scale.rangeRoundBands(axis_opts.range, .5).domain(axis_opts.domain);
	} else {
		scale.rangeRound(axis_opts.range).domain(axis_opts.domain);
	}

	if (dir == "x") {
		if (axis_opts.orientation == "top") {
			ax = axisTop().scale(scale);
		} else {
			ax = axisBottom().scale(scale);
		}
	} else {
		if (axis_opts.orientation == "right") {
			ax = axisRight().scale(scale);
		} else {
			ax = axisLeft().scale(scale);
		}
	}

	axis_g = axes_layer.append("g").attr("class", dir + " axis");

	if (axis_opts.tickFormat) {
		ax.tickFormat(axis_opts.tickFormat);
	}

	if (axis_opts.id) {
		axis_g.attr("id", axis_opts.id);	
	}

	if (axis_opts.label) {
		if (dir === "x") {
			axis_opts.label_offset = axis_opts.hasOwnProperty('label_offset') ? axis_opts.label_offset : (axis_opts.orientation === "bottom" ? 30 : -20);
			
			var label = axis_g.append("text")
				.attr("x", width / 2)
				.attr("y", axis_opts.label_offset)
				.style("text-anchor", "middle")
				.classed("axis_label", true)
				.html(axis_opts.label);
		} else {
			var label = axis_g.append("text")
				.attr("transform", function(d){
					return axis_opts.label_offset ? "translate("+ axis_opts.label_offset +","+ height/2 +")rotate(-90)" : "translate("+ -30 +","+ height/2 +")rotate(-90)";
				})
				.style("text-anchor", "middle")
				.classed("axis_label", true)
				.html(axis_opts.label);
		}
	}
	axis_g.call(ax);
}

// invoke this function any time you manually change an axis property, like tickFormat
let update_axis = function(dur) {
	dur ? axis_g.transition().duration(dur).call(ax) : axis_g.call(ax);

	// reposition labels
	if (axis_opts.label) {
		if (dir === "x") {
			axis_g.select(".axis_label")
				.attr("x", width / 2)
				.attr("y", axis_opts.label_offset ? axis_opts.label_offset : 30);
		} else {
			axis_g.select(".axis_label")
				.attr("transform", function(d){
					return  axis_opts.label_offset ? "translate("+ axis_opts.label_offset +","+ height/2 +")rotate(-90)" : "translate("+ -30 +","+ height/2 +")rotate(-90)";
				});
		}

	}
};

// this is invoked on load and any time the graph is modified or resized. See "Philosophy" section of the README
let draw_axis = function (w, h, z) {
	axis_opts.range = dir === "x" ? [0, w] : [h, 0];

	if (axis_opts.type === "ordinal2") {
		scale.rangeRoundBands(axis_opts.range, .5).domain(axis_opts.domain);
	} else {
		scale.range(axis_opts.range).domain(axis_opts.domain);
	}

	if (dir == "x" && axis_opts.orientation == "bottom") {
		axis_g.attr("transform", "translate(0," + h + ")");
		/*
		if (axis_opts.hasOwnProperty("intercept") && axes.y) {
			console.log(axes.y.scale(axis_opts.intercept)), h;
			axis_g.attr("transform", "translate(0," + axes.y.scale(axis_opts.intercept) + ")");
		} else if (axis_opts.orientation == "bottom") {
			axis_g.attr("transform", "translate(0," + h + ")");
		}
		*/
	} else if (dir == "y" && axis_opts.orientation == "right") {
		axis_g.attr("transform", "translate(" + w + ",0)");
	}

	if (dir == "x") {
		if (axis_opts.rules) {
			ax.tickSize(-height, 0);
		} else {
			ax.tickSize(-axis_opts.tickLength, 0);
		}
	} else {
		if (axis_opts.rules) {
			ax.tickSize(-width, 0);
		} else {
			ax.tickSize(-axis_opts.tickLength, 0);
		}					
	}

	// optional resize function passed to axis options
	if (axis_opts.onResize) {
		axis_opts.onResize(scale, axis_g, width, height, z);
	}

	update_axis();
}