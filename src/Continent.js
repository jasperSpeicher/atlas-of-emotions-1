import _ from 'lodash';
import d3 from 'd3';
import d3Transform from 'd3-transform';
import TWEEN from 'tween.js';

import Circle from './Circle.js';
import emotionsData from '../static/emotionsData.json';
import sassVars from '../scss/variables.json';

const FRAMERATE = 60;
const MAX_NUM_CIRCLES = 8;

// zoomed-in continents (with spread circles) are
// this much larger than their corresponding state graph.
const SPREAD_SCALE = 1.2;

export default class Continent {

	static HIGHLIGHT_LEVELS = {
		NONE: 0,
		UNSELECTED: 1,
		UNHIGHLIGHTED: 2,
		HIGHLIGHTED: 3,
		SELECTED: 4
	};
	static HIGHLIGHT_ALPHA_MODS = [
		1.0,
		0.25,
		0.5,
		1.5,
		2.0
	];
	static HIGHLIGHT_SPEED_MODS = [
		1.0,
		0.25,
		0.5,
		1.5,
		2.0
	];

	static configsByEmotion = {
		'anger': {
			colorPalette: [
				[204, 28, 23],
				[208, 46, 53],
				[212, 65, 63],
				[216, 83, 73],
				[220, 102, 83],
				[224, 120, 92],
				[228, 135, 102]
			]
		},
		'disgust': {
			colorPalette: [
				[0, 104, 55],
				[0, 110, 57],
				[0, 116, 59],
				[0, 122, 61],
				[0, 128, 63],
				[0, 130, 65],
				[0, 136, 67],
				[0, 142, 69]
			]
		},
		'enjoyment': {
			colorPalette: [
				[248, 136, 29],
				[243, 143, 30],
				[243, 136, 33],
				[244, 149, 36],
				[244, 153, 40],
				[245, 156, 43],
				[245, 159, 46],
				[246, 162, 49],
				[247, 169, 56],
				[246, 166, 53],
				[247, 172, 59]
			]
		},
		'fear': {
			colorPalette: [
				[143, 39, 139],
				[156, 41, 153],
				[196, 49, 194],
				[209, 51, 207],
				[223, 53, 221],
				[235, 56, 234],
				[248, 58, 248]
			]
		},
		'sadness': {
			colorPalette: [
				[65, 74, 161],
				[54, 104, 178],
				[49, 124, 189],
				[44, 139, 200],
				[51, 158, 211],
				[85, 172, 217],
				[146, 198, 229],
				[174, 209, 234],
				[195, 218, 238]
			]
		}
	};

	static transforms;
	static initTransforms (w, h) {

		Continent.transforms = _.shuffle([
			{
				// top
				x: 0.03 * w,
				y: -0.20 * h,
				label: {
					x: 0.19 * w,
					y: -0.13 * h
				},
				size: 0.24 * h,
				introSpreadMaxRad: 0.13
			},
			{
				// left
				x: -0.22 * w,
				y: -0.14 * h,
				label: {
					x: -0.25 * w,
					y: -0.01 * h
				},
				size: 0.23 * h,
				introSpreadMaxRad: 0.2
			},
			{
				// center
				x: -0.06 * w,
				y: 0.07 * h,
				label: {
					x: -0.22 * w,
					y: 0.07 * h
				},
				size: 0.18 * h,
				introSpreadMaxRad: 0.35,
				isCenterContinent: true
			},
			{
				// bottom
				x: -0.03 * w,
				y: 0.22 * h,
				label: {
					x: -0.17 * w,
					y: 0.17 * h
				},
				size: 0.22 * h,
				introSpreadMaxRad: 0.15
			},
			{
				// right
				x: 0.19 * w,
				y: 0.10 * h,
				label: {
					x: 0.01 * w,
					y: 0.25 * h
				},
				size: 0.24 * h,
				introSpreadMaxRad: 0.15
			}
		]);
	}

	constructor (emotion, container, continentGeom) {

		if (!Continent.transforms) {
			Continent.initTransforms(continentGeom.w, continentGeom.h);
		}

		this.initInstanceProperties(emotion, container, continentGeom);

		this.prepopulate();

	}

