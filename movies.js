// DOM Elements
const moviesTable = document.getElementById('moviesTable');
const bookingSummary = document.getElementById('bookingSummary');
const checkoutBtn = document.getElementById('checkoutBtn');

let movies = [];
let cart = {};

// Fetch movies list from backend
async function fetchMoviesList() {
  try {
    const response = await fetch('http://localhost:5000/getmovieslist');
    if (!response.ok) throw new Error('Failed to fetch movies');

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) throw new Error('Invalid data format');

    movies = data.results;
    displayMovies(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    moviesTable.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">Failed to load movies. Please try again later.</td>
      </tr>
    `;
  }
}

// Display movies in the table
function displayMovies(movies) {
  moviesTable.innerHTML = movies.length > 0
    ? movies.map(movie => `
        <tr>
          <td>${movie.MovieName}</td>
          <td>${movie.Genre}</td>
          <td>${movie.Price}</td>
          <td>
            <button class="btn btn-success" onclick="addToCart(${movie.MovieID})">Book Ticket</button>
          </td>
        </tr>
      `).join('')
    : `
      <tr>
        <td colspan="4" class="text-center">No movies available</td>
      </tr>
    `;
}

// Add movie to cart
function addToCart(movieId) {
  const movie = movies.find(movie => movie.MovieID === movieId);
  if (!movie) return;

  cart[movieId] = cart[movieId]
    ? { ...cart[movieId], quantity: cart[movieId].quantity + 1 }
    : { ...movie, quantity: 1 };

  updateBookingSummary();
}

// Remove movie from cart
function removeFromCart(movieId) {
  if (cart[movieId].quantity > 1) {
    cart[movieId].quantity -= 1;
  } else {
    delete cart[movieId];
  }

  updateBookingSummary();
}

// Update booking summary
function updateBookingSummary() {
  bookingSummary.innerHTML = Object.keys(cart).length > 0
    ? Object.values(cart).map(movie => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${movie.MovieName} - ${movie.Price} (Quantity: ${movie.quantity})
          <div>
            <button class="btn btn-danger btn-sm me-2" onclick="removeFromCart(${movie.MovieID})">Remove</button>
          </div>
        </li>
      `).join('')
    : '<li class="list-group-item text-muted text-center">No tickets booked yet.</li>';

  checkoutBtn.disabled = Object.keys(cart).length === 0;
}

// Handle checkout
async function handleCheckout() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('User ID is missing. Please log in again.');
    return;
  }
  if (Object.keys(cart).length === 0) {
    alert('Your cart is empty');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/bookmovies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, cart }),
    });

    if (!response.ok) throw new Error('Checkout failed');

    const data = await response.json();
    alert(`Checkout successful! Order ID: ${data.orderId}`);
    cart = {};
    updateBookingSummary();
  } catch (error) {
    console.error('Error during checkout:', error);
    alert('Checkout failed. Please try again.');
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  fetchMoviesList();
  checkoutBtn.addEventListener('click', handleCheckout);
});