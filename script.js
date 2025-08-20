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

    /* ====== Slideshow JS ====== */
       let slideIndex = 0;
    showSlides();

    function showSlides() {
      let i;
      let slides = document.getElementsByClassName("slide");
      let dots = document.getElementsByClassName("dot");
      for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }
      slideIndex++;
      if (slideIndex > slides.length) { slideIndex = 1 }
      slides[slideIndex - 1].style.display = "block";
      setTimeout(showSlides, 3000); // Change every 3 seconds
    }

    function plusSlides(n) {
      slideIndex += n-1;
      showSlides();
    }

    function currentSlide(n) {
      slideIndex = n-1;
      showSlides();
    }