	initInstanceProperties (emotion, container, continentGeom) {

		let emotionIndex = Object.keys(Continent.configsByEmotion).indexOf(emotion);
		if (emotionIndex === -1) {
			throw new Error('Invalid emotion "' + emotion + '" for continent.');
		}

		this.id = emotion,
		this.name = emotion.toUpperCase(),
		this.colorPalette = Continent.configsByEmotion[emotion].colorPalette.concat();

		this.spawnConfig = {
			lastSpawn: 0,
			minDelay: 3 * FRAMERATE,
			freq: 0.010
		};

		this.drift = {
			x: 0,
			y: 0,
			sinCtr: Math.random() * 2*Math.PI,
			cosCtr: Math.random() * 2*Math.PI
		};

		this.centerX = continentGeom.centerX;
		this.centerY = continentGeom.centerY;

		// copy transforms onto this Continent instance
		Object.assign(this, Continent.transforms[emotionIndex]);

		this.introSpreadRad = 0;
		this.introSpreadAng = Math.atan2(this.y, this.x);
		if (this.isCenterContinent) {
			// move center continent a little off-angle.
			this.introSpreadAng += 0.4;
		}

		this.scaleX = 1.0;
		this.scaleY = 1.0;

		this.circles = [];
		this.highlightLevel = Continent.HIGHLIGHT_LEVELS.NONE;
		this.isFocused = false;

		this.d3Selection = container.append('g')
			.classed('continent ' + this.id, true)
			.style('opacity', 0.0)
			.datum(this);
		this.d3Selection.transition()
			.duration(sassVars.ui.overlays.duration.in * 1000)	// match initial appearance of dialogs
			.style('opacity', 1.0);

		this.circleWrapper = this.d3Selection.append('g')
			.classed('circle-wrapper', true);

	}

	prepopulate () {

		let numCircles = 3 + Math.floor(Math.random() * 3);
		for (let i=0; i<numCircles; i++) {
			let newCircle = Circle.spawn(this, 1, true);
			newCircle.radius = 0.25 + (0.75 * Math.random()) * newCircle.size;
			newCircle.update(
				Continent.HIGHLIGHT_ALPHA_MODS[this.highlightLevel],
				Continent.HIGHLIGHT_SPEED_MODS[this.highlightLevel]);
			this.circles.push(newCircle);
		}

	}

	update (state, frameCount) {

		if (this.tweens) {
			_.values(this.tweens).forEach(tween => {
				tween.update(state.time);
			});
		}

		let newCircle,
			circle,
			alphaMod,
			speedMod,
			scale;

		if (!this.isFocused) {

			// probabilistically spawn new Circles
			if (this.circles.length < MAX_NUM_CIRCLES) {
				newCircle = Circle.spawn(this, frameCount);
				if (newCircle) {
					this.circles.push(newCircle);
				}
			}

			// set alpha and speed based on interaction
			alphaMod = Continent.HIGHLIGHT_ALPHA_MODS[this.highlightLevel];
			speedMod = Continent.HIGHLIGHT_SPEED_MODS[this.highlightLevel];

			// apply drift
			this.wander(this.drift, 3);

		}

		let transX = this.centerX + this.x + this.drift.x,
			transY = this.centerY + this.y + this.drift.y;

		if (this.introSpreadRad) {
			transX += this.introSpreadRad * Math.cos(this.introSpreadAng);
			transY += this.introSpreadRad * Math.sin(this.introSpreadAng);
		}

		this.d3Selection
			.attr('transform', d3Transform()
				.translate(
					transX,
					transY
				)
				.scale(
					this.scaleX,
					this.scaleY
				)
			);

		if (!this.isFocused) {

			// update circles
			for (let i=this.circles.length-1; i>=0; i--) {
				circle = this.circles[i];
				if (circle.isAlive()) {
					circle.update(alphaMod, speedMod);
				} else {
					this.circles.splice(i, 1);
					circle.d3Wrapper.remove();
				}
			};

		}

	}

