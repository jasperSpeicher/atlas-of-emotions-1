import appStrings from "./appStrings";

export const initScrollLinks = (scrollParent) => {
	$("[data-scroll-to]").on("click", (e) => {
		const link = $(e.target);
		const selector = link.data("scroll-to");
		const destination = $(selector);
		scrollParent.animate({ scrollTop: destination[0].offsetTop - 80 });
	});
};

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
		subSectionWrapper.prepend(titleElement);
		sectionContainer.appendChild(subSectionWrapper);
	}
};
