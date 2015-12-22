import d3 from 'd3';
import _ from 'lodash';

import dispatcher from './dispatcher.js';
import emotionsData from '../static/emotionsData.json';
import appStrings from '../static/appStrings.json';
import states from './states.js';


// number of concentric rings in which trigger labels are arranged
const NUM_RINGS = 3;

// path for arrowhead shape
const ARROWHEAD = "M0,0.1C3.1-3,9.3-4.5,13.6-4.6C7.9-0.3,2.8,5.2,0,12C-2.7,5.2-8-0.1-13.6-4.6C-9-4.3-3.4-3.1,0,0.1z";

export default {

	isInited: false,
	currentEmotion: null,
	triggersData: null,
	backgroundSections: [ states ],
	tempNav: null,
	
	init: function (containerNode) {

		this.sectionContainer = containerNode;

		let graphContainer = document.createElement('div');
		graphContainer.id = 'trigger-graph-container';
		containerNode.appendChild(graphContainer);

		this.initLabels(containerNode);

		this.createTempNav(containerNode);

		// 
		// d3 conventional margins
		// 
		let margin = {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		};

		let innerWidth = graphContainer.offsetWidth - margin.left - margin.right;
		let innerHeight = graphContainer.offsetHeight - margin.top - margin.bottom;

		let svg = d3.select(graphContainer).append('svg')
			.attr('width', graphContainer.offsetWidth)
			.attr('height', graphContainer.offsetHeight);

		this.triggerGraphContainer = svg.append('g')
			.attr('transform', 'translate(' + (margin.left + 0.5*innerWidth) + ',' + (margin.top + innerHeight) + ')');

		// 
		// d3/svg setup
		// 

		let haloRadius = 0.5 * innerWidth,
			triggerInnerRadius = haloRadius * 1.125,
			triggerAreaWidth = haloRadius * 1.375 - triggerInnerRadius;

		this.haloPieLayout = d3.layout.pie()
			.value(d => 1)
			.startAngle(-0.5 * Math.PI)
			.endAngle(0.5 * Math.PI);

		this.haloArcGenerator = d3.svg.arc()
			.innerRadius(0.8 * haloRadius)
			.outerRadius(haloRadius);

		this.setUpDefs(svg.append('defs'), haloRadius);

		// need radius to parse data, so this comes last.
		this.triggersData = this.parseTriggers(haloRadius);

		this.isInited = true;

	},

	initLabels: function (containerNode) {

		this.labelContainer = d3.select(containerNode).append('div')
			.attr('id', 'trigger-labels');

	},

	parseTriggers: function (haloRadius) {

		const startAngle = -0.7 * Math.PI,
			angleSpread = 0.4 * Math.PI,
			innerRadius = haloRadius * 1.25,
			radiusSpread = haloRadius * 0.5;

		let triggersData = {};
		_.values(dispatcher.EMOTIONS).forEach(emotion => {

			let numTriggers = emotionsData.emotions[emotion].triggers.length;
			let middleIndex = Math.floor(numTriggers / 2);
			triggersData[emotion] = emotionsData.emotions[emotion].triggers.concat()
			.sort((a, b) => {
				if (a < b) return -1;
				else if (a > b) return 1;
				else return 0;
			})
			.map((trigger, i) => ({
				name: trigger,

				// distribute evenly between startAngle and startAngle + angleSpread,
				// with a gap in the middle
				angle: startAngle + angleSpread * (i + (i < middleIndex ? 0.5 : 1.5)) / (numTriggers + 1),

				// distribute along rings spanning between innerRadius and innerRadius + radiusSpread,
				// starting at the second ring and cycling between rings
				radius: innerRadius + radiusSpread * ((i + 1) % NUM_RINGS) / (NUM_RINGS - 1),

				// TODO: vary arrow width based on some data
				arrowLength: 1
			}));

		});

		return triggersData;

	},

	renderLabels: function (ranges) {

		// TODO: implement if useful

	},

	// TODO: DRY this out, copied almost exactly from states.js
	// set up global gradients and xlink:href to them from here and states.js
	setUpDefs: function (defs, radius) {

		// base gradient
		defs.append('radialGradient')
			.attr('id', 'triggers-gradient')
			.attr('gradientUnits', 'userSpaceOnUse')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', radius);

		// anger
		defs.append('radialGradient')
			.attr('id', 'triggers-anger-gradient')
			.attr('xlink:href', '#triggers-gradient')
		.selectAll('stop')
			.data([
				{ offset: '84%', color: 'rgba(228, 135, 102, 0.2)' },
				{ offset: '100%', color: 'rgba(204, 28, 43, 1.0)' }
			])
		.enter().append('stop')
			.attr('offset', d => d.offset)
			.attr('stop-color', d => d.color);

		// disgust
		defs.append('radialGradient')
			.attr('id', 'triggers-disgust-gradient')
			.attr('xlink:href', '#triggers-gradient')
		.selectAll('stop')
			.data([
				{ offset: '84%', color: 'rgba(0, 142, 69, 0.3)' },
				{ offset: '100%', color: 'rgba(0, 104, 55, 1.0)' }
			])
		.enter().append('stop')
			.attr('offset', d => d.offset)
			.attr('stop-color', d => d.color);

		// enjoyment
		defs.append('radialGradient')
			.attr('id', 'triggers-enjoyment-gradient')
			.attr('xlink:href', '#triggers-gradient')
		.selectAll('stop')
			.data([
				{ offset: '84%', color: 'rgba(241, 196, 83, 0.8)' },
				{ offset: '100%', color: 'rgba(248, 136, 29, 1.0)' }
			])
		.enter().append('stop')
			.attr('offset', d => d.offset)
			.attr('stop-color', d => d.color);

		// fear
		defs.append('radialGradient')
			.attr('id', 'triggers-fear-gradient')
			.attr('xlink:href', '#triggers-gradient')
		.selectAll('stop')
			.data([
				{ offset: '84%', color: 'rgba(248, 58, 248, 0.1)' },
				{ offset: '100%', color: 'rgba(143, 39, 139, 1.0)' }
			])
		.enter().append('stop')
			.attr('offset', d => d.offset)
			.attr('stop-color', d => d.color);

		// sadness
		defs.append('radialGradient')
			.attr('id', 'triggers-sadness-gradient')
			.attr('xlink:href', '#triggers-gradient')
		.selectAll('stop')
			.data([
				{ offset: '84%', color: 'rgba(200, 220, 240, 1.0)' },
				{ offset: '100%', color: 'rgba(64, 70, 164, 1.0)' }
			])
		.enter().append('stop')
			.attr('offset', d => d.offset)
			.attr('stop-color', d => d.color);		

	},

	setEmotion: function (emotion) {

		if (!~_.values(dispatcher.EMOTIONS).indexOf(emotion)) {
			emotion = 'anger';
		}
		this.currentEmotion = emotion;

		// TODO: transition between emotions:
		// fade out and scale down triggers,
		// tween color of dome (? - or just fade out and redraw?)

		this.tempNav.querySelector('.prev').innerHTML = '<a href="#actions:' + emotion + '">ACTIONS ▲</a>';
		// this.tempNav.querySelector('.next').innerHTML = '<a href="#moods:' + emotion + '">MOODS ▼</a>';
		this.tempNav.classList.add('visible');

		let haloSelection = this.triggerGraphContainer.selectAll('path.halo')
			.data(this.haloPieLayout([{}]));
		// .transition()
		// 	.duration(1000)
		// 	.fill();

		haloSelection.enter().append('path')
			.classed('halo ' + this.currentEmotion, true)
			.attr('d', this.haloArcGenerator)
			.style('opacity', 0.0)
		.transition()
			.duration(1000)
			.style('opacity', 1.0);

		let currentTriggersData = this.triggersData[this.currentEmotion];
		this.renderLabels(currentTriggersData);

	},

	renderLabels: function (triggersData) {

		let labelSelection = this.labelContainer.selectAll('div.label')
			.data(triggersData/*, d => d.name*/);

		// update
		
		// enter
		let labelEnterSelection = labelSelection.enter().append('div')
			.classed('label ' + this.currentEmotion, true)
			// .style('opacity', 0.0)
			.style('transform', d => {
				let x = Math.cos(d.angle) * d.radius,
					y = Math.sin(d.angle) * d.radius;
				return 'translate(' + x + 'px,' + y + 'px)';
			});
		labelEnterSelection.append('h3')
			.html(d => d.name.toUpperCase());

		/*
		let labelSize = this.lineGenerator.radius()({x:1}) + 50,
			labelSelection = this.labelContainer.selectAll('div.label')
			.data(actionsData, d => d.name);
		
		// update
		labelSelection.transition()
			.duration(1000)
			.style('transform', d => 'rotate(' + d.rotation + 'deg)');
		labelSelection.select('h3').transition()
			.duration(1000)
			.style('transform', d => 'rotate(-' + d.rotation + 'deg) scaleY(1.73)');

		// enter
		let labelEnterSelection = labelSelection.enter().append('div')
			.classed('label ' + this.currentEmotion, true)
			.style('transform', d => 'rotate(' + d.rotation + 'deg)')
			.style('height', labelSize + 'px')
			.style('opacity', 0.0)
			.on('mouseover', this.onActionMouseOver)
			.on('mouseout', this.onActionMouseOut)
			.on('click', this.onActionMouseClick);
		labelEnterSelection.append('div').append('h3')
			.html(d => d.name.toUpperCase())
			.style('transform', d => 'rotate(-' + d.rotation + 'deg) scaleY(1.73)');
				
		labelEnterSelection.transition()
			.duration(1000)
			.style('opacity', 1.0);

		// exit
		labelSelection.exit().transition()
			.duration(600)
			.style('opacity', 0.0)
			.remove();
		*/

	},

	open: function () {

		// transition time from _states.scss::#states
		let openDelay = 1500;

		this.openTimeout = setTimeout(() => {
			this.resetCallout();
		}, openDelay);

	},

	close: function () {

		return new Promise((resolve, reject) => {

			clearTimeout(this.openTimeout);

			this.tempNav.classList.remove('visible');

			// TODO: resolve on completion of animation
			resolve();

		});

	},

	resetCallout () {
		dispatcher.changeCallout(this.currentEmotion, appStrings.triggers.header, appStrings.triggers.body);
	},

	createTempNav (containerNode) {

		this.tempNav = document.createElement('div');
		this.tempNav.id = 'temp-triggers-nav';
		containerNode.appendChild(this.tempNav);

		let prev = document.createElement('div');
		prev.classList.add('prev');
		this.tempNav.appendChild(prev);

		let next = document.createElement('div');
		next.classList.add('next');
		this.tempNav.appendChild(next);

	}

};
