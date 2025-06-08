import gsap from "gsap";
import { sharedStyle as style } from "./config.js";

/**
 * Determines which DOM selector to target based on the tween component type.
 *
 * @param {string} [tweenComponent] - Type of component to animate (e.g., "section", "phrase", "emotion").
 * @param {string} [parentSelector] - The parent DOM selector (e.g., an element ID).
 * @returns {string} A CSS selector string for the GSAP tween.
 */
export function getTweenComponentSelector(tweenComponent, parentSelector) {
	// Choose which selector to use based on the tween component
	const selector =
		tweenComponent === "section" || tweenComponent === "phrase"
			? `${parentSelector}`
			: tweenComponent === "emotion-color"
			? `.orb-container > div`
			: tweenComponent === "emotion-size"
			? `.${style.emotionColorField}`
			: `${parentSelector} .${style.sectionHeading}`; // default to heading

	// Escape "+" in IDs/selectors if needed
	return selector.replace("+", `\\2b`);
}

/**
 * Merges tween vars with default scroll-trigger settings.
 *
 * @param {string} trigger - The CSS selector or DOM element to use as the scrollTrigger.
 * @param {object} vars - The custom GSAP TweenVars.
 * @returns {object} A new TweenVars object with merged scrollTrigger settings.
 */
export function mergeTweenVars(trigger, vars) {
	return {
		...(vars || {}),
		scrollTrigger: {
			scroller: "#waking_up-fp-section .section-graphics",
			trigger,
			scrub: true,
			...(vars?.scrollTrigger || {}),
			pinType: "fixed",
			// anticipatePin: 1
		},
	};
}

/**
 * Configures and applies tweens (using GSAP) based on a tween configuration object.
 *
 * @param {object} tweenConfig - An object containing tweenType, tweenVars, tweenComponent, etc.
 * @param {string} parentId - The CSS selector or DOM ID for the parent element.
 * @param {function} [onComplete] - Optional callback fired when the tween completes.
 * @param {function} [onStart] - Optional callback fired when the tween starts.
 */
export function configureTweens(tweenConfig, parentId, onComplete, onStart) {
	const { tweenType, tweenVars, tweenComponent, scrollTriggerComponent } =
		tweenConfig;

	// Determine the main "trigger" selector and the element to animate
	const triggerSelector = getTweenComponentSelector(
		scrollTriggerComponent,
		parentId
	);
	const tweenSelector = getTweenComponentSelector(tweenComponent, parentId);

	if (tweenVars) {
		// Ensure we handle both single-object and array forms of tweenVars
		const tweenVarsArray = Array.isArray(tweenVars)
			? tweenVars
			: [tweenVars];

		if (tweenType === "fromTo") {
			// For "fromTo", we expect exactly two tweenVars objects: [from, to]
			if (tweenVarsArray.length !== 2) {
				console.error("Wrong number of tween vars for fromTo");
			}
			const [fromVars, toVars] = tweenVarsArray;
			const { scrollTrigger, ...from } = mergeTweenVars(
				triggerSelector,
				fromVars
			);
			const { scrollTrigger: _, ...to } = mergeTweenVars(
				triggerSelector,
				toVars
			);

			gsap.timeline({ scrollTrigger, onComplete, onStart }).fromTo(
				tweenSelector,
				from,
				{ ...to }
			);
		} else {
			// For other tween types (e.g., .to, .from, etc.), each item in tweenVarsArray applies separately
			tweenVarsArray.forEach((vars) => {
				const { selector, ...restVars } = vars;
				gsap.to(tweenSelector, {
					...mergeTweenVars(selector ?? triggerSelector, restVars),
					onComplete,
					onStart,
				});
			});
		}
	}
}
