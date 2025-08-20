   // Slideshow
    let slideIndex = 0;
    function showSlides() {
      let slides = document.getElementsByClassName("slide");
      for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }
      slideIndex++;
      if (slideIndex > slides.length) { slideIndex = 1 }
      slides[slideIndex - 1].style.display = "block";
      setTimeout(showSlides, 3000); // Change every 3 seconds
    }

    // Form Submission
    document.getElementById("admissionForm").addEventListener("submit", function(event) {
      event.preventDefault();
      document.getElementById("thankYou").style.display = "block";
      this.reset();
    });