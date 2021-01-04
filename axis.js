import { select, selectAll, event } from 'd3-selection';
import { scaleLinear, scaleTime, scaleLog, scaleBand } from 'd3-scale'; 
import { axisLeft, axisRight, axisBottom, axisTop } from 'd3-axis'; 
import { transition } from 'd3-transition';

require("./axis.scss");

function d3axis(container, myOpts) {
	"use strict";

	// pseudo globals
	let element, scale, axis, axis_g, label, original_width;

	if (!container) {
		console.log("You must supply slider a container as the first argument to d3slider.");
		return null;
	}

	element = select(container).attr("class", "d3axis");

	const margins = {
		x: { left: 20, right: 20, top: 35, bottom: 30 },
		y: { left: 45, right: 30, top: 20, bottom: 30 }
	};

	const settings = {
		direction: null,
		type: 'linear',
		domain: [0, 1],
		full_width: element.node().clientWidth,
		full_height: element.node().clientHeight,
		margin: null
	};

	// establish direction before setting default margin
	settings.direction = myOpts.hasOwnProperty("direction") ? myOpts.direction : "x";
	settings.direction = settings.direction.toLowerCase();

	settings.margin = margins[settings.direction];

	// manual deep clone
	if (myOpts.hasOwnProperty("margin")) {
		Object.assign(settings.margin, myOpts.margin);
		delete myOpts.margin;
	}

	Object.assign(settings, myOpts);

	original_width = settings.full_width;

	settings.width = settings.full_width - settings.margin.left - settings.margin.right;
	settings.height = settings.full_height - settings.margin.top - settings.margin.bottom;

	// SCALE 
	if (settings.direction === 'x') {
		settings.range = [ 0, settings.width ];
	} else if (settings.direction === 'y') {
		settings.range = [ settings.height, 0 ];
	}

	// output range (domain) of axis
	settings.orientation = settings.orientation || (settings.direction === "x"? "bottom" : "left");

	// if "rules" is true, this will be overridden
	if (settings.rules) {
		settings.tickLength = settings.direction === "x" ? settings.height : settings.width;
	} else {
		settings.tickLength = settings.hasOwnProperty("tickLength")? settings.tickLength : 10;
	}

	// BUILD THE AXIS

	// currently supported times are time, ordinal, log, or linear (default)
	switch(settings.type.toLowerCase()) {
		case "linear": scale = scaleLinear(); break;
		case "time": scale = scaleTime(); break;
		case "ordinal": scale = scaleBand().padding(0.2); break;
		case "log": scale = scaleLog(settings.log_base || 2); break;
		default: scale = scaleLinear(); break;
	}

	// input range
	if (settings.type === "ordinal") {
		scale.rangeRound(settings.range).domain(settings.domain);
	} else {
		scale.range(settings.range).domain(settings.domain);
	}

	if (settings.type == "log" && settings.hasOwnProperty("base")) {
		scale.base(settings.base);
	}

	if (settings.direction === "x") {
		if (settings.orientation === "top") {
			axis = axisTop().scale(scale);
		} else {
			axis = axisBottom().scale(scale);
		}
	} else {
		if (settings.orientation === "right") {
			axis = axisRight().scale(scale);
		} else {
			axis = axisLeft().scale(scale);
		}
	}

	axis_g = element.append("g").attr("class", settings.direction + " axis");

	if (settings.id) {
		axis_g.attr("id", settings.id);	
	}

	if (settings.tickFormat) {
		axis.tickFormat(settings.tickFormat);
	}

	if (settings.ticks) {
		axis.ticks(settings.ticks);
	}

	if (settings.tickValues) {
		axis.tickValues(settings.tickValues);
	}

	if (settings.label) {
		if (!settings.hasOwnProperty('label_offset')) {
			switch(settings.orientation) {
				case "left": settings.label_offset = -25; break;
				case "right": settings.label_offset = 25; break;
				case "top": settings.label_offset = -20; break;
				case "bottom": settings.label_offset = 25; break;
			}
		}

		if (settings.direction === "x") {			
			label = axis_g.append("text")
				.attr("x", settings.width / 2)
				.attr("y", settings.label_offset)
				.classed("axis_label", true)
				.html(settings.label);
		} else {
			label = axis_g.append("text")
				.attr("transform", function(d){
					return "translate(" + settings.label_offset +","+ settings.height / 2 +")rotate(-90)";
				})
				.classed("axis_label", true)
				.html(settings.label);
		}
	}
	axis_g.call(axis);

	// invoke this function any time you manually change an axis property, like tickFormat
	const update_axis = function(dur) {
		dur ? axis_g.transition().duration(dur).call(axis) : axis_g.call(axis);

		// reposition labels
		if (settings.label) {
			if (settings.direction === "x") {
				axis_g.select(".axis_label")
					.attr("x", settings.width / 2)
					.attr("y", settings.label_offset);
			} else {
				axis_g.select(".axis_label")
					.attr("transform", function(d){
						return "translate("+ settings.label_offset + ","+ settings.height / 2 +")rotate(-90)";
					});
			}
		}
	};

	// this is invoked on load and any time the graph is modified or resized.
	const draw_axis = function (w, h) {
		settings.width = w - settings.margin.left - settings.margin.right;
		settings.height = h - settings.margin.top - settings.margin.bottom;
		settings.range = settings.direction === "x" ? [0, settings.width] : [settings.height, 0];

		scale.range(settings.range).domain(settings.domain);		

		if (settings.type === "ordinal") {
			scale.rangeRound(settings.range).domain(settings.domain);
		}

		if (settings.direction === "x") {
			/*
			if (settings.hasOwnProperty("intercept") && axes.y) {
				console.log(axes.y.scale(settings.intercept)), h;
				axis_g.attr("transform", "translate(0," + axes.y.scale(settings.intercept) + ")");
			} else if (settings.orientation == "bottom") {
				axis_g.attr("transform", "translate(0," + h + ")");
			}
			*/

			if (settings.orientation === "bottom") {
				axis_g.attr("transform", `translate(${ settings.margin.left }, ${ settings.margin.top + settings.height })`);
			} else {
				axis_g.attr("transform", `translate(${ settings.margin.left }, ${ settings.margin.top })`);
			}
		} else if (settings.direction === "y") {
			if (settings.orientation == "left") {
				axis_g.attr("transform", `translate(${ settings.margin.left }, ${ settings.margin.top })`);
			} else {
				axis_g.attr("transform", `translate(${ settings.margin.left + settings.width }, ${ settings.margin.top })`);
			}
		}

		if (settings.direction == "x") {
			if (settings.rules) {
				axis.tickSize(-settings.height, 0);
			} else {
				axis.tickSize(-settings.tickLength, 0);
			}
		} else {
			if (settings.rules) {
				axis.tickSize(-settings.width, 0);
			} else {
				axis.tickSize(-settings.tickLength, 0);
			}					
		}

		// optional resize function passed to axis options
		if (settings.onResize) {
			settings.onResize(scale, axis_g, settings.width, settings.height, z);
		}

		update_axis();
	}

	const resize_axis = function() {
		let w = element.node().clientWidth; // - settings.margin.left - settings.margin.right;
		let h = element.node().clientHeight; // - settings.margin.top - settings.margin.bottom;
		let z = settings.width / original_width;

		draw_axis(w, h);
	}

	// this is invoke onload and any time the chart is resized
	draw_axis(settings.full_width, settings.full_height, 1);

	// we'll return this object (and store it in the chart object)
	let obj = {
		element: axis_g,
		settings: settings,
		// original_width: original_width,
		scale: scale,
		axis: axis,
		update: update_axis,
		redraw: draw_axis,
		resize: resize_axis,
		setDomain: function(new_domain, duration) {
			settings.domain = new_domain;
			scale.range(settings.range).domain(settings.domain);
			update_axis(duration);
		}
	};

	return obj;
}

export default d3axis