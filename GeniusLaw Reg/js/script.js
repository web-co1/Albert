const pricingToggle = document.querySelectorAll(".pricing__toggle-btn");
const monthlyToggle = document.getElementById("monthly-toggle");
const annualToggle = document.getElementById("annual-toggle");
const popup = document.querySelector(".popup");
const displayPopupBtn = document.getElementById("open-popup");
const popupCloseBtn = document.getElementById("close-popup");
const featureButtons = document.querySelectorAll('.plan__features-btn');
const popupPriceToggle = document.querySelectorAll(".popup__billing-item");

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


// checkout popup starts here
if(popup){
    displayPopupBtn.addEventListener("click", function(){
        popup.style.display = "block";
       
        setTimeout(function(){
            popup.querySelector(".popup__inner").style.transform = "translateX(0%)";
            popup.style.background=  "var(--color-dark-greenish-blu-25)";
        }, 300)
    })

    popupCloseBtn.addEventListener("click", function(){
        popup.querySelector(".popup__inner").style.transform = "translateX(0%)";
        popup.style.background=  "transparent";
        setTimeout(function(){
            popup.style.display = "none";
        }, 300)
    })
    window.addEventListener("click", function(e){
        if(e.target === popup) {
            popup.querySelector(".popup__inner").style.transform = "translateX(100%)";
            popup.style.background=  "transparent";
            setTimeout(function(){
                popup.style.display = "none";
            }, 300)
        }
    })
}
// checkout popup end here

// checkout popup price toggle starts here
if(popupPriceToggle){
    popupPriceToggle[0].classList.add("toggle--active")
    popupPriceToggle.forEach(function(toggle){
        toggle.addEventListener("click", function(){
            popupPriceToggle.forEach(function(toggle){
                toggle.classList.remove("toggle--active")
            })
            this.classList.add("toggle--active")
        })
    })
}
// checkout popup price toggle ends here

// pricing  cards  dropdown on mobile start
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
// pricing  cards  dropdown on mobile end