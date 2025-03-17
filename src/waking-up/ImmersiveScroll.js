import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import { scrollerSections } from "./scrollerSections.js";
import {
	getDecenteringTweenVariables,
	getEmotionColor,
	getPhraseId,
	getSectionId,
} from "./scrollerDataHelpers.js";
import { configureTweens, getTweenComponentSelector } from "./tweenHelpers.js";
import { sharedStyle } from "./config.js";

/**
 * Main entry point to create and initialize the ImmersiveScroll structure.
 * Example usage:
 *
 *   const container = createImmersiveScrollDOM();
 *   document.body.appendChild(container);
 *   initImmersiveScrollAnimations();
 */

/**
 * Creates the DOM elements for the ImmersiveScroll structure.
 * Returns the top-level container so we can append it to the app.
 */
export function createImmersiveScrollDOM() {
	// Main container
	const pageContainer = document.createElement("div");
	pageContainer.className = sharedStyle.pageContainer;

	// Three star layers for parallax
	const stars1 = document.createElement("div");
	stars1.className = sharedStyle.stars;
	stars1.id = "waking-up__stars-1";

	const stars2 = document.createElement("div");
	stars2.className = sharedStyle.stars;
	stars2.id = "waking-up__stars-2";

	const stars3 = document.createElement("div");
	stars3.className = sharedStyle.stars;
	stars3.id = "waking-up__stars-3";

	// Add star layers to main container
	pageContainer.appendChild(stars1);
	pageContainer.appendChild(stars2);
	pageContainer.appendChild(stars3);

	// Emotion overlay container
	const emotionContainer = document.createElement("div");
	emotionContainer.className = sharedStyle.emotionContainer;

	const emotionColorField = document.createElement("div");
	emotionColorField.className = `${sharedStyle.emotionColorField} orb-container`;
	emotionColorField.innerHTML = `
	<div class="orb">
		<div class="highlight"></div>
	</div>
	<div class="inner-orb"></div>
	<div class="inner-orb"></div>
	<div class="inner-orb"></div>
	<!--<div class="text">you feel<br/>ANGER</div>-->
`;
	emotionColorField.id = "waking-up__emotionColorField";

	pageContainer.appendChild(emotionColorField);

	// Example emotion labels
	const labels = [
		{
			id: "waking-up__emotion-label-fear",
			text: "FEAR",
			extraClass: "waking-up__emotion-label--with-circle",
		},
		{
			id: "waking-up__emotion-label-sadness",
			text: "SADNESS",
			extraClass: "waking-up__emotion-label--with-circle",
		},
		{ id: "waking-up__emotion-label-anger", text: "ANGER" },
		{
			id: "waking-up__emotion-label-disgust",
			text: "DISGUST",
			extraClass: "waking-up__emotion-label--with-circle",
		},
		{
			id: "waking-up__emotion-label-enjoyment",
			text: "ENJOYMENT",
			extraClass: "waking-up__emotion-label--with-circle",
		},
	];

	const emotionContainerInner = document.createElement("div");
	emotionContainer.appendChild(emotionContainerInner);

	labels.forEach((labelData) => {
		const labelDiv = document.createElement("div");
		labelDiv.id = labelData.id;
		labelDiv.className = `waking-up__emotion-label ${
			labelData.extraClass || ""
		}`;
		labelDiv.textContent = labelData.text;
		emotionContainerInner.appendChild(labelDiv);
	});

	pageContainer.appendChild(emotionContainer);

	// Container for scrollable sections
	const immersiveScrollContainer = document.createElement("div");
	immersiveScrollContainer.className = sharedStyle.immersiveScrollContainer;
	pageContainer.appendChild(immersiveScrollContainer);

	// For each section in scrollerSections, create its DOM
	scrollerSections.forEach((section, index) => {
		const sectionEl = createSectionDOM(section, index);
		immersiveScrollContainer.appendChild(sectionEl);
	});

	return pageContainer;
}

/**
 * Sets up the GSAP and ScrollTrigger animations for parallax, sections, etc.
 * This replicates the logic of useEffect/useLayoutEffect in vanilla JS.
 */
