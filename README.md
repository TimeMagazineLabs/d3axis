# d3axis

A basic wrapper for d3-scale and d3-axis, mainly used as a dependency for our chart and slider

## Installation

	npm install d3axis
	import { d3axis } from 'd3axis'

Or, if you want to use it independently, you download [dist/d3axis-min.js](dist/d3axis-min.js) and include it like normal:

	<script src='d3axis-min.js'></script>

## Philosophy

This is _not_ a wrapper. It's just a way to save you time coding a D3 scale-axis pairing from scratch. The object it returns exposes both the scale and the axis directly, as if you had manually declared them. Thus, you can do anything D3 can do by directly modifying the scale or axis objects, both of which are directly exposed in the d3axis object.

There are not a great deal of convenience methods since you can do anything you want yourself. Even sophisticated Javascript "easy chart" libraries generally don't allow the user to implement every possible, unforeseeable feature. Instead, this module, as well as the related [d3slider](https://github.com/TimeMagazineLabs/d3slider) and [d3charts](https://github.com/TimeMagazineLabs/d3charts) that use it, is just a container that saves you a lot of copying and pasting from the previous time you made an axis.

## Usage

`d3axis` doesn't create an `svg` for you since it's typically a dependency of a module with an existing `svg`. To declare a new axis, you need to pass an 'svg' or 'g', along with some optional settings. The first argument can be an HTML element or a selector.

	const xAxis = d3axis(svg, {
		direction: 'x',
		margin: { left: 35, top: 50 },
		domain: [1, 10]
	});

	const yAxis = d3axis('#svgID', { 
		direction: 'y', 
		orientation: 'right',
		type: "log",
		base: 2,
		domain: [2, 128]
	});

## Options

All optional, as the name might suggest. 

|property|description|default|options|
|--------|-------|----------------|-----|
| `direction` | horizontal or vertical | `'x'` | `'x'`, `'y'` |
| `length`   |width or height of the scale, including margins |container width or height | number |
| `margin`  |spacing on sides of axis (as object) | x: `{ left: 20, right: 20, top: 35, bottom: 30 }`<br>y: `{ left: 45, right: 30, top: 20, bottom: 30 }` | object of numbers |
| type | type of scale | `linear` | `'linear'`, `'time'`, `'ordinal'`, `'log'`
| domain | domain values | `[0, 1]` | [min, max] of relevant data type or list for `ordinal`
| orientation | Which side the axis appears | `'left'` or `'bottom'` | `'left'`, `'right'` (x),  `'top'`, `'bottom'` (y)
| rules | Make the tick lines span the chart | `true` | `true`, `false` or omitted
| tickLength | Tick length. Overridden by `rules` | 10 | number
| id | DOM id | null | String |
| label | Axis label | null | String |
| label_offset | Distance from label to numbers | 25 (bottom, right), -20 (top), -25 (left) |

### Specially exposed d3 values

While you can manipulate any part of the scale or axis, since both are exposed, three commonly used axis specifications are available in the initial options:

|property|description|
|--------|-------|
| tickFormat | Pass-through to [`d3.axis.tickFormat`](https://github.com/d3/d3-axis#axis_tickFormat) |
| tickValues | Pass-through to [`d3.axis.tickValues`](https://github.com/d3/d3-axis#axis_tickValues) |
| ticks | Pass-through to [`d3.axis.ticks`](https://github.com/d3/d3-axis#axis_ticks) |

## Properties and Methods

The object that `d3axis`--let's called it `myAxis`--return a few core properties and a handful of methods for when you need to update it:

|property|description|
|--------|-------|
|`settings`|The object will all the options above, whether you declared them or used the default.|
|`scale`|The core [d3-scale](https://github.com/d3/d3-scale/) object. Do anything you like with it.|
|`axis`|The core [d3-axis](https://github.com/d3/d3-axis/) object. Likewise.|

|method|description|
|--------|-------|
|`.update(ms)`|Reinitializes the axis with an optional transition in milliseconds. Call this any time you modify the scale or axis.|
|`.resize()`|Dynamically resize the range if the size of the container has changed. This can be attached to an `window.resize` event listener |
|`.setDomain([min,max], ms)`|A convenience method for resetting the domain. You could do this by hand.|

In brief, any time you want to modify the scale or the axis, you need to call `myAxis.update(duration)`. For example, the equivalent of `myAxis.setDomain([0,100], 2000)` is:

	myAxis.scale.domain([0, 100]);
	myAxis.update(2000);

## Dynamic resizing

This scale does not automatically rescale if the container size changes since that is often triggered by a parent application. But you may call `.resize()` any time. For example, in [demo.html](demos/demo.html), the `<svg>` elements are sized by percentage, and if you narrow the window size you'll see the scales adjust thanks to this listener:

	window.onresize = function() {
		xScaleBottom.resize();
		xScaleTop.resize();
		yScaleLeft.resize();
		yScaleRight.resize();
	};
