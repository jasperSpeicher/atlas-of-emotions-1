import {
	createImmersiveScrollDOM,
	initImmersiveScrollAnimations,
} from "./ImmersiveScroll";
import { createScrollerSections } from "./scrollerSections.js";

class WakingUpSection {
	isInited = false;
	scrollParent;

	init(containerNode, screenIsSmall) {
		if (this.isInited) {
			return;
		}
		const scrollerSections = createScrollerSections();
		const scrollContent = createImmersiveScrollDOM(scrollerSections);
		this.scrollParent = containerNode;
		this.scrollParent.appendChild(scrollContent);
		initImmersiveScrollAnimations(scrollerSections);

		this.isInited = true;
	}

	open() {
		$(this.scrollParent)[0].scrollTop = 0;
		// $("#waking-up__emotionColorField").css(
		// 	"background-color",
		// 	"rgba(255, 255, 255, 0)"
		// );
		// $("#waking-up__emotionColorField").css(
		// 	"opacity",
		// 	"0"
		// )
		$(".waking-up__emotion-label").css("opacity", 0);
		return Promise.resolve();
	}
	close() {
		// $("#waking-up__emotionColorField").css(
		// 	"background-color",
		// 	"rgba(255, 255, 255, 0)"
		// );
		// $("#waking-up__emotionColorField").css(
		// 	"opacity",
		// 	"0"
		// )
		$(".waking-up__emotion-label").css("opacity", 0);
		return Promise.resolve();
	}
	setEmotion() {
		return Promise.resolve();
	}
	setBackgrounded() {}
	onResize() {}
}

const wakingUpSection = new WakingUpSection();
export default wakingUpSection;
