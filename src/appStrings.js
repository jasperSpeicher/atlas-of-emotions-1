import _ from "lodash";
import fetch from "isomorphic-fetch";
import dispatcher from "./dispatcher.js";
import emotionsData from "../static/emotionsData.json";
import strategiesData from "../static/strategiesData.json";

// maintain state and make globally accessible.
// yeah, a little dirty, but good enough for this use case.
let instance;
let langs = [];
let currentSecondaryData;
let defaultSecondaryData;

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
			// The rest of 'path' is the path within the secondaryData object
			const value = _.get(secondaryDataObject, path.join("."));
			// Unlike other string lookups, secondaryData values are typically objects/arrays or direct strings,
			// not keys to be resolved via resolveString. So we return the value directly.
			// If a value is a string that itself is a key to the main 'strings' table, this won't resolve it.
			// This assumes secondaryData contains final values or structures.
			return typeof value !== 'undefined' ? value : (failQuietly ? "" : `Key not found in secondaryData: ${key}`);
		}

		// Existing logic for emotionsData, strategiesData, etc.
		let source = 
			originalSourceKey === "emotionsData"
				? emotionsData
				: originalSourceKey === "strategiesData"
				? strategiesData
				: null;
		if (!source) {
			// This error should ideally not be reached if all valid sources (derived, secondaryData, emotionsData, strategiesData) are handled.
			// If key didn't match any known source prefix.
			throw new Error(`Invalid source specified at key '${key}' (source was '${originalSourceKey}')`);
		}

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

		let parsedKey = _.get(emotionsData, path.join(".")),
			parsedValue;

		// if the key exists in emotionsData.json,
		// then use it, whether this key-value was originally in emotionsData or secondaryData.
		// we're moving everything from secondaryData into emotionsData, tab-by-tab.
		if (parsedKey) {
			source = emotionsData;
		} else if (originalSourceKey === "strategiesData" && source === strategiesData) {
			// If originalSourceKey was strategiesData, try to get the key from strategiesData
			// This assumes 'path' still holds the correct path parts for strategiesData
			parsedKey = _.get(strategiesData, path.join("."));
			if (!parsedKey) {
				// If key not found in strategiesData either, return the strategiesData object itself or handle as error/empty
				// This matches the previous behavior of `return source;` when source was strategiesData and key not found
				return strategiesData; // Or consider: failQuietly ? "" : `Key not found: ${key}`;
			}
			// source is already strategiesData
		} else if (source === null && originalSourceKey !== "emotionsData" && originalSourceKey !== "strategiesData" && originalSourceKey !== "derived" && originalSourceKey !== "secondaryData") {
			// This case handles keys that didn't match any known prefix and weren't found in emotionsData initially.
			// This situation should ideally be caught by the earlier `if (!source)` error throw for invalid prefixes.
			// If we reach here, it means an unknown prefix was used, or a known prefix for which 'source' was not set (which is a logical flaw).
			// For safety, and to mimic failing quietly or loudly based on an unfound key:
			if (failQuietly) return "";
			throw new Error(`Key not found and invalid source for key: ${key}`);
		}

		// this weirdness is an artifact of implementing localization long after the content spreadsheets and parsers were all set up.
		// only running nested parsing on emotionsData;
		// secondaryData will eventually be phased into emotionsData and will all run through this block,
		// but until then, we leave secondaryData strings alone.
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
				if (
					key.split(".")[0] === "strategiesData" ||
					key.split(".")[0] === "emotionsData"
				) {
					// recursively parse nested objects in secondary data (more info / annex / etc)
					parsedValue = Object.keys(parsedKey).reduce((acc, k) => {
						if (typeof parsedKey[k] == "number") {
							acc[k] = parsedKey[k];
						} else {
							acc[k] = getStr(`${key}.${k}`, failQuietly, debug);
						}
						return acc;
					}, {});
				} else {
					// pass through non-nested objects in metadata / emotions tabs as-is
					parsedValue = parsedKey;
				}
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
		if (strings && currentSecondaryData) return Promise.resolve(instance);
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

			return Promise.all([
				defaultStringsPromise,
				currentStringsPromise,
				defaultSecondaryDataPromise,
				currentSecondaryDataPromise
			])
				.then((results) => {
					defaultStrings = processJSON(results[0]);
					strings = processJSON(results[1]);
					defaultSecondaryData = results[2];
					currentSecondaryData = results[3];

					if (defaultSecondaryData && defaultSecondaryData.slug) {
						delete defaultSecondaryData.slug;
					}
					if (currentSecondaryData && currentSecondaryData.slug) {
						delete currentSecondaryData.slug;
					}

					cacheDerivedStrings();
				})
				.catch((e) => {
					console.error("Error loading string/data files:", e);
					throw new Error(
						`Language files for ${_lang} or ${defaultLang} (strings or secondaryData) not supported, or files are malformed.`
					);
				});
		}
	}

	// This is all AoE-specific, for strings derived from the loaded+parsed content
	// that don't have their own data structure within the content.
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

	// New function to get the secondary data object
	function getSecondaryDataObject() {
		return currentSecondaryData || defaultSecondaryData || {};
	}

	instance = {
		getStr,
		getSecondaryDataBlock,
		getSecondaryDataObject,
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
