class WakingUpSection {
	isInited = false;

	init(containerNode, screenIsSmall) {
		this.isInited = true;
	}

	open() {
		$("#waking_up-iframe")[0].setAttribute(
			"src",
			`http://atlasofemotions.jasperspeicher.codes/immersive-scroll?random=${Math.random()}`
		);
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
