import { shuffle } from "lodash";
import { configsByEmotion, emotions, eventsAndResponses } from "./config";

/**
 * Returns a GSAP tween configuration for transitioning the background color
 * from `previousEmotion` to `emotion`.
 *
 * @param {string} emotion - The current emotion name.
 * @param {string} [previousEmotion] - The prior emotion for color transition.
 * @param {boolean} [preventFlicker] - Whether to add a transition to prevent flicker.
 * @param {Function} [onEnter] - Optional callback for onEnter in ScrollTrigger.
 * @param {Function} [onLeaveBack] - Optional callback for onLeaveBack in ScrollTrigger.
 * @returns {Object} A GSAP TweenConfig-like object.
 */
export const getColorTweenConfig = (
	emotion,
	previousEmotion,
	preventFlicker,
	onEnter,
	onLeaveBack
) => ({
	tweenComponent: "emotion",
	scrollTriggerComponent: "phrase",
	tweenType: "fromTo",
	tweenVars: [
		{
			backgroundColor: previousEmotion
				? getEmotionColor(previousEmotion)
				: "rgba(255,255,255,0)",
			scrollTrigger: {
				start: "center center",
				end: "bottom center+=30px",
				pinSpacing: false,
				onEnter,
				onLeaveBack,
			},
		},
		{
			backgroundColor: getEmotionColor(emotion),
			...(preventFlicker
				? { transition: "background-color 333ms 0s ease-in-out" }
				: { clearProps: "transition" }),
		},
	],
});

/**
 * Returns an array of event/response pairs for a specific emotion, optionally filtered
 * by severity.
 *
 * @param {string} emotion - The emotion name (e.g., "anger", "fear").
 * @param {string[]} [severity] - An optional array of severities to filter by.
 * @returns {Array<Object>} A list of pairs related to that emotion.
 */
const getPhrases = (emotion, severity) =>
	eventsAndResponses[emotion]
		.filter((p) => !severity || severity.includes(p.severity))
		.map((pair) => ({ pair, emotion }));

/**
 * Takes an optional emotion and severity filter, fetches all matching events,
 * randomizes them, and returns only the first N (count) items.
 *
 * @param {Object} options - { count, emotion, severity }
 * @param {number} options.count - How many items to return.
 * @param {string} [options.emotion] - An emotion to filter by.
 * @param {string[]} [options.severity] - An optional array of severities.
 * @returns {Array<Object>} Randomized list of phrase configs up to 'count' length.
 */
export const getPhraseConfigs = ({ count, emotion, severity }) => {
	// Collect all matching events (by emotion/severity), shuffle, then slice to count
	const phrases = emotion
		? getPhrases(emotion, severity)
		: emotions.flatMap((e) => getPhrases(e, severity));
	return shuffle(phrases).slice(0, count);
};

/**
 * Maps a list of phrase/emotion pairs into an array suitable for scroller usage.
 * Optionally configures color tween transitions for each phrase.
 *
 * @param {Object} options - { phrasePairs, lineHeight, changeColor, preventFlicker }
 * @param {Array<Object>} options.phrasePairs - An array of { pair, emotion } objects.
 * @param {number} [options.lineHeight] - Optional line-height to apply to each phrase.
 * @param {boolean} [options.changeColor] - Whether to include background color transitions.
 * @param {boolean} [options.preventFlicker] - Whether to add a transition to prevent flicker.
 * @returns {Array<Object>} An array of phrase elements (with optional tween configs).
 */
export const getEventPhrases = ({
	phrasePairs,
	lineHeight,
	changeColor,
	preventFlicker,
}) =>
	phrasePairs.map(({ pair: { event }, emotion }, i, array) => ({
		phrase: event,
		emotion,
		lineHeight,
		...(changeColor
			? getColorTweenConfig(
					emotion,
					i > 0 ? array[i - 1].emotion : undefined,
					i < array.length - 2 && preventFlicker
			  )
			: {}),
	}));

/**
 * Creates an array of phrase objects with a specified lineHeight.
 *
 * @param {string[]} phrases - An array of phrase strings.
 * @param {number} [lineHeight] - A line-height value to apply.
 * @returns {Array<Object>} The array of phrase elements.
 */
export const getPhrasesWithLineHeight = (phrases, lineHeight) =>
	phrases.map((phrase) => ({ phrase, lineHeight }));

/**
 * Returns a common "pin + fade out" tween setup for scroller sections.
 *
 * @returns {Array<Object>} An array of two GSAP tween config objects.
 */
export const getDefaultTweenVars = () => [
	{
		scrollTrigger: {
			pin: true,
			start: "center+=30 center",
			end: "bottom-=20px center",
			pinSpacing: false,
		},
	},
	{
		opacity: 0,
		scrollTrigger: {
			start: "51% center",
			end: "55% center",
			pinSpacing: false,
		},
	},
];

/**
 * Returns the color as an [R,G,B] array for a given emotion, based on config data.
 *
 * @param {string} emotion - The emotion name.
 * @returns {number[]} Array of [R,G,B].
 */
export const getEmotionColorComponents = (emotion) => {
	return configsByEmotion[emotion].colorPalette[0];
};

/**
 * Converts an emotion to an `rgb(r,g,b)` string using the first color in the emotion's palette.
 *
 * @param {string} emotion - The emotion name.
 * @returns {string} CSS-compatible rgb() string.
 */
export const getEmotionColor = (emotion) => {
	const [r, g, b] = getEmotionColorComponents(emotion);
	return `rgb(${r},${g},${b})`;
};

/**
 * Returns the same RGB components as getEmotionColor but with zero alpha, i.e. `rgba(r,g,b,0)`.
 *
 * @param {string} emotion - The emotion name.
 * @returns {string} CSS-compatible rgba() string with alpha=0.
 */
export const getColorWithTransparency = (emotion) => {
	const [r, g, b] = getEmotionColorComponents(emotion);
	return `rgba(${r},${g},${b},0)`;
};

/**
 * Returns a section ID string (e.g., "section-3") given its index.
 *
 * @param {number} index - The section index.
 * @returns {string} A unique section ID.
 */
export const getSectionId = (index) => `waking-up__section-${index}`;

/**
 * Returns a phrase ID string (e.g., "phrase0-2") combining a section index and phrase index.
 *
 * @param {number} sectionIndex - The index of the section.
 * @param {number} phraseIndex - The index of the phrase in that section.
 * @returns {string} A unique phrase ID.
 */
export const getPhraseId = (sectionIndex, phraseIndex) =>
	`waking-up__phrase${sectionIndex}-${phraseIndex}`;

/**
 * Calculates certain "decentering" styles for an element, based on a percentage
 * from 0 (max blur, large size) to 100 (minimal blur, smaller size).
 *
 * @param {number} percentageRaw - A number from 0 to 100 (clamped if out of range).
 * @returns {Object} An object with `width`, `height`, and `filter: blur(...)`.
 */
export const getDecenteringTweenVariables = (percentageRaw) => {
	const percentage = Math.min(Math.max(percentageRaw, 0), 100);
	const endDiameter = 12;
	const startDiameter = 200;
	const diameter =
		((100 - percentage) / 100) * (startDiameter - endDiameter) +
		endDiameter;
	const endBlur = 10;
	const startBlur = 100;
	const blur = ((100 - percentage) / 100) * (startBlur - endBlur) + endBlur;
	const unit = window.innerHeight > window.innerWidth ? "vh" : "vw";
	return {
		width: `${diameter}${unit}`,
		height: `${diameter}${unit}`,
		filter: `blur(${blur}px)`,
	};
};
