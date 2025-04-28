import appStrings from "./appStrings";

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
		imageElement.src = "/img/atlas-logo.svg";
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
