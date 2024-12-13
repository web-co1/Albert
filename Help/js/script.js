const accordions = Array.from(document.querySelectorAll(".accordion"));

console.log(accordions);

for (let i = 0; i < accordions.length; i++) {
    const accordion = accordions[i];
    accordion.addEventListener("click", function(event){
        let accordionBodies = document.querySelectorAll(".accordion__body");
        for (let i = 0;  i < accordionBodies.length; i++) {
            const currentAccordion = accordionBodies[i];
            currentAccordion.style.maxHeight = null;
            currentAccordion.style.opacity = 0;
            currentAccordion.parentElement.querySelector(".accordion__icon").style.transform = "rotate(0deg)";
        }
        
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
        }

    })
    
}