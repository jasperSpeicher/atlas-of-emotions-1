import d3 from 'd3';
import _ from 'lodash';

import * as utils from './utils.js';
import dispatcher from '../dispatcher.js';
import sassVars from '../../scss/variables.json';

export default {

	isInited: false,
	wrapper: null,

	init: function (containerNode, data) {
		this.data = data.about;

		this.wrapper = containerNode;

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

		this.data.subsections.forEach(section => {
			// only append valid subsections; there are empty spaces in the data.
			if (!~section.title.indexOf('about_header')) {
				subBlocks.appendChild(utils.makeBlock(section.title, section.desc));
			}
		});

		subRow.appendChild(subBlocks);

		subRow.appendChild(subBlocks);
		table.appendChild(introRow);
		table.appendChild(subRow);
		this.wrapper.appendChild(table);
	},

};
