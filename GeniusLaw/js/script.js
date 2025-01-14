const faqAccordion = document.querySelectorAll(".accordion");
const menuBtn = document.querySelector(".menu-btn");
const body = document.body;
const navigationLink = document.querySelectorAll(".nav-link");
const menuList = document.querySelectorAll(".site-header__list-item");
const dropdownBtn = document.querySelectorAll(".site-header__dropbtn")
const dropdown = document.querySelectorAll(".dropdown__inner");
const dropdownBackBtn = document.querySelectorAll(".dropdown__back-btn")
const pricingSection = document.querySelector(".pricing");
const pricingToggle = document.querySelectorAll(".pricing__toggle-btn");
const monthlyToggle = document.getElementById("monthly-toggle");
const annualToggle = document.getElementById("annual-toggle");
const $monthlyToggle2 = document.getElementById("monthly-toggle2");
const $annualToggle2 = document.getElementById("annual-toggle2");
const employersNumberInput = document.getElementById("number");
const emailBlock = document.querySelector(".for-email");
const phoneBlock = document.querySelector(".for-phone");
const table = document.getElementById("pricing-table");
const tableHead = document.getElementById("pricing-table-head");
const pricingTable = document.querySelectorAll(".pricing__table--block");
const showMoreRows = document.getElementById("show-features");
const featureButtons = document.querySelectorAll('.plan__features-btn');
const popup = document.getElementById("popup");
const popupOpenBtn = document.querySelectorAll(".popup-btn");
const popupCloseBtn = document.getElementById("close-popup");
const counter = document.querySelector(".hrs")


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
        path: 'assets/genius_crop_v3.json',
    })
}
// hero animation starts here 


// counter starts here
if(counter) {
    new PureCounter({
        selector: '.hrs',
        start: 0, 			         
        end: 10,
        duration: 1, 
        delay: 10, 	
        once: true, 
        repeat: false, 
        decimals: 0, 	
        legacy: true,    
        filesizing: false, 
        currency: false, 
        separator: false, 
    });

    new PureCounter({
        selector: '.accuracy',	
        start: 0, 
        end: 98, 	
        duration: 2, 
        delay: 12, 	
        once: true, 	
        repeat: false, 
        decimals: 0, 	
        legacy: true,   
        filesizing: false, 	
        currency: false, 	
        separator: false, 	
    });

    new PureCounter({
        selector: '.turnaround',
        start: 0,
        end: 5, 	
        duration: 1,
        delay: 14, 	
        once: true, 
        repeat: false,
        decimals: 0, 	
        legacy: true,  
        filesizing: false, 	
        currency: false, 	
        separator: false, 	
    });

   
    function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    function animateCounter(selector, start, end, duration) {
        const element = document.querySelector(selector);
        const startTime = performance.now();

        function updateCounter(time) {
            const timeElapsed = (time - startTime) / 1000;  
            const progress = Math.min(timeElapsed / duration, 1);
            const easedProgress = easeInOut(progress);
            const currentValue = Math.floor(start + (end - start) * easedProgress);
            element.innerHTML = currentValue;
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        requestAnimationFrame(updateCounter);
    }

    animateCounter('.hrs', 0, 10, 3); 
    animateCounter('.accuracy', 0, 98, 8); 
    animateCounter('.turnaround', 0, 5, 3);  

}
// counter ends here


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
    $monthlyToggle2.classList.add("toggle--active")

    monthlyToggle.addEventListener("click", function(){
        this.classList.add("toggle--active")
        annualToggle.classList.remove("toggle--active")
    })
    annualToggle.addEventListener("click", function(){
        this.classList.add("toggle--active")
        monthlyToggle.classList.remove("toggle--active")
    })

// for sticky bar on table
    $monthlyToggle2.addEventListener("click", function(){
        this.classList.add("toggle--active")
        $annualToggle2.classList.remove("toggle--active")
    })

    $annualToggle2.addEventListener("click", function(){
        this.classList.add("toggle--active")
        $monthlyToggle2.classList.remove("toggle--active")
    })
    
    window.addEventListener('scroll', function() {
        var placeElement = document.getElementById('pricing-table');
        var offset = placeElement.getBoundingClientRect().top + window.scrollY;
        if (window.scrollY >= offset) {
            tableHead.style.visibility = "visible";
                tableHead.style.opacity = "1";
        }
        else {
            tableHead.style.visibility = "hidden"; 
            tableHead.style.opacity = "0";
        }
    });  
}
// Pricing toggle ends here 


// contact form fields start here 
if(employersNumberInput){
    employersNumberInput.addEventListener("input", function(){
        if(employersNumberInput.value){
            emailBlock.style.display = "block"
            phoneBlock.style.display = "block"
            setTimeout(()=>{
                emailBlock.style.opacity = "1"
                phoneBlock.style.opacity = "1"
            }, 100)
            
        }
    })
}


// pricing table starts here
if(table){
    function pricingMinimiseTable(){
        document.querySelector(".pricing__btn-wrap").style.marginTop = "-50px";
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

}

// pricing  cards  dropdown on mobile
if(featureButtons){
    featureButtons.forEach(function(button) {
        button.classList.remove("show-features"); 
    
        button.addEventListener("click", function() {
            if (this.parentElement.classList.contains("show-features")) {
                this.parentElement.classList.remove("show-features");
                this.querySelector("span").textContent = "Show features";  
            } else {
                featureButtons.forEach(function(btn) {
                    btn.parentElement.classList.remove("show-features");
                });
                this.parentElement.classList.add("show-features");
                this.querySelector("span").textContent = "Hide features";  
            }
        });
    });
}

// popup starts here
if(popup) {
    popupOpenBtn.forEach(function(button){
        button.addEventListener("click", function(){
            popup.style.display = "flex";
            document.body.style.overflow = "hidden";
        })
    })
    popupCloseBtn.addEventListener("click", function(){
        popup.style.display = "none";
        document.body.style.overflow = "visible";
    })
    window.addEventListener("click", function(e){
        if(e.target === popup) {
            popup.style.display = "none";
            document.body.style.overflow = "visible";
        }
    })
}