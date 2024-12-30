import { gsap } from "gsap";
import dispatcher from "./dispatcher";
import timeline from "./timeline/timeline";
import sassVars from "../scss/variables.json";
import d3 from "d3";

const scroller = {
	SLIDE_INTERVAL_DELAY: 7000,
	ABOUT_IMAGE_INTERVAL_DELAY: 7,

	ATLAS_TO_FULLPAGE_SECTIONS: {
		introduction: "introduction-fp",
		calm: "introduction-fp",
		actions: "response-fp",
		continents: "experience-fp",
		states: "experience-fp",
		triggers: "timeline-fp",
		strategies: "strategies-fp",
		learn_more: "learn_more-fp",
		waking_up: "waking_up-fp",
	},

	FULLPAGE_TO_ATLAS_SECTIONS: {
		"introduction-fp": "introduction",
		"waking_up-fp": "waking_up",
		"timeline-fp": "triggers",
		"experience-fp": "continents",
		"response-fp": "actions",
		"strategies-fp": "strategies",
		"learn_more-fp": "learn_more",
	},

	headerHeight: 55,
	selectedEmotionState: "",

	slideInterval: null,
	$slides: null,
	slideCount: 0,
	activeSlideIndex: 0,

	introTimeline: null,
	$sections: null,
	sectionTextAnimators: null,
	$topNav: null,
	$topNavLinks: null,
	$hiddenForIntro: null,
	anchors: [],
	currentAnchor: "introduction",
	fadeImages: false,
	screenIsSmall: false,

	hasEmotionState: function (anchor) {
		let section = $("#" + anchor + "-section");
		return section.attr("data-has-emotion-state");
	},

	getFullpageSectionId(section) {
		return "#" + this.ATLAS_TO_FULLPAGE_SECTIONS[section] + "-section";
	},

	getFullpageAnchorLink(sectionId) {
		return sectionId.match(/(.+)-section/)[1];
	},

	advanceSlide: function () {
		if (!this.$slides) {
			return;
		}
		const activeSlide = this.$slides[this.activeSlideIndex];
		const nextSlideIndex = (this.activeSlideIndex + 1) % this.slideCount;
		const nextSlide = this.$slides[nextSlideIndex];
		$(activeSlide).removeClass("active");
		$(nextSlide).addClass("active");
		this.activeSlideIndex = nextSlideIndex;
	},

	initSlideInterval: function () {
		if (this.slideInterval) {
			clearInterval(this.slideInterval);
		}
		// init the slides
		this.$slides = $(".slide");
		this.slideCount = this.$slides.length;
		this.activeSlideIndex = [...this.$slides].findIndex((s) =>
			$(s).hasClass("active")
		);
		this.slideInterval = setInterval(() => {
			this.advanceSlide();
		}, this.SLIDE_INTERVAL_DELAY);
	},

	toggleEmotionNav: function (visible) {
		$(".emotion-nav").toggleClass("visible", visible);
	},

	pulseEmotionNav: function () {
		//TODO should this have an event in the dispatcher?
		let $links = $(".emotion-nav li");
		let pulseTimeline = new gsap.timeline();
		pulseTimeline
			.add("start")
			.staggerTo($links, 0.1, { css: { transform: "scale(1.123)" } }, 0.1)
			.staggerTo(
				$links,
				0.1,
				{ css: { transform: "scale(1)" } },
				0.1,
				"start+=0.2"
			);
	},

	resetEmotionNav: function () {
		let $links = $(".emotion-nav li");
		$links.removeAttr("style");
	},

	initEmotionNav: function () {
		let links = [].slice.call($('.emotion-nav a[href!="#continents"]'));
		for (let element of links) {
			element.addEventListener("click", (e) => {
				e.preventDefault();
				let emotion = e.currentTarget.getAttribute("data-emotion");
				dispatcher.setEmotion(emotion);
			});
		}
	},

	currentSection: null,

	moveTo: function (section, emotion) {
		const nextIndex =
			Object.keys(this.FULLPAGE_TO_ATLAS_SECTIONS).indexOf(section) + 1;
		if (this.currentSection) {
			this.onSectionLeave(undefined, nextIndex);
		}
		this.getLoadedSection(this.currentSection).removeClass("active");
		this.getLoadedSection(section).addClass("active");
		if (section !== this.currentSection) {
			$(".page-body").css(
				"transform",
				`translateY(${-(nextIndex - 1) * 100}vh)`
			);
			$("body").removeClass(`viewing-${this.currentSection}`);
			this.currentSection = section;
			$("body").addClass(`viewing-${section}`);
		}
	},

	hashChange: function (section, emotion) {
		if (section && section.match(/(states)|(actions)|(triggers)/) != null) {
			let state =
				section.match(/(triggers)/) != null
					? timeline.emotionNavVisible
					: true;
			this.toggleEmotionNav(state);
		} else {
			this.toggleEmotionNav(false);
		}

		//update scroller
		this.moveTo(
			section
				? this.ATLAS_TO_FULLPAGE_SECTIONS[section]
				: "introduction-fp",
			emotion ? emotion : null
		);

		//update emotion nav active states
		let links = [].slice.call($('.emotion-nav a[href!="#continents"]'));
		for (let element of links) {
			let emoAttr = element.getAttribute("data-emotion");
			d3.select(element).classed("active", emoAttr == emotion);
		}
	},

	getLoadedSection: function (anchorLink) {
		return $("#" + anchorLink + "-section");
	},

	onSectionLeave: function (index, nextIndex, direction) {
		let nextAnchorLink = this.anchors[nextIndex - 1]; // index is 1 based?
		let loadedSection = this.getLoadedSection(nextAnchorLink);
		let sectionId =
			loadedSection && loadedSection[0] && loadedSection[0].id;

		if (this.screenIsSmall) {
			this.minimizeSectionText();
		}

		//hide the about text if leaving the intro
		if (sectionId == "introduction-section") {
			this.toggleAboutSection(false);
		}
	},

	afterSectionLoad: function (anchorLink) {
		let _self = this; //callback must be bound to the scroller class
		let loadedSection = this.getLoadedSection(anchorLink);
		let sectionId = loadedSection[0].id;

		this.currentAnchor = anchorLink;

		dispatcher.sectionGraphicsResize();

		if (sectionId == "introduction-fp-section" && !this.introTimeline) {
			//init animations for intro section
			let $intro = $("#introduction-fp-section");
			let $introSlides = $intro.find(".slides");
			let $introCta = $intro.find(".cta");

			this.introTimeline = new gsap.timeline();
			this.introTimeline
				.add("start")
				.fromTo(
					$intro.find(".intro-heading"),
					{
						autoAlpha: 0,
						ease: "power1.out",
					},
					{
						autoAlpha: 1,
						duration: 1,
					}
				)
				.fromTo(
					$introSlides,
					{
						autoAlpha: 0,
						ease: "power1.out",
					},
					{
						autoAlpha: 1,
						duration: 1,
					}
				)
				.fromTo(
					$introCta,
					{
						autoAlpha: 0,
						ease: "power1.out",
					},
					{
						autoAlpha: 1,
						duration: 1,
					}
				)
				.call(function () {
					_self.initSlideInterval();
				})
				.add("end");

			//make slide interface clickable right away
			$(".slide-content").click(function (e) {
				_self.advanceSlide();
				_self.initSlideInterval();
			});
		}
		//using anchorLink
		if (anchorLink == "introduction-fp") {
			this.$hiddenForIntro.removeClass("visible");
			this.introTimeline.play();
		} else {
			this.$hiddenForIntro.addClass("visible");
			if (this.introTimeline) {
				this.introTimeline.pause();
				this.introTimeline.seek("start");
			}
		}

		//update topnav
		this.$topNavLinks.each((index, element) => {
			let $element = $(element);
			let id = $element.attr("id");
			if (id.indexOf(anchorLink) >= 0) {
				$element.addClass("active");
			} else {
				$element.removeClass("active");
			}
			if (this.screenIsSmall) {
				this.$topNav.removeClass("open");
			}
		});

		if (this.screenIsSmall && anchorLink == "response-fp") {
			setTimeout(() => {
				this.resizeActions();
			}, sassVars.states.backgrounded.duration.in * 1000);
		}
	},

	sectionGraphicsResize(anchorLink) {
		dispatcher.sectionGraphicsResize();
		if (this.screenIsSmall && anchorLink == "response-fp") {
			this.resizeActions();
		}
	},

	resizeActions() {
		if (this.screenIsSmall) {
			let rect = $(
				"#states .graph-container.active svg>g"
			)[0].getBoundingClientRect();
			$("#actions .actions-container .graph-container").css({
				top:
					rect.bottom -
					sassVars.ui.header["mobile-nav"].target.height +
					"px",
				visibility: "visible",
			});
		}
	},

	toggleAboutSection: function (visibility) {
		let $hero = $(".introduction-hero");
		let body = $("body");
		if (visibility != null) {
			$hero.toggleClass("more-visible", visibility);
			body.toggleClass("more-visible", visibility);
		} else {
			$hero.toggleClass("more-visible");
			body.toggleClass("more-visible");
		}
		if ($hero.hasClass("more-visible")) {
			this.fadeAboutImage(0);
		} else {
			this.stopAboutImageFades();
		}
	},

	initAboutLink: function () {
		// add click for about the atlas, in the intro
		$(".about-link").click((e) => {
			e.preventDefault();
			this.toggleAboutSection();
		});
	},

	initOptInModal: function () {
		$(".opt-in-modal__content .close-button").click((e) => {
			e.preventDefault();
			this.toggleOptInModal();
		});
		$(".opt-in-button").click((e) => {
			e.preventDefault();
			this.toggleOptInModal();
		});
		$(".opt-in-modal").css("display", "none");
	},

	toggleOptInModal: function () {
		$(".opt-in-modal").fadeToggle(400);
	},

	stopAboutImageFades() {
		this.fadeImages = false;
		this.fadeTweens.forEach((tween) => tween.kill());
	},

	fadeAboutImage: function (i) {
		let nextIndex = (i + 1) % this.aboutImages.length;
		if (!this.fadeImages) {
			gsap.set(this.aboutImages[i], { autoAlpha: 1 });
			gsap.set(this.aboutImages[nextIndex], { autoAlpha: 0 });
		}
		this.fadeImages = true;
		this.fadeTweens[0] = gsap.delayedCall(
			this.ABOUT_IMAGE_INTERVAL_DELAY,
			() => {
				this.fadeTweens[1] = gsap.fromTo(
					this.aboutImages[i],
					this.ABOUT_IMAGE_INTERVAL_DELAY / 2,
					{ autoAlpha: 1 },
					{ autoAlpha: 0 }
				);
				this.fadeTweens[2] = gsap.fromTo(
					this.aboutImages[nextIndex],
					this.ABOUT_IMAGE_INTERVAL_DELAY / 2,
					{ autoAlpha: 0 },
					{ autoAlpha: 1 }
				);
				this.fadeAboutImage(nextIndex);
			}
		);
	},

	initImageFades: function () {
		this.aboutImages = [].slice.call($("img.fade"));
		this.fadeTweens = [];
	},

	initFullpageSections: function () {
		this.$sections = $(".section");

		this.sectionTextAnimators = {};

		this.anchors = this.$sections
			.map(function () {
				return this.id.split("-section")[0]; //'this' refers to element scope
			})
			.get();

		let normalScrollElements = ".section-text";
		if (this.screenIsSmall) {
			normalScrollElements += ", .episode-parent";
		}

		let addMobileTextTouchEffects = ($element) => {
			let parent = $element.parents(".section")[0];
			let swipeStart = { x: 0, y: 0 };
			let height = 0;
			let thresh = 20;
			let minimumDistance = null;
			let maximumDistance = 0;
			let transitionDuration = 0.5;
			let sectionTextMaximized = false;
			let sectionTextMaximizing = false;
			let sectionTextMinimizing = false;
			let $sectionText = null;
			let $sectionGraphics = null;
			let $sectionTextContent = null;
			let $originalContent = $(".original-content");
			let $emotionNav = $(".emotion-nav");
			let id = parent.id;
			let anchorLink = this.getFullpageAnchorLink(id);
			let animator = new SectionTextAnimator();

			this.sectionTextAnimators[id] = animator;

			let onTapSectionGraphics = (e) => {
				if (sectionTextMaximized) {
					// minimize section text
					timeline.scrollToCoordinates(e.pageX, e.pageY);
					minimizeSectionText();
					e.preventDefault();
					e.stopPropagation();
				}
			};

			$(parent)
				.find(".section-graphics")
				.on("click", onTapSectionGraphics);

			let minimizeSectionText = () => {
				let minimized = !sectionTextMaximized && !sectionTextMaximizing;
				if (minimized) {
					dispatcher.sectionTextMinimizeComplete();
				}
				if (minimized || sectionTextMinimizing) {
					return;
				}
				sectionTextMinimizing = true;
				$sectionTextContent[0].scrollTop = 0;
				$sectionTextContent[0].style.overflowY = "hidden";
				$sectionTextContent.off("scroll");
				gsap.to([$sectionText[0], $emotionNav[0]], transitionDuration, {
					top: minimumDistance,
					onUpdate: () => {
						this.sectionGraphicsResize(anchorLink);
					},
					onComplete: () => {
						sectionTextMaximized = false;
						sectionTextMinimizing = false;
						this.sectionGraphicsResize(anchorLink);
						dispatcher.sectionTextMinimizeComplete();
					},
				});
				const emotionNavHeight =
					this.currentAnchor === "strategies"
						? 0
						: sassVars["ui"]["mobile-emotion-nav"]["height"];
				gsap.to(
					[$originalContent[0], $sectionGraphics[0]],
					transitionDuration,
					{
						height:
							minimumDistance -
							emotionNavHeight -
							$sectionGraphics[0].offsetTop,
					}
				);
				dispatcher.sectionTextMinimizeStart(transitionDuration);
			};

			animator.minimizeSectionText = minimizeSectionText;

			let maximizeSectionText = () => {
				// avoid breaking an existing maximization
				// or maximizing when already maximized
				if (
					(sectionTextMaximized && !sectionTextMinimizing) ||
					sectionTextMaximizing
				) {
					dispatcher.sectionTextMaximizeComplete();
					return;
				}
				// not needed if content is no larger than scroll area when minimized
				if (
					$sectionTextContent[0].scrollHeight <=
					$sectionTextContent[0].clientHeight
				) {
					dispatcher.sectionTextMaximizeComplete();
					return;
				}
				sectionTextMaximizing = true;
				gsap.to([$sectionText[0], $emotionNav[0]], transitionDuration, {
					top: maximumDistance,
					onUpdate: () => {
						this.sectionGraphicsResize(anchorLink);
					},
					onComplete: () => {
						sectionTextMaximized = true;
						sectionTextMaximizing = false;
						$sectionTextContent[0].style.overflowY = "scroll";
						$sectionTextContent.on("scroll", (e) => {
							if ($sectionTextContent[0].scrollTop < 0) {
								minimizeSectionText();
								$sectionTextContent.off("scroll");
							}
						});
						this.sectionGraphicsResize(anchorLink);
						dispatcher.sectionTextMaximizeComplete();
					},
				});
				const emotionNavHeight =
					this.currentAnchor === "strategies"
						? 0
						: sassVars["ui"]["mobile-emotion-nav"]["height"];
				gsap.to(
					[$originalContent[0], $sectionGraphics[0]],
					transitionDuration,
					{
						height:
							maximumDistance -
							emotionNavHeight -
							$sectionGraphics[0].offsetTop,
					}
				);
				dispatcher.sectionTextMaximizeStart(transitionDuration);
			};

			animator.maximizeSectionText = maximizeSectionText;

			$element.on("touchstart", (e) => {
				$sectionText = $(".section.active .section-text");
				$sectionGraphics = $(".section.active .section-graphics");
				$sectionTextContent = $(
					".section.active .section-text__scroller"
				);
				if (!minimumDistance) {
					minimumDistance = $sectionText[0].offsetTop;
				}
				height = $(".section.active").height();
				maximumDistance = 0.33 * height;
				thresh = 0;
				swipeStart.y = e.originalEvent.touches[0].pageY;
				swipeStart.x = e.originalEvent.touches[0].pageX;
			});
			$element.on("touchend", (e) => {});
			$element.on("touchmove", (e) => {
				let newYDistance =
					swipeStart.y - e.originalEvent.touches[0].pageY;
				let newXDistance =
					swipeStart.x - e.originalEvent.touches[0].pageX;
				if (
					Math.abs(newXDistance) > Math.abs(newYDistance) ||
					Math.abs(newYDistance) < thresh
				) {
					return;
				}
				if (sectionTextMaximized) {
					if (
						$sectionTextContent[0].scrollTop <= 0 &&
						newYDistance < 0 &&
						!sectionTextMinimizing
					) {
						swipeStart.y = e.originalEvent.touches[0].pageY;
						minimizeSectionText();
					}
				} else {
					if (newYDistance > 0 && !sectionTextMaximizing) {
						swipeStart.y = e.originalEvent.touches[0].pageY;
						maximizeSectionText();
					}
				}
			});
		};

		let addMobileTimelineGraphicsTouchEffects = () => {
			let $sectionGraphics = $("#timeline-fp-section .section-graphics");
			$sectionGraphics.on("touchmove", timeline.touchmove.bind(timeline));
			$sectionGraphics.on(
				"touchstart",
				timeline.touchstart.bind(timeline)
			);
			$sectionGraphics.on("touchend", timeline.touchend.bind(timeline));
		};

		let addMobileGraphicsTouchEffects = () => {
			// todo fix this
			//dispatcher.on( dispatcher.EVENTS.CHANGE_EMOTION_STATE, this.minimizeSectionText.bind( this ) );
		};

		if (this.screenIsSmall) {
			$(".section-text").each((e, element) => {
				if ($(element).parents("#learn_more-fp-section").length > 0) {
					return;
				}
				addMobileTextTouchEffects($(element));
			});
			addMobileGraphicsTouchEffects();
			addMobileTimelineGraphicsTouchEffects();
		}
	},

	maximizeSectionText: function () {
		this.sectionTextAnimators[
			this.currentAnchor + "-section"
		].maximizeSectionText();
	},

	minimizeSectionText: function () {
		if (
			this.sectionTextAnimators &&
			this.currentAnchor &&
			this.sectionTextAnimators[this.currentAnchor + "-section"]
		) {
			this.sectionTextAnimators[
				this.currentAnchor + "-section"
			].minimizeSectionText();
		}
	},

	initTopNav: function () {
		this.$topNav = $(".top-nav");
		this.$topNavLinks = this.$topNav.find("#menu-list>li>a");
		this.$hiddenForIntro = $(".hidden-for-intro");
		if (this.screenIsSmall) {
			this.$topNavLinks.click(() => {
				this.$topNav.removeClass("open");
			});
			$(".menu-toggle").click(() => {
				this.$topNav.toggleClass("open");
			});
		}
	},

	showApp() {
		$("#app-container").addClass("visible");
	},

	initIntroAboutBackButton() {
		$(".close-button").click(function (e) {
			e.preventDefault();
			let $section = $(this).parents(".section");
			$section.toggleClass("more-visible");
			$("body").toggleClass("more-visible");
		});
	},

	init: function (screenIsSmall) {
		this.screenIsSmall = screenIsSmall;

		this.initTopNav();
		this.initEmotionNav();
		this.initFullpageSections();
		this.initImageFades();

		this.initAboutLink();
		this.initOptInModal();
		this.initIntroAboutBackButton();
		this.showApp();
	},
};

class SectionTextAnimator {
	constructor() {}
}

export default scroller;
