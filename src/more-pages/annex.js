import d3 from 'd3';
import _ from 'lodash';

import * as utils from './utils.js';
import dispatcher from '../dispatcher.js';
import sassVars from '../../scss/variables.json';

export default {

	isInited: false,
	wrapper: null,

	init: function (containerNode, data) {
		this.data = data.annex;

		this.wrapper = containerNode;

		this.setContent();
		this.isInited = true;
	},

	makeButton: function (section) {
		const btn = document.createElement('button');
		btn.textContent = section.title;
		btn.setAttribute('data-annexkey', section.key);
		btn.addEventListener('click', function(e) {
			dispatcher.navigate(dispatcher.SECTIONS.MORE, null, dispatcher.ANNEX_DATA_2_PAGE[section.key]);
		});
		return btn;
	},

	setContent: function() {
		if (!this.wrapper) return;
		const sections = Object.keys(this.data).map(key => {
			return {
				key,
				title: this.data[key].title
			};
		});
		
		const title = document.createElement('h4');
		title.classList.add('annex-title');
		title.textContent = 'Welcome to the Annex, home to additional information regarding emotions research.';
		this.wrapper.appendChild(title);

		const helper = document.createElement('p');
		helper.classList.add('annex-helper');
		helper.textContent = 'Explore the topics below to learn more:';
		this.wrapper.appendChild(helper);

		const list = document.createElement('ul');
		list.classList.add('annex-btn-list');

		sections.forEach(section => {
			if (section.key && section.title) {
				const li = document.createElement('li');
				li.appendChild(this.makeButton(section));
				list.appendChild(li);
			}
		});

		this.wrapper.appendChild(list);
	},

};
