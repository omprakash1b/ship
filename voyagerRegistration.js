// DOM Elements
const registrationForm = document.getElementById('registrationForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const cabinNumberInput = document.getElementById('cabinNumber');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const errorDiv = document.getElementById('error');
const successDiv = document.getElementById('success');

// Generate a random cabin number
function generateCabinNumber() {
  return 'CAB' + Math.floor(1000 + Math.random() * 9000);
}

// Set initial cabin number
cabinNumberInput.value = generateCabinNumber();

// Validate form inputs
function validateForm() {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (!name || !email || !phone || !password || !confirmPassword) {
    return 'All fields are required.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
}

// Handle form submission
registrationForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const validationError = validateForm();
  if (validationError) {
    showError(validationError);
    return;
  }

  const formData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    cabinNumber: cabinNumberInput.value,
    password: passwordInput.value.trim(),
    confirmPassword: confirmPasswordInput.value.trim(),
  };

  try {
    const response = await fetch('http://localhost:5000/registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    showSuccess('Registration successful!');
    clearForm();
  } catch (error) {
    showError(error.message);
  }
});

// Show error message
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  successDiv.style.display = 'none';
}

// Show success message
function showSuccess(message) {
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  errorDiv.style.display = 'none';
}

// Clear form inputs
function clearForm() {
  nameInput.value = '';
  emailInput.value = '';
  phoneInput.value = '';
  passwordInput.value = '';
  confirmPasswordInput.value = '';
  cabinNumberInput.value = generateCabinNumber();
}