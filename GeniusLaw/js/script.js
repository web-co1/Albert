const faqAccordion = document.querySelectorAll(".accordion");
const menuBtn = document.querySelector(".menu-btn");
const body = document.body;
const navigationLink = document.querySelectorAll(".nav-link");
const menuList = document.querySelectorAll(".site-header__list-item");
const dropdownBtn = document.querySelectorAll(".site-header__dropbtn")
const dropdown = document.querySelectorAll(".dropdown__inner");
const dropdownBackBtn = document.querySelectorAll(".dropdown__back-btn")
const pricingSection = document.querySelector(".pricing");
const monthlyToggle = document.getElementById("monthly-toggle");
const annualToggle = document.getElementById("annual-toggle");
const employersNumberInput = document.getElementById("number");
const emailBlock = document.querySelector(".for-email");
const phoneBlock = document.querySelector(".for-phone");

// navigation menu start here
menuBtn.addEventListener("click", function(){
    body.classList.toggle("nav-open");
    dropdown.forEach(function(dropdown){
        dropdown.classList.remove("dropdown--open")
    })
})

navigationLink.forEach(function(navLink){
    navLink.addEventListener("click", function(){
        body.classList.remove("nav-open");
    })  
})
// navigation menu end here

// dropdown starts her 
dropdownBtn.forEach(function(button){
    button.addEventListener("click", function(){
        this.parentElement.querySelector(".dropdown__inner").classList.add("dropdown--open")
    })
})
dropdownBackBtn.forEach(function(button){
    button.addEventListener("click", function(){
        this.parentElement.classList.remove("dropdown--open")
    })
})
// dropdown end her 

// faqs accordions start here
if(faqAccordion){
    let currentAccordion = null;

    faqAccordion.forEach(function(accordion) {
        accordion.addEventListener("click", function() {
            const accordionBody = this.querySelector(".accordion__body");
    
            if (currentAccordion && currentAccordion !== accordion) {
                const currentBody = currentAccordion.querySelector(".accordion__body");
                currentBody.style.maxHeight = null; // Close it
                currentAccordion.classList.remove("accordion--expanded"); // Remove expanded class
            }
    
            if (accordionBody.style.maxHeight) {
                accordionBody.style.maxHeight = null;
                currentAccordion = null;
            } else {
                accordionBody.style.maxHeight = accordionBody.scrollHeight + "px"; 
                currentAccordion = accordion; 
            }
    
            this.classList.toggle("accordion--expanded");
        });
    });
    
}
// faqs accordions end here


// Pricing toggle start here 
if(monthlyToggle){
    monthlyToggle.classList.add("toggle--active")
    monthlyToggle.addEventListener("click", function(){
        this.classList.add("toggle--active")
        annualToggle.classList.remove("toggle--active")
    })
    annualToggle.addEventListener("click", function(){
        this.classList.add("toggle--active")
        monthlyToggle.classList.remove("toggle--active")
    })
}
// Pricing toggle ends here 

// contact form fields start here 
employersNumberInput.addEventListener("input", function(){
    if(employersNumberInput.value){
        emailBlock.style.display = "block"
        phoneBlock.style.display = "block"
    }
    else {
        emailBlock.style.display = "none"
        phoneBlock.style.display = "none"
    }
})


// pricing table starts here
// const tbody = document.querySelectorAll(".tb-slice tr");
// const tbodyRow = [...tbody].slice(0, 5);
// const tbodyHtml = tbodyRow.map(row => row.outerHTML).join('');
// const tbodyElement = document.querySelector(".tb-slice");
// tbodyElement.innerHTML = tbodyHtml;
// pricing table ends here
