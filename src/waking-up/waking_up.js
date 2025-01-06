import {
	createImmersiveScrollDOM,
	initImmersiveScrollAnimations,
} from "./ImmersiveScroll";

class WakingUpSection {
	isInited = false;
	scrollParent;

	init(containerNode, screenIsSmall) {
		if (this.isInited) {
			return;
		}
		const scrollContent = createImmersiveScrollDOM();
		this.scrollParent = containerNode;
		this.scrollParent.appendChild(scrollContent);
		initImmersiveScrollAnimations();

		this.isInited = true;
	}

	open() {
		$(this.scrollParent)[0].scrollTop = 0;
		return Promise.resolve();
	}
	close() {
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
