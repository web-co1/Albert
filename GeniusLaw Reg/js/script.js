const pricingToggle = document.querySelectorAll(".pricing__toggle-btn");
const monthlyToggle = document.getElementById("monthly-toggle");
const annualToggle = document.getElementById("annual-toggle");

monthlyToggle.classList.add("toggle--active")
monthlyToggle.addEventListener("click", function(){
    this.classList.add("toggle--active")
    annualToggle.classList.remove("toggle--active")
})
annualToggle.addEventListener("click", function(){
    this.classList.add("toggle--active")
    monthlyToggle.classList.remove("toggle--active")
})