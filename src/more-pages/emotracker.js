import d3 from 'd3';
import _ from 'lodash';

import * as utils from './utils.js';
import dispatcher from '../dispatcher.js';
import sassVars from '../../scss/variables.json';

export default {

	isInited: false,
	currentEmotion: null,
	wrapper: null,

	init: function (containerNode, data) {
		this.data = data.donate;
		console.log('emotracker', this.data);

		this.sectionContainer = containerNode;

		this.wrapper = this.sectionContainer.querySelector('.wrapper');

		this.setContent();
		this.isInited = true;

	},

	setContent: function() {
		if (!this.wrapper) return;

		const table = document.createElement('div');
		const introRow = document.createElement('div');
		const subRow = document.createElement('div');

		table.classList.add('tb');
		introRow.classList.add('tb-row');
		subRow.classList.add('tb-row');

		introRow.appendChild(utils.makeBlock(this.data.title, this.data.desc));

		const subBlocks = document.createElement('div');
		subBlocks.classList.add('sub-blocks');

		// Link
		subBlocks.appendChild(utils.makeLinkBlock(this.data.link));

		// Images?

		subRow.appendChild(subBlocks);
		table.appendChild(introRow);
		table.appendChild(subRow);
		this.wrapper.appendChild(table);
	},

	setEmotion: function (emotion) {

		return new Promise((resolve, reject) => {

			// TODO: resolve after any intro animations
			// setTimeout(() => {
			resolve();
			// }, sassVars.states.backgrounded.duration.in);

		});

	},

	open: function () {
		this.sectionContainer.classList.add('active');

		// any section-wide opening animations not specific to a particular page go here.
		// probably won't be anything here for the more info section.

	},

	close: function () {
		this.sectionContainer.classList.remove('active');
		return new Promise((resolve, reject) => {

			// any closing animation goes here

			resolve();

		});

	}

};
