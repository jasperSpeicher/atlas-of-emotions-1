import d3 from 'd3';
import _ from 'lodash';

import * as utils from './utils.js';
import dispatcher from '../dispatcher.js';
import sassVars from '../../scss/variables.json';

export default {

	isInited: false,
	wrapper: null,

	init: function (containerNode, data) {
		this.data = data.annex['scientific-basis'];

		this.wrapper = containerNode;

		this.setContent();
		this.isInited = true;
	},

	setContent: function() {
		if (!this.wrapper) return;
		
		// intro
		this.wrapper.appendChild(utils.makeTable(this.data.desc, []));
		// survey results
		this.wrapper.appendChild(utils.makeTable(this.data.contentIntro, this.data.content));
		// footer content
		this.wrapper.appendChild(utils.makeTable(this.data.footer[0], []));
		this.wrapper.appendChild(utils.makeTable(this.data.footer[1], []));
	},


};
