// DOM Elements
const bookingDateInput = document.getElementById('bookingDate');
const fromTimeInput = document.getElementById('fromTime');
const toTimeInput = document.getElementById('toTime');
const hallsTable = document.getElementById('hallsTable');
const bookingSummary = document.getElementById('bookingSummary');

let halls = [];
let cart = {};

// Fetch party halls from backend
async function fetchHalls() {
  try {
    const response = await fetch('http://localhost:5000/getpartyhall');
    if (!response.ok) throw new Error('Failed to fetch halls');

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) throw new Error('Invalid data format');

    halls = data.results;
    displayHalls(halls);
  } catch (error) {
    console.error('Error fetching halls:', error);
    hallsTable.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">Failed to load halls. Please try again later.</td>
      </tr>
    `;
  }
}

// Display halls in the table
function displayHalls(halls) {
  hallsTable.innerHTML = halls.length > 0
    ? halls.map(hall => `
        <tr>
          <td>${hall.HallName}</td>
          <td>${hall.Capacity}</td>
          <td>Rs.${hall.PricePerHour}</td>
          <td>
            <button class="btn btn-success" onclick="addToCart(${hall.HallID})">Book Now</button>
          </td>
        </tr>
      `).join('')
    : `
      <tr>
        <td colspan="4" class="text-center">No halls available</td>
      </tr>
    `;
}

// Calculate duration in hours
function calculateDuration(fromTime, toTime) {
  const from = new Date(`1970-01-01T${fromTime}`);
  const to = new Date(`1970-01-01T${toTime}`);
  return Math.max((to - from) / (1000 * 60 * 60), 0); // Convert ms to hours
}

// Validate booking time
function isValidBookingTime(selectedDate, fromTime) {
  const today = new Date().toISOString().split('T')[0];
  if (selectedDate === today) {
    const now = new Date();
    const selectedFromTime = new Date(`1970-01-01T${fromTime}`);
    return selectedFromTime > now;
  }
  return true;
}

// Check hall availability
async function checkAvailability(hallName, bookingDate, fromTime, toTime) {
  try {
    const response = await fetch('http://localhost:5000/partyhallavailability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hallName, bookingDate, fromTime, toTime }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.result === true;
  } catch (err) {
    console.error('Error checking availability:', err);
    return false;
  }
}

// Add hall to cart
async function addToCart(hallId) {
  const hall = halls.find(hall => hall.HallID === hallId);
  if (!hall) return;

  const date = bookingDateInput.value;
  const fromTime = fromTimeInput.value;
  const toTime = toTimeInput.value;

  if (!date || !fromTime || !toTime) {
    alert('Please select a date, from time, and to time before booking.');
    return;
  }
  if (!isValidBookingTime(date, fromTime)) {
    alert('You cannot book for a past time today. Please select a future time.');
    return;
  }
  const duration = calculateDuration(fromTime, toTime);
  if (duration <= 0) {
    alert('Invalid time range. "To Time" must be after "From Time".');
    return;
  }
  const isAvailable = await checkAvailability(hall.HallName, date, fromTime, toTime);
  if (!isAvailable) {
    alert('Slot is not available. Please choose another time.');
    return;
  }
  const totalPrice = parseFloat((duration * hall.PricePerHour).toFixed(2));

  cart[hallId] = {
    ...hall,
    bookingDate: date,
    fromTime,
    toTime,
    duration,
    totalPrice,
  };

  updateBookingSummary();
}

// Remove hall from cart
function removeFromCart(hallId) {
  delete cart[hallId];
  updateBookingSummary();
}

// Confirm booking
async function confirmBooking(hall) {
  try {
    const response = await fetch('http://localhost:5000/bookpartyhall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hallName: hall.HallName,
        bookingDate: hall.bookingDate,
        capacity: hall.Capacity,
        fromTime: hall.fromTime,
        toTime: hall.toTime,
        price: hall.totalPrice,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Booking confirmed successfully!');
      removeFromCart(hall.HallID);
    } else {
      alert(data.message || 'Failed to confirm booking. Please try again.');
    }
  } catch (error) {
    console.error('Error confirming booking:', error);
    alert('Error while confirming booking. Please try again.');
  }
}

// Update booking summary
function updateBookingSummary() {
  bookingSummary.innerHTML = Object.keys(cart).length > 0
    ? Object.values(cart).map(hall => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            ${hall.HallName} - Rs.${hall.totalPrice} (⏳ ${hall.duration} hrs)
          </div>
          <div>
            <button class="btn btn-primary btn-sm me-2" onclick="confirmBooking(${JSON.stringify(hall).replace(/"/g, '&quot;')})">
              Confirm Booking
            </button>
            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${hall.HallID})">
              Remove
            </button>
          </div>
        </li>
      `).join('')
    : '<li class="list-group-item text-muted text-center">No halls booked yet.</li>';
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Set minimum date for booking
  bookingDateInput.min = new Date().toISOString().split('T')[0];

  // Enable time inputs when date is selected
  bookingDateInput.addEventListener('change', () => {
    fromTimeInput.disabled = !bookingDateInput.value;
    toTimeInput.disabled = !bookingDateInput.value;
  });

  fetchHalls();
});