export function initImmersiveScrollAnimations() {
	// Parallax stars
	const scrollElement = document.querySelector(
		"#waking_up-fp-section .section-graphics"
	);
	gsap.to("#waking-up__stars-1", {
		scrollTrigger: {
			scroller: "#waking_up-fp-section .section-graphics",
			scrub: 2,
		},
		backgroundPositionY: (_i, target) => {
			return ScrollTrigger.maxScroll(scrollElement) * -0.002;
		},
		ease: "none",
	});
	gsap.to("#waking-up__stars-2", {
		scrollTrigger: {
			scroller: "#waking_up-fp-section .section-graphics",
			scrub: 2,
		},
		backgroundPositionY: (_i, target) => {
			return ScrollTrigger.maxScroll(scrollElement) * -0.015;
		},
		ease: "none",
	});
	gsap.to("#waking-up__stars-3", {
		scrollTrigger: {
			scroller: "#waking_up-fp-section .section-graphics",
			scrub: 2,
		},
		backgroundPositionY: (_i, target) => {
			return ScrollTrigger.maxScroll(scrollElement) * -0.035;
		},
		ease: "none",
	});

	// Configure section & phrase tweens
	scrollerSections.forEach((section, sectionIndex) => {
		const sectionSelector = `#${section.id ?? getSectionId(sectionIndex)}`;
		configureTweens(section, sectionSelector);
		section.experiences?.events?.forEach((phrase, phraseIndex) => {
			const phraseSelector = `#${getPhraseId(sectionIndex, phraseIndex)}`;
			configureTweens(phrase, phraseSelector);
		});
	});

	// init sadness emotionColorField
	gsap.to(getTweenComponentSelector("emotion-color"), {
		color: getEmotionColor("sadness"),
		backgroundColor: getEmotionColor("sadness"),
	});

	// Decentering tween for emotionColorField
	gsap.to(`.${sharedStyle.emotionColorField}`, {
		...getDecenteringTweenVariables(0),
	});

	// Reset scroll on page unload
	window.onbeforeunload = () => {
		window.scrollTo(0, 0);
	};

	// Reload page on resize
	window.addEventListener("resize", () => {
		window.location.reload();
	});

	// This simulates what useLayoutEffect did:
	// After layout is ready (typically on 'load'), set star backgrounds
	window.addEventListener("load", () => {
		const starsElements = document.querySelectorAll(`.stars`);
		if (starsElements.length) {
			starsElements.forEach((elem) => {
				elem.style.height = `${ScrollTrigger.maxScroll(window)}px`;
				elem.style.backgroundPositionX = `${
					1200 + Math.random() * 5500
				}px`;
			});
		}
	});
}

/**
 * A helper function to build the DOM for each scroller section.
 * Mirrors what the <Section> component used to do in React/Preact.
 */
function createSectionDOM(section, index) {
	const sectionId = section.id ?? getSectionId(index);

	// Outer section container
	const sectionDiv = document.createElement("div");
	const combinedClasses = ["waking-up__section"];
	if (section.styleKey) {
		combinedClasses.push(section.styleKey);
	}
	sectionDiv.className = combinedClasses.join(" ");
	sectionDiv.id = sectionId;

	// Section heading/content container
	const headingDiv = document.createElement("div");
	headingDiv.className = "waking-up__sectionHeading";
	headingDiv.style.minHeight = section.height ? section.height : "";

	// The content of the section
	const contentDiv = document.createElement("div");
	contentDiv.innerHTML = section.content;

	headingDiv.appendChild(contentDiv);
	sectionDiv.appendChild(headingDiv);

	// Container for phrases within the section
	const phrasesContainer = document.createElement("div");
	const phrasesClasses = ["waking-up__sectionPhrases"];
	if (section.experiences?.styleKey) {
		phrasesClasses.push(section.experiences.styleKey);
	}
	phrasesContainer.className = phrasesClasses.join(" ");

	// For each event (phrase), create its DOM
	section.experiences?.events?.forEach((phraseElement, phraseIndex) => {
		const phraseId = getPhraseId(index, phraseIndex);
		const phraseDOM = createPhraseDOM(phraseElement, phraseId);
		phrasesContainer.appendChild(phraseDOM);
	});

	sectionDiv.appendChild(phrasesContainer);

	return sectionDiv;
}

/**
 * Builds the DOM for a single phrase. Mirrors what the <Phrase> component did.
 * This will also set up a GSAP timeline on mount (like useEffect did).
 */
function createPhraseDOM(element, phraseId) {
	const phraseDiv = document.createElement("div");
	phraseDiv.className = "waking-up__phrase";
	phraseDiv.id = phraseId;
	const phraseSelector = `#${phraseId}`;

	// lineHeight if available
	if (element.lineHeight) {
		phraseDiv.style.lineHeight = element.lineHeight;
	}

	// The text content of the phrase
	const span = document.createElement("span");
	span.textContent = element.phrase;
	phraseDiv.appendChild(span);

	// Once the DOM is appended, we can set up GSAP.
	setTimeout(() => {
		gsap.timeline({
			scrollTrigger: {
				scroller: "#waking_up-fp-section .section-graphics",
				trigger: phraseSelector,
				start: "top-=100%px center",
				end: "bottom center",
				scrub: 0.5,
				pinType: "fixed",
			},
		})
			.to(phraseSelector, {
				opacity: 1,
				ease: "ease-in-out",
			})
			.to(phraseSelector, {
				opacity: 0,
				ease: "ease-in-out",
			});
	}, 0);

	return phraseDiv;
}
