import { initScrollLinks } from "./helpers.js";
class StrategiesSection {
	init(containerNode, screenIsSmall) {
		const scrollParent = $("#strategies-fp-section .scroll-parent");
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
