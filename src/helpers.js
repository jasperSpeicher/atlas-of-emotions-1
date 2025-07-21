import appStrings from "./appStrings";
import _ from "lodash";

export const initializeTables = (subSections, sectionContainer) => {
	for (let subSection of subSections) {
		const subSectionWrapper = document.createElement("div");
		$(subSectionWrapper).addClass("wrapper");
		const subSectionKey = subSection.key;
		const subSectionAnnexKey = subSectionKey.replace("annex-", "");
		subSectionWrapper.id = subSectionAnnexKey;
		const subSectionData =
			appStrings().getSecondaryDataBlock(subSectionKey);
		subSection.component.init(subSectionWrapper, subSectionData);
		const titleElement = document.createElement("h1");
		const annexData = subSectionData.annex[subSectionAnnexKey];
		titleElement.innerHTML = annexData.title;
		const imageElement = document.createElement("img");
		imageElement.src = "img/atlas-logo.svg";
		imageElement.className = "print-header-logo";
		titleElement.prepend(imageElement);
		subSectionWrapper.prepend(titleElement);
		sectionContainer.appendChild(subSectionWrapper);
	}
};

export function scrollToSelector(selector, scrollParent) {
	const destination = $(selector);
	scrollParent.animate({ scrollTop: destination[0].offsetTop - 80 });
}

export function addScrollerFade($activeScrollerSectionText) {
	const $sectionTextScroller = $activeScrollerSectionText.find(
		".section-text__scroller"
	);

	// add fade class at bottom of the div if there is overflow
	// remove it after scrolling
	if ($sectionTextScroller) {
		$sectionTextScroller[0].scrollTop = 0;
		if (
			$sectionTextScroller[0].scrollHeight >
			$sectionTextScroller[0].clientHeight
		) {
			$sectionTextScroller.addClass("fade");
			$sectionTextScroller.off("scroll");
			$sectionTextScroller.on("scroll", function () {
				$sectionTextScroller.removeClass("fade");
				$sectionTextScroller.off("scroll");
			});
		} else {
			$sectionTextScroller.removeClass("fade");
		}
	}
}

/**
 * Generic scroll-spy helper that toggles `.active` on TOC list items while scrolling.
 * @param {JQuery} scrollParent – element with scroll listener (usually the graphics scroll container)
 * @param {string} tocSelector – selector for the nav (e.g. '#strategies-toc')
 * @param {string} contentContainerSelector – selector (within scrollParent) that contains headings to spy on
 * @param {string} linkPrefix – prefix used in hrefs (e.g. 'strategies' yields href="#strategies/<id>")
 * @param {number} [extraOffset=0] – pixel offset to account for fixed overlays (e.g. top nav height)
 */
export function setupScrollSpy({ scrollParent, tocSelector, contentContainerSelector, linkPrefix, extraOffset = 0 }) {
	if (!scrollParent || scrollParent.length === 0) return;

	const tocLinks = $(`${tocSelector} a`);
	if (tocLinks.length === 0) return;

	const headings = scrollParent.find(`${contentContainerSelector} [id]`);
	if (headings.length === 0) return;

	const navHeight = extraOffset; // still allow caller to tweak threshold

	let activeId;

	const updateActiveLink = () => {
		const containerTop = scrollParent.offset().top;
		const containerHeight = scrollParent.height();

		const threshold = containerHeight / 2 - navHeight; // vertical centre, adjust if needed

		let currentId = headings[0].id;

		headings.each((index, el) => {
			const relTop = $(el).offset().top - containerTop;
			if (relTop <= threshold) {
				currentId = el.id;
			}
		});

		if (currentId !== activeId) {
			activeId = currentId;
			const targetLink = tocLinks.filter(`[href="#${linkPrefix}/${activeId}"]`);
			if (targetLink.length) {
				$(`${tocSelector} li`).removeClass("active");
				targetLink.parent().addClass("active");
			}
		}
	};

	// Throttle for performance
	scrollParent.on("scroll", _.throttle(updateActiveLink, 100));
	updateActiveLink();
}
