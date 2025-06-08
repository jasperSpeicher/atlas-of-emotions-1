import d3 from "d3";
import _ from "lodash";

import * as utils from "./utils.js";
import dispatcher from "../dispatcher.js";
import sassVars from "../../scss/variables.json";

export default {
	isInited: false,
	wrapper: null,

	init: function (containerNode, data) {
		this.data = data.annex["impediment-antidote"];

		this.wrapper = containerNode;

		this.setContent();
		this.isInited = true;
	},

	setContent: function () {
		if (!this.wrapper) return;
		const deduplicatedData = this.data.emotions.map((emotion) => {
			const { name, children } = emotion;
			return {
				name,
				children: Object.values(_.groupBy(children, "desc")).map(
					(group) => ({
						name: group.map((e) => e.name).join(", "),
						desc: group[0].desc,
					})
				),
			};
		});
		this.wrapper.appendChild(
			utils.makeTable(this.data.desc, deduplicatedData)
		);
	},
};