	addTween (props, time, delay, func=TWEEN.Easing.Linear.None) {

		if (!this.tweens) {
			this.tweens = {};
		}

		let key = Object.keys(props).sort().join(',');
		if (this.tweens[key]) {
			this.tweens[key].stop();
		}

		this.tweens[key] = new TWEEN.Tween(this)
			.to(props, time)
			.delay(delay)
			.onComplete(() => { delete this.tweens[key]; })
			.easing(func)
			.start();

	}

	spreadCircles (container, containerScale) {

		// TODO: set up range / margins in constructor
		// TODO: DRY this out. Copied from states.js.
		// TODO: creating + manipulating circles here, instead of using Circle.js, is going to cause problems.

		this.isFocused = true;
		let continent = this;

		// d3 conventional margins
		let margin = {
				top: 20,
				right: 20,
				bottom: 50,
				left: 20
			},
			statesGraphWidth = 0.7,		// from _variables.scss
			innerWidth = statesGraphWidth * (container.offsetWidth - margin.left - margin.right) / containerScale * SPREAD_SCALE,
			innerHeight = (container.offsetHeight - margin.top - margin.bottom) / containerScale * SPREAD_SCALE,
			xScale = d3.scale.linear()
				.domain([0, 10])
				.range([-0.5 * innerWidth, 0.5 * innerWidth]),
			rScale = d3.scale.linear()
				.domain([0, 10])
				.range([0, 0.5 * innerWidth]);

		const growTime = sassVars.continents.spread.duration.in * 1000,
			shrinkTime = 0.5 * growTime;

		let ranges = this.transformRanges(emotionsData.emotions[this.id].states),
			circles = this.circleWrapper.selectAll('circle')
				.data(ranges);

		let calcStrokeColor = function (d, i) {
			let colorPalette = Continent.configsByEmotion[continent.id].colorPalette,
				color = colorPalette[Math.floor(Math.random() * colorPalette.length)].join(',');
			return 'rgb(' + color + ')';
		};

		// Move existing circles to positions and sizes corresponding to states
		circles.transition()
			.duration(growTime)
			.attr('cx', d => xScale(d.cx))
			.attr('r', d => rScale(d.r))
			.attr('stroke', calcStrokeColor)
			.attr('stroke-opacity', Circle.BASE_ALPHA)
			.attr('stroke-width', d => rScale(d.strokeWidth));

		// Add new circles as needed, and fade/grow them in at positions and sizes corresponding to states
		circles.enter().append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', 0)
			.attr('stroke', calcStrokeColor)
			.attr('stroke-opacity', Circle.BASE_ALPHA)
			.attr('stroke-width', d => rScale(d.strokeWidth))
		.transition()
			.duration(growTime)
			.attr('cx', d => xScale(d.cx))
			.attr('r', d => rScale(d.r));

		circles.exit().transition()
			.duration(shrinkTime)
			.ease('quad-out')
			.attr('opacity', 0.0)
			.attr('transform', d3Transform().scale(0, 0));

		// flatten out the circles wrapper as well,
		// in preparation for displaying states (elevation/profile of continent)
		this.circleWrapper.classed('flat', true);

		// TODO: hook into transition complete (.each(.on('end', fn))) and:
		// - update this.circles with newly-created circles, or don't?
		// - allow circles to drift?
		// - set this.isFocused = false?
		// might instead just let circles made here exist outside of zoomed-out 'normal' animation,
		// and let them go away when transitioning back to zoomed-out view.

	}

