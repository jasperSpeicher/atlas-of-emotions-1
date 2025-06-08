import _ from "lodash";
import fetch from "isomorphic-fetch";
import dispatcher from "./dispatcher.js";

// maintain state and make globally accessible.
// yeah, a little dirty, but good enough for this use case.
let instance;
let langs = [];
let currentEmotionsData;
let defaultEmotionsData;
let currentSecondaryData;
let defaultSecondaryData;
let strategiesData;
let defaultStrategiesData;

/**
 * Utility for loading strings from the JSON files in the `langs` directory.
 * 
 * Note that strings files per language are loaded at runtime
 * and are not guaranteed to be loaded when a `getStr()` call is made;
 * it's up to the application to call loadStrings() and safely request strings
 * only after the returned Promise is resolved.
 *
 * @param  {[type]} _lang                  Two-character language code (ISO 639-1)
 * @param  {[type]} _screenIsSmall         Request mobile or desktop strings
 */
function appStrings(_lang, _screenIsSmall, _stringsLoadedCallback) {
	let defaultLang = "en",
		derivedStrings;

	function getStr(key) {
		if (!getEmotionsDataObject()) {
			return undefined;
		}

		let path = key.split("."),
			originalSourceKey = path.shift(0);
		
		switch (originalSourceKey) {
			case "derived":
				return _.get(derivedStrings, path.join("."));

			case "secondaryData": {
				const secondaryDataObject = getSecondaryDataObject();
				if (path.length === 0) return secondaryDataObject;
				const value = _.get(secondaryDataObject, path.join("."));
				if (!_.isNil(value)) {
					return value;
				}
				console.error(`Key not found in secondary data: ${key}`);
				return undefined;
			}

			case "strategiesData": {
				const strategiesDataObject = getStrategiesDataObject();
				if (path.length === 0) return strategiesDataObject;
				const value = _.get(strategiesDataObject, path.join("."));
				if (!_.isNil(value)) {
					return value;
				}
				console.error(`Key not found in strategies: ${key}`);
				return undefined;
			}

			default: {
				if (_screenIsSmall) {
					// append '_mobile' to all paths that support it,
					// as implemented in googleSheetsExporter.js
					// and GSE-secondaryPages.js
					let lastPathSegment = path[path.length - 1];
					switch (lastPathSegment) {
						case "header":
						case "body":
						case "name":
						case "desc":
						case "title":
							path[path.length - 1] = lastPathSegment + "_mobile";
					}
				}

				const emotionsDataObject = getEmotionsDataObject();
				const value = _.get(emotionsDataObject, path.join("."));
				if (!_.isNil(value)) {
					return value;
				}
				console.error(`Key not found in emotions data: ${key}`);

				return undefined;
			}
		}
	}

	function getSecondaryDataBlock(page) {
		let withinAnnex = page.substr(0, 6) === "annex-";
		if (withinAnnex) page = page.slice(6);

		// wrap results in an object that each more-page expects
		let out = {
			[page]: getStr(
				`secondaryData${withinAnnex ? ".annex" : ""}.${page}`
			),
		};
		return withinAnnex ? { annex: out } : out;
	}

	function lang(val) {
		return val ? (_lang = val) : _lang;
	}

	function screenIsSmall(val) {
		return val ? (_screenIsSmall = val) : _screenIsSmall;
	}

	function loadStrings() {
		if (currentEmotionsData && currentSecondaryData && strategiesData) {
			return Promise.resolve(instance);
		} else {
			const langPath = "strings/langs";

			const defaultEmotionsDataPromise = fetch(
				`${langPath}/strings.${defaultLang}.json`,
				{
					credentials: "same-origin",
				}
			).then((res) => res.json());

			const currentEmotionsDataPromise = fetch(
				`${langPath}/strings.${_lang}.json`,
				{
					credentials: "same-origin",
				}
			).then((res) => res.json());

			const defaultSecondaryDataPromise = fetch(
				`${langPath}/secondaryData.${defaultLang}.json`,
				{
					credentials: "same-origin",
				}
			).then((res) => res.json());

			const currentSecondaryDataPromise = fetch(
				`${langPath}/secondaryData.${_lang}.json`,
				{
					credentials: "same-origin",
				}
			).then((res) => res.json());

			const defaultStrategiesDataPromise = fetch(
				`${langPath}/strategies.${defaultLang}.json`,
				{
					credentials: "same-origin",
				}
			).then((res) => res.json());

			const currentStrategiesDataPromise = fetch(
				`${langPath}/strategies.${_lang}.json`,
				{
					credentials: "same-origin",
				}
			).then((res) => res.json());

			return Promise.all([
				defaultEmotionsDataPromise,
				currentEmotionsDataPromise,
				defaultSecondaryDataPromise,
				currentSecondaryDataPromise,
				defaultStrategiesDataPromise,
				currentStrategiesDataPromise,
			])
				.then((results) => {
					[
						defaultEmotionsData,
						currentEmotionsData,
						defaultSecondaryData,
						currentSecondaryData,
						defaultStrategiesData,
						strategiesData,
					] = results;
					if (defaultEmotionsData && defaultEmotionsData.slug) {
						delete defaultEmotionsData.slug;
					}
					if (currentEmotionsData && currentEmotionsData.slug) {
						delete currentEmotionsData.slug;
					}
					if (defaultSecondaryData && defaultSecondaryData.slug) {
						delete defaultSecondaryData.slug;
					}
					if (currentSecondaryData && currentSecondaryData.slug) {
						delete currentSecondaryData.slug;
					}
					if (defaultStrategiesData && defaultStrategiesData.slug) {
						delete defaultStrategiesData.slug;
					}
					if (strategiesData && strategiesData.slug) {
						delete strategiesData.slug;
					}

					cacheDerivedStrings();

					if (typeof _stringsLoadedCallback === "function") {
						_stringsLoadedCallback(instance);
					}

					return instance;
				})
				.catch((error) => {
					console.error("Failed to load strings:", error);
					// Handle error, e.g., by using default language as a fallback for everything
					// This is a simplified error handling. Depending on requirements,
					// you might want to retry or show a user-friendly message.
					if (!currentEmotionsData) {
						currentEmotionsData = defaultEmotionsData;
					}
					if (!currentSecondaryData) {
						currentSecondaryData = defaultSecondaryData;
					}
					if (!strategiesData) {
						strategiesData = defaultStrategiesData;
					}
				});
		}
	}

	function cacheDerivedStrings() {
		derivedStrings = {
			emotions: _.values(dispatcher.EMOTIONS).reduce((acc, emotion) => {
				acc[emotion] = getStr(`emotionsData.emotions.${emotion}.continent.name`);
				return acc;
			}, {}),
		};
	}

	function getSecondaryDataObject() {
		// Use current language's secondary data if available, otherwise fallback to default
		return currentSecondaryData || defaultSecondaryData;
	}

	function getEmotionsDataObject() {
		return currentEmotionsData || defaultEmotionsData;
	}

	function getStrategiesDataObject() {
		return strategiesData || defaultStrategiesData;
	}


	instance = {
		getStr,
		getEmotionsDataObject,
		getSecondaryDataBlock,
		getSecondaryDataObject,
		getStrategiesDataObject,
		lang,
		screenIsSmall,
		loadStrings,
	};

	loadStrings();

	return instance;
}

export default function (_lang, _screenIsSmall, _stringsLoadedCallback) {
	if (
		!instance ||
		(_lang && instance.lang() !== _lang) ||
		(_screenIsSmall && instance.screenIsSmall() !== _screenIsSmall)
	) {
		appStrings(_lang, _screenIsSmall, _stringsLoadedCallback);
	}

	return instance;
}
