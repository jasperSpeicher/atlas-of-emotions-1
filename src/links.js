import ContinentsSection from "./continents";
import dispatcher from "./dispatcher";
import d3 from "d3";

class LinksSection {
	init(containerNode, screenIsSmall) {
		const scrollParent = $("#strategies-section .scroll-parent");
		$("[data-scroll-to]").on("click", (e) => {
			console.log(e.target);
			const link = $(e.target);
			const selector = link.data("scroll-to");
			const destination = $(selector);
			scrollParent.animate({ scrollTop: destination[0].offsetTop - 80 });
		});
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

const linksSection = new LinksSection();
export default linksSection;
