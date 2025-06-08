import _ from "lodash";
import fetch from "isomorphic-fetch";
import dispatcher from "./dispatcher.js";
import emotionsData from "../static/emotionsData.json";

// maintain state and make globally accessible.
// yeah, a little dirty, but good enough for this use case.
let instance;
let langs = [];
let currentSecondaryData;
let defaultSecondaryData;
let strategiesData;
let defaultStrategiesData;

/**
 * Utility for loading an arbitrary string or set of strings
 * from the Google Sheets that back this application.
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
		strings = langs[_lang],
		defaultStrings = langs[defaultLang],
		derivedStrings;

	function resolveString(key) {
		if (!strings[key] && defaultStrings != strings) {
			return defaultStrings[key];
		}
		return strings[key];
	}

	function getStr(key, failQuietly, debug) {
		// Strings not yet loaded; fail silently
		if (!strings) {
			return "";
		}

		let path = key.split("."),
			originalSourceKey = path.splice(0, 1)[0]; // Renamed to avoid conflict

		if (originalSourceKey === "derived") {
			return _.get(derivedStrings, path.join("."));
		}

		// Handle "secondaryData." prefixed keys
		if (originalSourceKey === "secondaryData") {
			const secondaryDataObject = getSecondaryDataObject();
			const value = _.get(secondaryDataObject, path.join("."));
			return typeof value !== 'undefined' ? value : (failQuietly ? "" : `Key not found in secondaryData: ${key}`);
		}

		if (originalSourceKey === "strategiesData") {
			const strategiesDataObject = getStrategiesDataObject();
			if(path.length === 0) return strategiesDataObject;
			const value = _.get(strategiesDataObject, path.join("."));
			if (typeof value !== 'undefined') {
				return value;
			}
			return (failQuietly ? "" : `Key not found in strategies: ${key}`);
		}

		let source = emotionsData; // all other keys are in emotionsData now.

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

		let parsedKey = _.get(source, path.join(".")),
			parsedValue;

		// if the key exists in emotionsData.json,
		// then use it, whether this key-value was originally in emotionsData or secondaryData.
		// we're moving everything from secondaryData into emotionsData, tab-by-tab.
		if (parsedKey) {
			source = emotionsData;
		} else {
			// if it's not in emotionsData, it's a string key
			return resolveString(key);
		}

		// this weirdness is an artifact of implementing localization long after the content spreadsheets and parsers were all set up.
		if (source === emotionsData) {
			if (
				typeof parsedKey === "string" ||
				typeof parsedKey === "boolean"
			) {
				parsedValue = resolveString(parsedKey);
			} else if (Array.isArray(parsedKey)) {
				parsedValue = parsedKey.map((k, i) => {
					let pathPrefix = `${key}[${i}]`;
					if (typeof k === "string") {
						if (isNaN(k)) {
							return resolveString(k); //getStr(pathPrefix + k); //FIXME why was it like this?
						} else {
							return k; // FIXME there are numbers stored as strings in the emotions data...
						}
					} else if (Array.isArray(k)) {
						return k.map((kk, j) => getStr(`${pathPrefix}[${j}]`));
					} else if (typeof k === "object") {
						// localize nested objects
						return Object.keys(k).reduce((acc, k1) => {
							acc[k1] = getStr(pathPrefix + "." + k1);
							return acc;
						}, {});
					}
				});
			} else if (typeof parsedKey === "object") {
				// recursively parse nested objects in emotionsData
				parsedValue = Object.keys(parsedKey).reduce((acc, k) => {
					if (typeof parsedKey[k] == "number") {
						acc[k] = parsedKey[k];
					} else {
						acc[k] = getStr(`${key}.${k}`, failQuietly, debug);
					}
					return acc;
				}, {});
			} else {
				if (failQuietly) {
					return "";
				} else {
					throw new Error(`Key not found at ${key}`);
				}
			}
		}

		// fall back to returning parsed key or empty string
		return parsedValue || parsedKey || "";
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

	function processJSON(json) {
		// 1. Access json.string_groups
		const stringGroups = json.string_groups || []; // Default to empty array if undefined

		// 2. Iterate through each group, 3. Access items, 4. Concatenate
		const allItems = stringGroups.reduce((acc, group) => {
			if (group && group.items && Array.isArray(group.items)) {
				return acc.concat(group.items);
			}
			return acc;
		}, []);

		// 5. Perform the same reduction as before
		return allItems.reduce((acc, kv) => {
			if (kv && typeof kv.key !== 'undefined') { // Ensure item has a key
				acc[kv.key] = kv.value;
			}
			return acc;
		}, {});
	}

	function loadStrings() {
		if (strings && currentSecondaryData && strategiesData) return Promise.resolve(instance);
		else {
			const langPath = 'strings/langs';

			const defaultStringsPromise = fetch(`${langPath}/strings.${defaultLang}.json`, {
				credentials: "same-origin",
			}).then(res => res.json());

			const currentStringsPromise = fetch(`${langPath}/strings.${_lang}.json`, {
				credentials: "same-origin",
			}).then(res => res.json());

			const defaultSecondaryDataPromise = fetch(`${langPath}/secondaryData.${defaultLang}.json`, {
				credentials: "same-origin",
			}).then(res => res.json());

			const currentSecondaryDataPromise = fetch(`${langPath}/secondaryData.${_lang}.json`, {
				credentials: "same-origin",
			}).then(res => res.json());

			const defaultStrategiesDataPromise = fetch(`${langPath}/strategies.${defaultLang}.json`, {
				credentials: "same-origin",
			}).then(res => res.json());

			const currentStrategiesDataPromise = fetch(`${langPath}/strategies.${_lang}.json`, {
				credentials: "same-origin",
			}).then(res => res.json());

			return Promise.all([
				defaultStringsPromise,
				currentStringsPromise,
				defaultSecondaryDataPromise,
				currentSecondaryDataPromise,
				defaultStrategiesDataPromise,
				currentStrategiesDataPromise
			])
				.then((results) => {
					defaultStrings = processJSON(results[0]);
					strings = processJSON(results[1]);
					defaultSecondaryData = results[2];
					currentSecondaryData = results[3];
					defaultStrategiesData = results[4];
					strategiesData = results[5];
					
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
					if (!strings) {
						strings = defaultStrings;
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
				acc[emotion] = resolveString(`${emotion}_continent_header`);
				return acc;
			}, {}),
			sections: _.values(dispatcher.SECTIONS).reduce((acc, section) => {
				acc[section] = resolveString(`${section}_section_name`);
				return acc;
			}, {}),
		};
	}

	function getSecondaryDataObject() {
		// Use current language's secondary data if available, otherwise fallback to default
		return currentSecondaryData || defaultSecondaryData;
	}

	function getStrategiesDataObject() {
		return strategiesData || defaultStrategiesData;
	}

	// a get-all for debugging and for populating the glossary
	function getStrings() {
		return strings;
	}

	instance = {
		getStr,
		getSecondaryDataBlock,
		getSecondaryDataObject,
		getStrategiesDataObject,
		lang,
		screenIsSmall,
		loadStrings,
		getStrings,
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
