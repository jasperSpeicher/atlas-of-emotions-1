import { initializeTables, scrollToSelector } from "./helpers.js";
import AnnexImpedimentAntidote from "./more-pages/annex-impediment-antidote.js";

class StrategiesSection {
	scrollParent = null;
	isInited = false;

	init(containerNode, screenIsSmall) {
		const subSections = [
			{
				component: AnnexImpedimentAntidote,
				key: "annex-impediment-antidote",
			},
		];
		this.scrollParent = $("#strategies-fp-section .scroll-parent");
		const sectionContainer = this.scrollParent.find(
			"#strategies-impediment-container"
		)[0];
		initializeTables(subSections, sectionContainer);
		this.isInited = true;
	}

	scrollToSelector(selector, delay) {
		setTimeout(() => scrollToSelector(selector, this.scrollParent), delay);
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
