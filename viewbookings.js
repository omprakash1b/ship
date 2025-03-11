// DOM Elements
const errorDiv = document.getElementById('error');
const movieBookingsContainer = document.getElementById('movieBookings');
const salonBookingsContainer = document.getElementById('salonBookings');
const fitnessBookingsContainer = document.getElementById('fitnessBookings');
const partyHallBookingsContainer = document.getElementById('partyHallBookings');

// Fetch Movie Bookings
async function fetchMovieBookings() {
  try {
    const response = await fetch('http://localhost:5000/getMovieBookings');
    if (!response.ok) throw new Error('Failed to fetch movie bookings');

    const data = await response.json();
    displayBookings(movieBookingsContainer, data.results, 'Movie');
  } catch (error) {
    console.error('❌ Movie Fetch Error:', error);
    showError('Could not load movie bookings.');
  }
}

// Fetch Salon Bookings
async function fetchSalonBookings() {
  try {
    const response = await fetch('http://localhost:5000/getSalonBookings');
    if (!response.ok) throw new Error('Failed to fetch salon bookings');

    const data = await response.json();
    displayBookings(salonBookingsContainer, data.results, 'Salon');
  } catch (error) {
    console.error('❌ Salon Fetch Error:', error);
    showError('Could not load salon bookings.');
  }
}

// Fetch Fitness Center Bookings
async function fetchFitnessBookings() {
  try {
    const response = await fetch('http://localhost:5000/getFitnessBookings');
    if (!response.ok) throw new Error('Failed to fetch fitness bookings');

    const data = await response.json();
    displayBookings(fitnessBookingsContainer, data.results, 'Fitness');
  } catch (error) {
    console.error('❌ Fitness Fetch Error:', error);
    showError('Could not load fitness bookings.');
  }
}

// Fetch Party Hall Bookings
async function fetchPartyHallBookings() {
  try {
    const response = await fetch('http://localhost:5000/getPartyHallBookings');
    if (!response.ok) throw new Error('Failed to fetch party hall bookings');

    const data = await response.json();
    displayBookings(partyHallBookingsContainer, data.results, 'PartyHall');
  } catch (error) {
    console.error('❌ Party Hall Fetch Error:', error);
    showError('Could not load party hall bookings.');
  }
}

// Display Bookings
function displayBookings(container, bookings, type) {
  if (!bookings || bookings.length === 0) {
    container.innerHTML = `
      <div class="col-md-6 mb-3">
        <div class="card shadow-sm p-3">
          <p class="text-muted text-center">No bookings found.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = bookings.map(booking => {
    switch (type) {
      case 'Movie':
        return `
          <div class="col-md-6 mb-3">
            <div class="card shadow-sm p-3">
              <h5 class="card-title">🎬 ${booking.MovieName}</h5>
              <p class="card-text">
                🎭 <strong>Genre:</strong> ${booking.Genre} <br />
                🎟️ <strong>Seats Booked:</strong> ${booking.Quantity} <br />
                💰 <strong>Price:</strong> ₹${booking.Price} per ticket
              </p>
            </div>
          </div>
        `;
      case 'Salon':
        return `
          <div class="col-md-6 mb-3">
            <div class="card shadow-sm p-3">
              <h5 class="card-title">💆 ${booking.ServiceName}</h5>
              <p class="card-text">⏳ <strong>Price:</strong> ${booking.Price}</p>
            </div>
          </div>
        `;
      case 'Fitness':
        return `
          <div class="col-md-6 mb-3">
            <div class="card shadow-sm p-3">
              <h5 class="card-title">🏋️ Gym Booking</h5>
              <p class="card-text">⏳ <strong>ServiceName:</strong> ${booking.ServiceName}</p>
            </div>
          </div>
        `;
      case 'PartyHall':
        return `
          <div class="col-md-6 mb-3">
            <div class="card shadow-sm p-3">
              <h5 class="card-title">🎈 ${booking.HallName}</h5>
              <p class="card-text">
                👥 <strong>Guests:</strong> ${booking.Capacity}
              </p>
            </div>
          </div>
        `;
      default:
        return '';
    }
  }).join('');
}

// Show error message
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  fetchMovieBookings();
  fetchSalonBookings();
  fetchFitnessBookings();
  fetchPartyHallBookings();
});