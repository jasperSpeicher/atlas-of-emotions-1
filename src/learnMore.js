import d3 from "d3";
import _ from "lodash";

import dispatcher from "./dispatcher.js";
import appStrings from "./appStrings.js";
import sassVars from "../scss/variables.json";

// Pages
import About from "./more-pages/about.js";
import Donate from "./more-pages/donate.js";
import Further from "./more-pages/further.js";
import Annex from "./more-pages/annex.js";
import AnnexEpisodeTimeline from "./more-pages/annex-episode-timeline.js";
import AnnexImpedimentAntidote from "./more-pages/annex-impediment-antidote.js";
import AnnexIntrinsicRemedial from "./more-pages/annex-intrinsic-remedial.js";
import AnnexPartiallyCharted from "./more-pages/annex-partially-charted.js";
import AnnexPsychopathologies from "./more-pages/annex-psychopathologies.js";
import AnnexScientificBasis from "./more-pages/annex-scientific-basis.js";
import AnnexSignals from "./more-pages/annex-signals.js";
import AnnexTraits from "./more-pages/annex-traits.js";
import AnnexMoods from "./more-pages/annex-moods.js";
import { initScrollLinks } from "./helpers.js";

export default {
	isInited: false,
	screenIsSmall: false,
	currentEmotion: null,
	currentPage: null,
	previousPage: null,
	previousSection: null,
	pages: {},
	containers: {},

	init: function (containerNode, screenIsSmall) {
		this.sectionContainer = containerNode;

		this.screenIsSmall = screenIsSmall;

		this.initializePages();

		this.isInited = true;
	},

	// Emotion in this context is the more-info page
	setEmotion: function (
		currentEmotion,
		previousEmotion,
		currentMorePage,
		previousMorePage
	) {},

	open: function () {},

	close: function () {},

	onResize: function (screenIsSmall) {
		this.screenIsSmall = screenIsSmall;
	},

	initializePages: function () {
		const subSections = [
			{ component: AnnexScientificBasis, page: "annex-scientific-basis" },
			{
				component: AnnexEpisodeTimeline,
				page: "annex-triggers-timeline",
			},
			{
				component: AnnexIntrinsicRemedial,
				page: "annex-intrinsic-or-intentional",
			},
			{
				component: AnnexPartiallyCharted,
				page: "annex-partially-charted",
			},
			{ component: AnnexTraits, page: "annex-personality-trait" },
			{ component: AnnexMoods, page: "annex-moods" },
			{
				component: AnnexPsychopathologies,
				page: "annex-psychopathology",
			},
			{ component: AnnexSignals, page: "annex-signals" },
			{
				component: AnnexImpedimentAntidote,
				page: "annex-impediment-antidote",
			},

		];
		for (let subSection of subSections) {
			const subSectionWrapper = document.createElement("div");
			$(subSectionWrapper).addClass("wrapper");
			const subSectionKey = this.getKeyByPage(subSection.page);
			const subSectionAnnexKey = subSectionKey.replace("annex-", "");
			subSectionWrapper.id = subSectionAnnexKey;
			const subSectionData =
				appStrings().getSecondaryDataBlock(subSectionKey);
			subSection.component.init(subSectionWrapper, subSectionData);
			const titleElement = document.createElement("h1");
			const annexData = subSectionData.annex[subSectionAnnexKey];
			titleElement.innerHTML = annexData.title;
			subSectionWrapper.prepend(titleElement);
			this.sectionContainer.appendChild(subSectionWrapper);
		}
		const scrollParent = $("#learn_more");
		initScrollLinks(scrollParent);
	},

	/**
	 * Convert from the page name to the key name within secondary data.
	 */
	getKeyByPage: function (page) {
		switch (page) {
			case "annex-psychopathologies":
				return "annex-psychopathology";
			case "annex-episode-timeline":
				return "annex-triggers-timeline";
			case "annex-intrinsic-remedial":
				return "annex-intrinsic-or-intentional";
			case "annex-traits":
				return "annex-personality-trait";
			case "annex-moods":
				return "annex-moods";
			case "further":
				return "further-reading";
			default:
				return page;
		}
	},

	getPageTitle(item) {
		return this.pages[item].data.title;
	},
};
