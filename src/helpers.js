
export const initScrollLinks = (scrollParent) => { 
    $("[data-scroll-to]").on("click", (e) => {
        const link = $(e.target);
        const selector = link.data("scroll-to");
        const destination = $(selector);
        scrollParent.animate({ scrollTop: destination[0].offsetTop - 80 });
    });
}