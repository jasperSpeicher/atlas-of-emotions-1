import _ from "lodash";

// Pages
import AnnexEpisodeTimeline from "./more-pages/annex-episode-timeline.js";
import AnnexIntrinsicRemedial from "./more-pages/annex-intrinsic-remedial.js";
import AnnexPartiallyCharted from "./more-pages/annex-partially-charted.js";
import AnnexPsychopathologies from "./more-pages/annex-psychopathologies.js";
import AnnexScientificBasis from "./more-pages/annex-scientific-basis.js";
import AnnexSignals from "./more-pages/annex-signals.js";
import AnnexTraits from "./more-pages/annex-traits.js";
import AnnexMoods from "./more-pages/annex-moods.js";
import { initializeTables, initScrollLinks } from "./helpers.js";

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
			{ component: AnnexScientificBasis, key: "annex-scientific-basis" },
			{
				component: AnnexEpisodeTimeline,
				key: "annex-triggers-timeline",
			},
			{
				component: AnnexIntrinsicRemedial,
				key: "annex-intrinsic-or-intentional",
			},
			{
				component: AnnexPartiallyCharted,
				key: "annex-partially-charted",
			},
			{ component: AnnexTraits, key: "annex-personality-trait" },
			{ component: AnnexMoods, key: "annex-moods" },
			{
				component: AnnexPsychopathologies,
				key: "annex-psychopathology",
			},
			{ component: AnnexSignals, key: "annex-signals" },
		];
		initializeTables(subSections, this.sectionContainer);
		const scrollParent = $("#learn_more");
		initScrollLinks(scrollParent);
	},

	getPageTitle(item) {
		return this.pages[item].data.title;
	},
};
