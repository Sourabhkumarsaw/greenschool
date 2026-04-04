document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const navLinks = [...document.querySelectorAll(".primary-nav a")];
  const slides = [...document.querySelectorAll(".hero-slide")];
  const dots = [...document.querySelectorAll(".dot")];
  const sliderButtons = [...document.querySelectorAll(".slider-button")];
  const countItems = [...document.querySelectorAll(".count-up")];
  const revealItems = [...document.querySelectorAll(".reveal")];
  const tabButtons = [...document.querySelectorAll(".tab-button")];
  const tabPanels = [...document.querySelectorAll(".tab-panel")];
  const form = document.getElementById("admissionForm");
  const thankYou = document.getElementById("thankYou");
  const messageInput = document.getElementById("message");
  const messageCount = document.getElementById("messageCount");
  const currentYear = document.getElementById("currentYear");
  const submitButton = form?.querySelector(".form-submit");
  const apiBaseUrl = window.location.protocol === "file:" ? null : window.location.origin;
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  let activeSlide = 0;
  let sliderTimer;

  const setHeaderState = () => {
    if (!header) {
      return;
    }

    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  const toggleMenu = () => {
    if (!nav || !menuToggle) {
      return;
    }

    const isOpen = nav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  };

  const closeMenu = () => {
    if (!nav || !menuToggle) {
      return;
    }

    nav.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
      dot.setAttribute("aria-current", dotIndex === activeSlide ? "true" : "false");
    });
  };

  const restartSlider = () => {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(sliderTimer);
    sliderTimer = window.setInterval(() => {
      showSlide(activeSlide + 1);
    }, 4500);
  };

  const animateCount = (element) => {
    if (element.dataset.animated === "true") {
      return;
    }

    element.dataset.animated = "true";
    const target = Number(element.dataset.target || 0);
    const suffix = element.dataset.suffix || "";
    const duration = 1400;
    const startTime = performance.now();

    const updateValue = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const value = Math.floor(progress * target);
      element.textContent = `${value}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(updateValue);
      } else {
        element.textContent = `${target}${suffix}`;
      }
    };

    window.requestAnimationFrame(updateValue);
  };

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");

        if (entry.target.classList.contains("count-up")) {
          animateCount(entry.target);
        }

        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  const activateTab = (tabName) => {
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === tabName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    tabPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.panel === tabName);
    });
  };

  const validateField = (field) => {
    const value = field.value.trim();
    let isValid = value.length > 0;

    if (field.id === "contactNumber") {
      isValid = /^[0-9+\-\s]{8,15}$/.test(value);
    }

    field.classList.toggle("is-invalid", !isValid);
    return isValid;
  };

  const setActivePageLink = () => {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const targetPath = href.split("#")[0] || "index.html";
      const isActive = targetPath === currentPath;

      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  setHeaderState();
  setActivePageLink();
  showSlide(0);
  restartSlider();

  revealItems.forEach((item) => revealObserver.observe(item));
  countItems.forEach((item) => revealObserver.observe(item));

  window.addEventListener("scroll", setHeaderState);

  menuToggle?.addEventListener("click", toggleMenu);

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  sliderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.direction === "next" ? 1 : -1;
      showSlide(activeSlide + direction);
      restartSlider();
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.slide));
      restartSlider();
    });
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
  });

  if (messageInput && messageCount) {
    messageInput.addEventListener("input", () => {
      messageCount.textContent = String(messageInput.value.length);
    });
  }

  if (form && thankYou && submitButton) {
    form.querySelectorAll("input[required], select[required]").forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const requiredFields = [...form.querySelectorAll("input[required], select[required]")];
      const formIsValid = requiredFields.every((field) => validateField(field));

      if (!formIsValid) {
        thankYou.textContent = "Please complete all required fields correctly before submitting.";
        thankYou.style.color = "#c45532";
        return;
      }

      if (!apiBaseUrl) {
        thankYou.textContent = "Start `python server.py` and open http://127.0.0.1:8000 to save submissions to the database.";
        thankYou.style.color = "#c45532";
        return;
      }

      const studentName = document.getElementById("name").value.trim();
      const parentName = document.getElementById("parent").value.trim();
      const selectedGrade = document.getElementById("grade").value;
      const contactNumber = document.getElementById("contactNumber").value.trim();
      const additionalInfo = messageInput ? messageInput.value.trim() : "";
      const originalLabel = submitButton.textContent;

      submitButton.disabled = true;
      submitButton.textContent = "Saving...";
      thankYou.textContent = "Saving inquiry to the database...";
      thankYou.style.color = "#5f6f66";

      fetch(`${apiBaseUrl}/api/admissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentName,
          grade: selectedGrade,
          parentName,
          contactNumber,
          message: additionalInfo
        })
      })
        .then(async (response) => {
          const payload = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(payload.error || "Unable to save the admission inquiry right now.");
          }

          thankYou.textContent = `Thank you, ${parentName}. We have saved ${studentName}'s inquiry for ${selectedGrade} in the database.`;
          thankYou.style.color = "#1e6f4b";
          form.reset();

          if (messageCount) {
            messageCount.textContent = "0";
          }

          form.querySelectorAll(".is-invalid").forEach((field) => field.classList.remove("is-invalid"));
        })
        .catch((error) => {
          thankYou.textContent = error.message || "Unable to save the admission inquiry right now.";
          thankYou.style.color = "#c45532";
        })
        .finally(() => {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel;
        });
    });
  }

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }
});
