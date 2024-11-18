import { initScrollLinks, initializeTables } from "./helpers.js";
import AnnexImpedimentAntidote from "./more-pages/annex-impediment-antidote.js";

class StrategiesSection {
	init(containerNode, screenIsSmall) {
		const subSections = [
			{
				component: AnnexImpedimentAntidote,
				key: "annex-impediment-antidote",
			},
		];
		const scrollParent = $("#strategies-fp-section .scroll-parent");
		const sectionContainer = scrollParent.find(
			"#strategies-impediment-container"
		)[0];
		initializeTables(subSections, sectionContainer);
		initScrollLinks(scrollParent);
	}

	open() {}
	close() {
		return Promise.resolve();
	}
	setEmotion() {
		return Promise.resolve();
	}
	setBackgrounded() {}
	onResize() {}
}

const strategiesSection = new StrategiesSection();
export default strategiesSection;
