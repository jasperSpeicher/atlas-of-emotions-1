import ContinentsSection from "./continents";
import dispatcher from "./dispatcher";
import d3 from "d3";

class LinksSection {
	init(containerNode, screenIsSmall) {}

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

const linksSection = new LinksSection();
export default linksSection;
