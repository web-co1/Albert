const accordions = Array.from(document.querySelectorAll(".accordion"));

for (let i = 0; i < accordions.length; i++) {
    const accordion = accordions[i];
    accordion.addEventListener("click", function(event) {
        let accordionBody = this.querySelector(".accordion__body");
        let arrowIcon = accordionBody.parentElement.querySelector(".accordion__icon");
        if (accordionBody.style.maxHeight) {
            accordionBody.style.maxHeight = null;
            accordionBody.style.opacity = 0;
            arrowIcon.style.transform = "rotate(0deg)";
        } else {
            accordionBody.style.maxHeight = accordionBody.scrollHeight + "px";
            accordionBody.style.opacity = 1;
            arrowIcon.style.transform = "rotate(180deg)";
            let allOtherAccordions = document.querySelectorAll(".accordion__body");
            allOtherAccordions.forEach(function(body) {
                if (body !== accordionBody) {
                    body.style.maxHeight = null;
                    body.style.opacity = 0;
                    body.parentElement.querySelector(".accordion__icon").style.transform = "rotate(0deg)";
                }
            });
        }
    });
}

