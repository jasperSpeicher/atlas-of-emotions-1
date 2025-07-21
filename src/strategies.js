import { initializeTables, scrollToSelector } from "./helpers.js";
import { setupScrollSpy } from "./helpers.js";
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
		this.scrollParent = $(containerNode);
		const sectionContainer = this.scrollParent.find(
			"#strategies-impediment-container"
		)[0];
		initializeTables(subSections, sectionContainer);

		// Setup shared scroll spy helper; account for top-nav height
		const navHeight = $(".top-nav").outerHeight() || 0;
		setupScrollSpy({
			scrollParent: this.scrollParent,
			tocSelector: "#strategies-toc",
			contentContainerSelector: ".strategies-text",
			linkPrefix: "strategies",
			extraOffset: navHeight * 2
		});

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
