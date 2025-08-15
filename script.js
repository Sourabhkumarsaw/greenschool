  // Slideshow
    let slideIndex = 0;
    showSlides();
    function showSlides() {
      let slides = document.getElementsByClassName("slides");
      for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
      }
      slideIndex++;
      if (slideIndex > slides.length) {slideIndex = 1}    
      slides[slideIndex-1].style.display = "block";  
      setTimeout(showSlides, 3000); // Change every 3s
    }

    // Form validation & thank you message
    document.getElementById("inquiryForm").addEventListener("submit", function(event) {
      event.preventDefault();
      let name = document.getElementById("name").value.trim();
      let email = document.getElementById("email").value.trim();
      let grade = document.getElementById("grade").value;
      let thankYou = document.getElementById("thankYouMessage");

      if (name === "" || email === "" || grade === "") {
        alert("Please fill out all required fields before submitting.");
        return;
      }

      thankYou.style.display = "block";
      this.reset();
      setTimeout(() => {
        thankYou.style.display = "none";
      }, 5000);
    }
  );