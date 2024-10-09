//TODO this file contains a bunch of low level stuff that probably belongs elsewhere or is in d3 etc
//TODO should regular and add-awareness versions be running at the same time?
import { ScrollToPlugin } from "gsap/all";
import { gsap } from "gsap";

import Episode from "./Episode.js";
import EpisodeAddAwareness from "./EpisodeAddAwareness.js";
import dispatcher from "../dispatcher";
import scroller from "../scroller";
import appStrings from "../appStrings.js";
import episodeSvg from "./episode.svg";
import episodeAddAwarenessSvg from "./episode--add-awareness.svg";

gsap.registerPlugin(ScrollToPlugin);

const timeline = {
	isInited: false,
	isActive: false,
	emotionNavVisible: true,
	screenIsSmall: false,
	displayingIntro: false,
	currentEmotion: null,
	episode: null,
	episodeAddAwareness: null,
	activeEpisode: null,
	sectionContainer: null,
	beginAwarenessButton: null,
	sectionTextBodyIntro: null,
	sectionTextBodyAwareness: null,
	swipeDistanceThreshold: 100,
	episodeContent: {},

	touchmove: function (e) {
		let currentSwipe = e.originalEvent.touches[0].pageX - this.swipeStart;
		this.activeEpisode && this.activeEpisode.touchDeflect(currentSwipe);
	},

	touchstart: function (e) {
		this.swipeStart = e.originalEvent.touches[0].pageX;
		this.activeEpisode && this.activeEpisode.beginTouchDeflection();
	},

	touchend: function (e) {
		let currentSwipe =
			e.originalEvent.changedTouches[0].pageX - this.swipeStart;
		if (Math.abs(currentSwipe) > this.swipeDistanceThreshold) {
			let swipeDirection = currentSwipe > 0 ? 1 : -1;
			this.activeEpisode &&
				this.activeEpisode.scrollSvgInDirection(swipeDirection);
		} else {
			this.activeEpisode && this.activeEpisode.returnTouchDeflection();
		}
	},

	onSectionTextMaximizeStart(duration) {
		this.activeEpisode && this.activeEpisode.minimizeStart(duration);
	},

	onSectionTextMaximizeComplete() {
		this.activeEpisode && this.activeEpisode.minimizeComplete();
	},

	onSectionTextMinimizeStart(duration) {
		this.activeEpisode && this.activeEpisode.maximizeStart(duration);
	},

	onSectionTextMinimizeComplete() {
		this.activeEpisode && this.activeEpisode.maximizeComplete();
	},

	toggleEmotionNav(state) {
		scroller.toggleEmotionNav(state);
		this.emotionNavVisible = state;
	},

	allowMoreContent() {
		dispatcher.allowMoreContent(true, dispatcher.SECTIONS.TIMELINE);
	},

	//work around safari missing children property in svg nodes
	getChildren: function (element) {
		let svgChildren = element.children || element.childNodes;
		let children = [];
		for (let i = 0; i < svgChildren.length; i++) {
			if (
				svgChildren[i].nodeType == Node.TEXT_NODE ||
				svgChildren[i].nodeType == Node.COMMENT_NODE
			)
				continue;
			children.push(svgChildren[i]);
		}
		return children;
	},

	addFonts: function (svg) {
		let fontCss =
				"@import url('https://fonts.googleapis.com/css?family=Raleway');",
			style = document.createElement("style");

		style.type = "text/css";

		if (style.styleSheet) {
			style.styleSheet.cssText = fontCss;
		} else {
			style.appendChild(document.createTextNode(fontCss));
		}

		svg.getElementsByTagName("defs")[0].appendChild(style);
	},

	select: function (selector, parent) {
		return parent.querySelector(selector);
	},

	selectAll: function (selector, parent) {
		return parent.querySelectorAll(selector);
	},

	remove(element) {
		if (element.parentNode) {
			element.parentNode.removeChild(element);
		}
	},

	addClass(element, newClass) {
		let className = element.getAttribute("class");
		if (className == null) {
			className = "";
		}
		if (className.indexOf(newClass) == -1) {
			element.setAttribute("class", className + " " + newClass);
		}
	},

	removeClass(element, oldClass) {
		let className = element.getAttribute("class");
		if (className == null) {
			className = "";
		}
		className = (" " + className + " ")
			.replace(" " + oldClass + " ", " ")
			.trim();
		element.setAttribute("class", className);
	},

	scrollToCoordinates: function (x, y) {
		this.activeEpisode.scrollToCoordinates(x, y);
	},

	loadEpisode: function () {
		// no awareness version
		const svg = $.parseHTML(episodeSvg)[2];
		this.episode = new Episode(
			svg,
			this.sectionContainer,
			this.currentEmotion,
			this.screenIsSmall
		);
		this.activeEpisode = this.episode;
		if (this.isActive) {
			this.episode.setEmotion(this.currentEmotion);
		}
	},

	loadEpisodeAddAwareness: function () {
		// awareness version
		const svg = $.parseHTML(episodeAddAwarenessSvg)[2];
		this.episodeAddAwareness = new EpisodeAddAwareness(
			svg,
			this.sectionContainer,
			this.currentEmotion,
			this.screenIsSmall
		);
		this.activeEpisode = this.episodeAddAwareness;
		this.episodeAddAwareness.maximized = this.episode.maximized;
		this.episodeAddAwareness.minimizing = this.episode.minimizing;
		this.episodeAddAwareness.setInteractive(this.episode.getInteractive());
		if (this.isActive) {
			this.episodeAddAwareness.setEmotion(this.currentEmotion);
		}
		this.episode.destroy();
		this.episode = null;
	},

	showAwarenessEpisode: function () {
		gsap.to(this.sectionContainer, 1, {
			autoAlpha: 0,
			onComplete: () => {
				this.remove(this.episode.getParentElement());
				this.episode.setActive(false);
				this.loadEpisodeAddAwareness();
				gsap.set(this.sectionContainer, {
					autoAlpha: 1,
				});
			},
		});
	},

	getVisibleParagraphs: function (stage) {
		return this.sectionTextBodyAwareness.filter(
			(e) => e.getAttribute("data-stage") == stage
		);
	},

	getVisibleButtons: function (stage) {
		return document.querySelectorAll(
			"button.body-awareness[data-stage=" + stage + "]"
		);
	},

	getHiddenButtons: function (stage) {
		let visible = [].slice.call(this.getVisibleButtons(stage));
		return [].slice
			.call(document.querySelectorAll("button.body-awareness"))
			.filter((e) => {
				return visible.indexOf(e) == -1;
			});
	},

	advanceAwarenessStage: function (stage) {
		if (this.screenIsSmall) {
			dispatcher.minimizeSectionText();
		}
		this.showAwarenessCopy(stage);
	},

	showAwarenessCopy: function (stage) {
		let showCopy = this.getVisibleParagraphs(stage);
		let showButtons = this.getVisibleButtons(stage);
		let hideButtons = this.getHiddenButtons(stage);
		let stages = [].slice.call(
			document.querySelectorAll("div.body-awareness")
		);
		let openStage = document.querySelector(
			"div.body-awareness[data-stage=" + stage + "]"
		);
		stages.forEach(function (stage) {
			stage.classList.add("closed");
		});
		openStage.classList.remove("closed");

		gsap.set(showButtons, { css: { display: "block" } });
		gsap.set(hideButtons, { css: { display: "none" } });

		gsap.set(showCopy, { css: { display: "block" } });
		gsap.to(showCopy, 1, { autoAlpha: 1 });

		if (this.screenIsSmall) {
			gsap.to(".section-text__scroller", 0.7, {
				scrollTo: openStage.offsetTop,
			});
		}
	},

	hideIntroCopy: function (onComplete) {
		gsap.to(this.sectionTextBodyIntro, 1, {
			autoAlpha: 0,
			onComplete: onComplete,
		});
	},

	showIntroCopy: function (onComplete) {
		gsap.to(this.sectionTextBodyIntro, 1, {
			autoAlpha: 1,
			onComplete: onComplete,
		});
		gsap.set(this.sectionTextBodyIntro, { css: { display: "" } });
	},

	addAwareness: function () {
		let makeAwarenessChanges = () => {
			this.showAwarenessEpisode();
			this.hideIntroCopy(
				function () {
					gsap.set(this.sectionTextBodyIntro, {
						css: { display: "none" },
					});
					this.showAwarenessCopy("trigger");
				}.bind(this)
			);
		};
		if (!this.episodeAddAwareness) {
			if (this.screenIsSmall) {
				dispatcher.once(
					dispatcher.EVENTS.SECTION_TEXT_MINIMIZE_COMPLETE,
					() => {
						makeAwarenessChanges();
					}
				);
				dispatcher.minimizeSectionText();
			} else {
				makeAwarenessChanges();
			}
		}
	},

	hideAwarenessCopy: function () {
		for (let paragraph of this.sectionTextBodyAwareness) {
			gsap.set(paragraph, { autoAlpha: 0 });
		}
	},

	initAddAwarenessCopy: function () {
		//close all and open the clicked on if it was closed
		let stages = [].slice.call(
			document.querySelectorAll("div.body-awareness")
		);
		stages.forEach(function (toggleStage) {
			let header = toggleStage.querySelector("h3");
			header.addEventListener("click", function () {
				stages.forEach(function (closeStage) {
					if (closeStage != toggleStage) {
						closeStage.classList.add("closed");
					}
				});
				toggleStage.classList.toggle("closed");
			});
		});

		this.hideAwarenessCopy();

		this.beginAwarenessButton.onclick = this.addAwareness.bind(this);
	},

	fullRestart: function () {
		let defaultRestart = () => {
			this.episode && this.episode.destroy();
			this.episode = null;
			this.episodeAddAwareness && this.episodeAddAwareness.destroy();
			this.episodeAddAwareness = null;
			this.loadEpisode();
			this.hideAwarenessCopy();
			this.showIntroCopy();
		};

		let minimizeAndRestart = () => {
			dispatcher.once(
				dispatcher.EVENTS.SECTION_TEXT_MINIMIZE_COMPLETE,
				() => {
					console.log("restart now");
					defaultRestart();
				}
			);
			dispatcher.minimizeSectionText();
		};

		let restart = this.screenIsSmall ? minimizeAndRestart : defaultRestart;

		if (this.episodeAddAwareness) {
			this.episodeAddAwareness.hide(restart);
		} else {
			restart();
		}
	},

	initRestartButton: function () {
		$(".restart-button").click(this.fullRestart.bind(this));
	},

	init: function (containerNode, screenIsSmall) {
		this.screenIsSmall = screenIsSmall;

		this.sectionContainer = containerNode;
		this.beginAwarenessButton = document.getElementById("begin-awareness");
		this.sectionTextBodyIntro = Array.prototype.slice.call(
			document.querySelectorAll("#timeline-section .body-intro")
		);
		this.sectionTextBodyAwareness = Array.prototype.slice.call(
			document.querySelectorAll(
				'#timeline-section [class*="body-awareness"]'
			)
		);

		//init strings for current language
		Object.values(dispatcher.EMOTIONS).forEach((emotion) => {
			this.episodeContent[emotion] = appStrings().getStr(
				`emotionsData.emotions.${emotion}.timeline`
			)[0];
		});
		this.episodeContent.common = appStrings().getStr(
			"emotionsData.metadata.timeline.secondary.common"
		);

		this.loadEpisode();

		this.initAddAwarenessCopy();

		this.initRestartButton();

		this.isInited = true;
	},

	setActive: function (val) {
		this.isActive = val;
	},

	setInteractive: function (val) {},

	setEmotion: function (emotion, previousEmotion) {
		let _self = this;

		return new Promise((resolve, reject) => {
			_self.currentEmotion = emotion;
			this.episode && this.episode.setEmotion(_self.currentEmotion);
			this.episodeAddAwareness &&
				this.episodeAddAwareness.setEmotion(_self.currentEmotion);

			resolve();
		});
	},

	onResize: function () {
		this.episode && this.episode.onResize();
		this.episodeAddAwareness && this.episodeAddAwareness.onResize();
	},

	open: function (options) {
		if (this.activeEpisode && this.activeEpisode.replayEnabled) {
			this.activeEpisode.reset();
		}

		this.setActive(true);
		this.setInteractive(true);
	},

	close: function (nextSection) {
		return new Promise((resolve, reject) => {
			if (this.activeEpisode && this.activeEpisode.replayEnabled) {
				this.activeEpisode.reset();
			}

			this.setActive(false);
			this.setInteractive(false);

			resolve();
		});
	},
};

export default timeline;
