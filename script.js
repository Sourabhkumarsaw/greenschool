document.getElementById("inquiryForm").addEventListener("submit", function(event) {
      event.preventDefault();
      
      let name = document.getElementById("name").value.trim();
      let email = document.getElementById("email").value.trim();
      let grade = document.getElementById("grade").value;

      if (name === "" || email === "" || grade === "") {
        alert("Please fill out all required fields before submitting.");
        return;
      }

      // Show thank-you message
      document.getElementById("successMessage").style.display = "block";

      // Clear the form
      this.reset();

      // Smooth scroll to thank-you message
      document.getElementById("successMessage").scrollIntoView({ behavior: "smooth" });
    });