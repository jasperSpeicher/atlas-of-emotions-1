import d3 from 'd3';
import _ from 'lodash';
import smoothScroll from 'smoothscroll';

import * as utils from './utils.js';
import dispatcher from '../dispatcher.js';
import sassVars from '../../scss/variables.json';


export default {

	isInited: false,
	wrapper: null,

	init: function (containerNode, data) {
		this.data = data.annex['triggers-timeline'];

		this.wrapper = containerNode;

		this.setContent();
		this.isInited = true;
	},

	setContent() {

		if (!this.wrapper) return;

		this.insertChartImage();
		this.wrapper.appendChild(utils.makeTable(this.data.desc, this.data.content));
		let wrapper = this.wrapper;
		this.data.footer.forEach(function(footerInfo){
			wrapper.appendChild(utils.makeTable(footerInfo, []));
		});

	},

	insertChartImage() {

		 d3.select(this.wrapper).append('img').attr("src", './img/episodeTimeline.png');

	},

};
