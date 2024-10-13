class StrategiesSection {
	init(containerNode, screenIsSmall) {
		const scrollParent = $("#strategies-fp-section .scroll-parent");
		$("[data-scroll-to]").on("click", (e) => {
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

const strategiesSection = new StrategiesSection();
export default strategiesSection;
