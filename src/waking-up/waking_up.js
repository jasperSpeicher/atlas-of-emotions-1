import {
	createImmersiveScrollDOM,
	initImmersiveScrollAnimations,
} from "./ImmersiveScroll";

class WakingUpSection {
	isInited = false;

	init(containerNode, screenIsSmall) {
		if (this.isInited) {
			return;
		}
		const container = createImmersiveScrollDOM();
		containerNode.appendChild(container);
		initImmersiveScrollAnimations();

		this.isInited = true;
	}

	open() {
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
