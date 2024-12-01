const pricingToggle = document.querySelectorAll(".pricing__toggle-btn");
const monthlyToggle = document.getElementById("monthly-toggle");
const annualToggle = document.getElementById("annual-toggle");
const popup = document.querySelector(".popup");
const displayPopupBtn = document.getElementById("open-popup")
const popupCloseBtn = document.getElementById("close-popup");
const featureButtons = document.querySelectorAll('.plan__features-btn');

monthlyToggle.classList.add("toggle--active")
monthlyToggle.addEventListener("click", function(){
    this.classList.add("toggle--active")
    annualToggle.classList.remove("toggle--active")
})
annualToggle.addEventListener("click", function(){
    this.classList.add("toggle--active")
    monthlyToggle.classList.remove("toggle--active")
})

// checkout popup starts here
if(popupCloseBtn){
    displayPopupBtn.addEventListener("click", function(){
        popup.style.display = "block";
    })

    popupCloseBtn.addEventListener("click", function(){
        popup.style.display = "none"
    })
}
// checkout popup end here

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