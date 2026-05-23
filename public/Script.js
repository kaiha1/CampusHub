/**
 * script.js  –  CampusHub Academic Portal
 * Shared JavaScript for ALL pages
 *
 * Sections:
 *  1. Navbar scroll shadow + mobile hamburger toggle
 *  2. Scroll-triggered fade-up animations (Intersection Observer)
 *  3. Animated number counter (hero stats)
 *  4. Password show/hide toggle
 *  5. Password strength meter
 *  6. Form validation helpers (login, register, reset-password, add-event)
 *  7. Events page: search filter + category pills
 *  8. Add-event page: character counter for description
 */

/* =============================================
   1. NAVBAR – scroll shadow + mobile menu
   ============================================= */

const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

// Add a shadow to the navbar when the user scrolls down
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Toggle mobile menu open/closed when the hamburger button is clicked
if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
}

// Close mobile menu when a link is clicked
if (navLinks) {
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}


/* =============================================
   2. SCROLL ANIMATIONS (Intersection Observer)
   ============================================= */

/**
 * IntersectionObserver watches elements with the class "fade-up".
 * When they enter the viewport, we trigger their CSS animation
 * by adding a small delay then letting the CSS keyframe play.
 */
const fadeUpElements = document.querySelectorAll('.fade-up');

const observerOptions = {
  root:       null,   // observe relative to the viewport
  rootMargin: '0px',
  threshold:  0.12    // trigger when 12% of the element is visible
};

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Reset opacity/transform so the CSS animation plays
      entry.target.style.animationPlayState = 'running';
      scrollObserver.unobserve(entry.target); // Only animate once
    }
  });
}, observerOptions);

// Pause all animations initially, then let observer restart them
fadeUpElements.forEach(el => {
  el.style.animationPlayState = 'paused';
  scrollObserver.observe(el);
});


/* =============================================
   3. ANIMATED NUMBER COUNTER (Hero stats)
   ============================================= */

/**
 * Each stat element has a data-target attribute with the end value.
 * This function counts up from 0 to that value over ~1.5 seconds.
 */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);  // e.g. 120
  const duration = 1500;   // milliseconds
  const steps    = 60;     // animation steps
  const increment = target / steps;
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target.toLocaleString(); // format with commas
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current).toLocaleString();
    }
  }, duration / steps);
}

// Find all counter elements and start them when visible
const statNumbers = document.querySelectorAll('.stat-number');

if (statNumbers.length > 0) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target); // count up only once
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));
}


/* =============================================
   4. PASSWORD SHOW / HIDE TOGGLE
   ============================================= */

/**
 * Find all toggle-password buttons on the page.
 * When clicked, swap the input type between "password" and "text".
 */
document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    // The button sits inside .input-password-wrapper, which also contains the input
    const input = btn.closest('.input-password-wrapper').querySelector('input');

    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';  // Change icon to indicate visible
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  });
});


/* =============================================
   5. PASSWORD STRENGTH METER (Register page)
   ============================================= */

const passwordInput    = document.getElementById('password');
const strengthSegments = document.querySelectorAll('.strength-segment');

/**
 * Calculates a simple password strength score from 0 to 4.
 * Criteria: length >= 8, has uppercase, has number, has special char.
 */
function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8)                       score++; // length check
  if (/[A-Z]/.test(password))                     score++; // uppercase
  if (/[0-9]/.test(password))                     score++; // number
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password))   score++; // special char
  return score;
}

// Colour mapping: 1=red, 2=orange, 3=yellow-green, 4=green
const strengthColors = ['', '#ef4444', '#f97316', '#84cc16', '#22c55e'];

if (passwordInput && strengthSegments.length > 0) {
  passwordInput.addEventListener('input', () => {
    const score = getPasswordStrength(passwordInput.value);

    // Colour each segment up to the score
    strengthSegments.forEach((seg, index) => {
      seg.style.background = index < score
        ? strengthColors[score]
        : 'var(--border)';
    });
  });
}


/* =============================================
   6. FORM VALIDATION HELPERS
   ============================================= */

/**
 * Simple helper: show an error message below a field.
 * @param {HTMLElement} field  - The input element
 * @param {string}      msg    - Error message text
 */
function showError(field, msg) {
  // Look for a sibling .form-error element
  let errorEl = field.parentElement.querySelector('.form-error');

  // If it's inside .input-password-wrapper, look one level up
  if (!errorEl && field.closest('.input-password-wrapper')) {
    errorEl = field.closest('.form-group').querySelector('.form-error');
  }

  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  // Red border on the field
  field.style.borderColor = '#ef4444';
}

/**
 * Clear error state on a field.
 */
function clearError(field) {
  let errorEl = field.parentElement.querySelector('.form-error');
  if (!errorEl && field.closest('.input-password-wrapper')) {
    errorEl = field.closest('.form-group').querySelector('.form-error');
  }
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
  field.style.borderColor = '';
}

// Clear error styling when user starts typing
document.querySelectorAll('.form-group input, .form-group select, .form-group textarea')
  .forEach(field => {
    field.addEventListener('input', () => clearError(field));
  });


/* ---- LOGIN FORM ---- */
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();   // Stop the default page reload
    let valid = true;

    const emailField    = document.getElementById('email');
    const passwordField = document.getElementById('password');

    // Validate email
    if (!emailField.value.trim()) {
      showError(emailField, 'Please enter your email address.');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(emailField.value)) {
      showError(emailField, 'Please enter a valid email address.');
      valid = false;
    }

    // Validate password
    if (!passwordField.value) {
      showError(passwordField, 'Please enter your password.');
      valid = false;
    }

    if (valid) {
      // When backend is ready, replace this with a fetch() POST request
      console.log('Login form submitted:', { email: emailField.value });
      alert('✅ Login successful! (Backend not connected yet.)');
    }
  });
}


