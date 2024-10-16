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
const table = document.getElementById("pricing-table");
const pricingTable = document.querySelectorAll(".pricing__table--block");
const showMoreRows = document.getElementById("show-features");
const minimiseRows = document.getElementById("hide-features");
const featureButtons = document.querySelectorAll('.plan__features-btn');


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


// hero animation starts here 
if(document.getElementById("lottie")){
    lottie.loadAnimation({
        container: document.getElementById("lottie"),
        render: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/Genius_crop.json',
    })
}

// hero animation starts here 


// faqs accordions start here
if(faqAccordion){
    let currentAccordion = null;

    faqAccordion.forEach(function(accordion) {
        accordion.addEventListener("click", function() {
            const accordionBody = this.querySelector(".accordion__body");
    
            if (currentAccordion && currentAccordion !== accordion) {
                const currentBody = currentAccordion.querySelector(".accordion__body");
                currentBody.style.maxHeight = null;
                currentAccordion.classList.remove("accordion--expanded");
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

    table.addEventListener("scroll", function(){
        if (table.scrollTop > 20) {
            alert()
        }
    })
}
// Pricing toggle ends here 


// contact form fields start here 
if(employersNumberInput){
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
}
// pricing table starts here


if(table){
function pricingMinimiseTable(){
    document.querySelector(".pricing__btn-wrap").style.marginTop = "-50px";
    minimiseRows.style.display = "none";
    showMoreRows.style.display = "inline-block";
    document.querySelector(".table-overlay").style.display = "block";
    const tbodyRows = document.querySelectorAll(".tb-slice tr");

    tbodyRows.forEach((row, index) => {
        if (index < 6) {
            row.style.display = "table-row";
        } else {
            row.style.display = "none";
        }
    });

    const pricingTableBlock = Array.from(pricingTable);
    pricingTableBlock.forEach(block => {
        block.style.display = "none";
    });

    if (pricingTableBlock.length > 0) {
        pricingTableBlock[0].style.display = "block";
    }
}
pricingMinimiseTable();

function pricingAllTable(){
    document.querySelector(".pricing__btn-wrap").style.marginTop = "0px";
    minimiseRows.style.display = "inline-block";
    showMoreRows.style.display = "none";
    document.querySelector(".table-overlay").style.display = "none";
    const tbodyRows = document.querySelectorAll(".tb-slice tr");

    tbodyRows.forEach((row, index) => {
            row.style.display = "table-row";
    });

    const pricingTableBlock = Array.from(pricingTable);
    pricingTableBlock.forEach(block => {
        block.style.display = "block";
    });
}


 showMoreRows.addEventListener("click", pricingAllTable)
 minimiseRows.addEventListener("click", pricingMinimiseTable)

}

if(featureButtons){
 featureButtons.forEach(function(button) {
        button.classList.remove("show-features"); 

        button.addEventListener("mouseover", function() {
            featureButtons.forEach(function(btn) {
                btn.parentElement.classList.remove("show-features");
            });
            this.parentElement.classList.add("show-features");
            this.querySelector("span").textContent = "Hide features";     
        });
        button.addEventListener("mouseout", function() {
            this.parentElement.classList.remove("show-features");  
            this.querySelector("span").textContent = "See features";     
        });

    });
}