	gatherCircles (immediate) {

		const growTime = immediate ? 0 : sassVars.continents.spread.duration.out * 1000,
			shrinkTime = immediate ? 0 : 0.5 * growTime;

		let calledOnEnd = false,
			circles = this.circleWrapper.selectAll('circle')
				.data(this.circles);

		// transition circles that exist in this.circles back to their original settings
		circles.transition()
			.duration(growTime)
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', d => d.radius)
			.attr('stroke', d => 'rgb(' + d.color + ')')
			.attr('stroke-opacity', d => d.alpha)
			.attr('stroke-width', d => d.calcStrokeWidth())
			.each('end', (...args) => {
				if (!calledOnEnd) {
					this.isFocused = false;
					calledOnEnd = true;
				}
			});

		// TODO: necessary to add circles back in?
		// it's possible for there to be more circles in this.circles than there are states in the selected emotion.
		// probably the simplest way to handle this is to remove from this.circles any circles transitioned out
		// via the exit selection in spreadCircles, so they don't even come into play here.
		/*
		// Add new circles as needed, and fade/grow them in at positions and sizes corresponding to states
		circles.enter().append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', 0)
			.attr('stroke', calcStrokeColor)
			.attr('stroke-opacity', Circle.BASE_ALPHA)
			.attr('stroke-width', d => rScale(d.strokeWidth))
		.transition()
			.duration(growTime)
			.attr('cx', d => xScale(d.cx))
			.attr('r', d => rScale(d.r));
		*/

		// remove all circles created within spreadCircles that are not present in this.circles
		circles.exit().transition()
			.duration(shrinkTime)
			.ease('quad-out')
			.attr('opacity', 0.0)
			.attr('transform', d3Transform().scale(0, 0));

		// unflatten the circles wrapper
		this.circleWrapper.classed('flat', false);
		
	}

	/**
	 * Map emotion ranges into circles of varying stroke widths,
	 * but with locations and sizes matching corresponding state graph.
	 */
	transformRanges (states, emotion, strengthMod=1.0) {

		// TODO: DRY this out. Copied from states.js.
		// Should have a central place to parse emotion data, rather than
		// pulling straight from json and manipulating everywhere it's used.

		// filter out states with invalid ranges
		states = states.filter(state => {
			return !!(state.range.min && state.range.max);
		});

		// sort by state min value, then max value
		states = states.sort((a, b) => {
			if (a.range.min < b.range.min) {
				return -1;
			} else if (a.range.min > b.range.min) {
				return 1;
			} else {
				if (a.range.max < b.range.max) {
					return -1;
				} else if (a.range.max > b.range.max) {
					return 1;
				}
			}
			return 0;
		});
		
		let numStates = states.length;
		return states.map((state, i) => {

			let max = state.range.max,
				min = state.range.min - 1,
				halfWidth = 0.5 * (max - min),

				// This line allows strokeWidth to vary from a half-full circle to a nearly-full circle.
				strokeWidth = (0.4 + 0.5 * Math.random()) * halfWidth;

			return {
				cx: min + halfWidth,

				// Allow circles to occupy a bit more room than state graph xScale.
				strokeWidth: strokeWidth * 1.2,

				// To keep total width pegged to state graph xScale,
				// r + 0.5 * strokeWidth must equal halfWidth.
				r: halfWidth - 0.5 * strokeWidth
			};

		});

	}

	// Randomized sinusoidal motion
	wander (drift, maxDist) {

		drift.sinCtr += 0.01 + Math.random() * 0.03;
		drift.cosCtr += 0.01 + Math.random() * 0.03;
		drift.x = Math.cos(drift.cosCtr) * maxDist;
		drift.y = Math.sin(drift.sinCtr) * maxDist;

	}

	// Random walk
	meander (drift, maxDist) {

		let maxSpeed = 2 * 0.01 * maxDist;
		let maxTurn = 2 * 0.002 * Math.PI;
		let x = Math.cos(drift.ang) * drift.dist;
		let y = Math.sin(drift.ang) * drift.dist;
		let angToCenter = Math.atan2(y, x);

		drift.dist += (-0.5 + Math.random()) * maxSpeed;
		drift.ang +=  (-0.5 + Math.random()) * maxTurn;

		// normalize angles
		while (angToCenter < 0) { angToCenter += 2*Math.PI; }
		while (drift.ang < 0) { drift.ang += 2*Math.PI; }
		drift.ang %= 2*Math.PI;

		// If getting too far away from center, turn back toward center
		if (drift.dist > 0.5 * maxDist) {
			drift.ang += 0.1 * (angToCenter - drift.ang);
		}

	}


};