/* ---- REGISTER FORM ---- */
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const firstNameField = document.getElementById('firstName');
    const lastNameField  = document.getElementById('lastName');
    const emailField     = document.getElementById('email');
    const passwordField  = document.getElementById('password');
    const confirmField   = document.getElementById('confirmPassword');
    const termsCheck     = document.getElementById('terms');

    // First name
    if (!firstNameField.value.trim()) {
      showError(firstNameField, 'First name is required.');
      valid = false;
    }

    // Last name
    if (!lastNameField.value.trim()) {
      showError(lastNameField, 'Last name is required.');
      valid = false;
    }

    // Email
    if (!emailField.value.trim() || !/\S+@\S+\.\S+/.test(emailField.value)) {
      showError(emailField, 'Please enter a valid email address.');
      valid = false;
    }

    // Password strength
    if (passwordField.value.length < 8) {
      showError(passwordField, 'Password must be at least 8 characters.');
      valid = false;
    }

    // Confirm password match
    if (confirmField.value !== passwordField.value) {
      showError(confirmField, 'Passwords do not match.');
      valid = false;
    }

    // Terms checkbox
    if (!termsCheck.checked) {
      alert('Please accept the Terms & Conditions to continue.');
      valid = false;
    }

    if (valid) {
      console.log('Register form submitted:', { email: emailField.value });
      alert('✅ Account created! (Backend not connected yet.)');
    }
  });
}


/* ---- RESET PASSWORD FORM ---- */
const resetForm    = document.getElementById('resetForm');
const successBox   = document.getElementById('successBox');

if (resetForm) {
  resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const emailField = document.getElementById('email');

    if (!emailField.value.trim() || !/\S+@\S+\.\S+/.test(emailField.value)) {
      showError(emailField, 'Please enter a valid email address.');
      valid = false;
    }

    if (valid) {
      console.log('Reset password email sent to:', emailField.value);

      // Hide the form and show the success message
      resetForm.style.display = 'none';
      if (successBox) successBox.style.display = 'block';
    }
  });
}


/* ---- ADD EVENT FORM ---- */
const addEventForm = document.getElementById('addEventForm');

if (addEventForm) {
  addEventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const titleField    = document.getElementById('eventTitle');
    const categoryField = document.getElementById('eventCategory');
    const dateField     = document.getElementById('eventDate');
    const timeField     = document.getElementById('eventTime');
    const locationField = document.getElementById('eventLocation');
    const descField     = document.getElementById('eventDescription');

    if (!titleField.value.trim()) {
      showError(titleField, 'Event title is required.');
      valid = false;
    }

    if (!categoryField.value) {
      showError(categoryField, 'Please select a category.');
      valid = false;
    }

    if (!dateField.value) {
      showError(dateField, 'Please select a date.');
      valid = false;
    } else {
      // Ensure the date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(dateField.value) < today) {
        showError(dateField, 'Event date cannot be in the past.');
        valid = false;
      }
    }

    if (!timeField.value) {
      showError(timeField, 'Please select a time.');
      valid = false;
    }

    if (!locationField.value.trim()) {
      showError(locationField, 'Event location is required.');
      valid = false;
    }

    if (!descField.value.trim()) {
      showError(descField, 'Please add a description.');
      valid = false;
    }

    if (valid) {
      console.log('New event:', {
        title:    titleField.value,
        category: categoryField.value,
        date:     dateField.value,
        time:     timeField.value,
        location: locationField.value,
      });
      alert('✅ Event added successfully! (Backend not connected yet.)');
      addEventForm.reset();
    }
  });
}


/* =============================================
   7. EVENTS PAGE – search filter + category pills
   ============================================= */

const searchInput = document.getElementById('eventSearch');
const pills       = document.querySelectorAll('.pill');
const eventCards  = document.querySelectorAll('.event-list-card');

let activeCategory = 'all'; // tracks which pill is selected

/**
 * Filter visible event cards based on search text AND selected category.
 */
function filterEvents() {
  const query = searchInput ? searchInput.value.toLowerCase() : '';

  eventCards.forEach(card => {
    const title    = (card.dataset.title    || '').toLowerCase();
    const category = (card.dataset.category || '').toLowerCase();

    // Check both conditions
    const matchesSearch   = title.includes(query);
    const matchesCategory = activeCategory === 'all' || category === activeCategory;

    // Show or hide the card
    card.style.display = (matchesSearch && matchesCategory) ? 'flex' : 'none';
  });
}

// Listen for typing in the search box
if (searchInput) {
  searchInput.addEventListener('input', filterEvents);
}

// Listen for category pill clicks
pills.forEach(pill => {
  pill.addEventListener('click', () => {
    // Remove active class from all pills
    pills.forEach(p => p.classList.remove('active'));
    // Set active on clicked pill
    pill.classList.add('active');
    // Update current category
    activeCategory = pill.dataset.category || 'all';
    filterEvents();
  });
});


/* =============================================
   8. ADD-EVENT PAGE – description character counter
   ============================================= */

const descTextarea = document.getElementById('eventDescription');
const charCount    = document.getElementById('charCount');

if (descTextarea && charCount) {
  const MAX_CHARS = 500;

  descTextarea.addEventListener('input', () => {
    const remaining = MAX_CHARS - descTextarea.value.length;
    charCount.textContent = `${descTextarea.value.length} / ${MAX_CHARS} characters`;

    // Turn red when close to the limit
    charCount.style.color = remaining < 50 ? '#ef4444' : 'var(--text-muted)';
  });
}