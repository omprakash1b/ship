// DOM Elements
const sessionsTable = document.getElementById('sessionsTable');
const bookingSummary = document.getElementById('bookingSummary');
const checkoutBtn = document.getElementById('checkoutBtn');
const recentBooking = document.getElementById('recentBooking');
const bookingHistory = document.getElementById('bookingHistory');

let sessions = [];
let cart = {};
let orderHistory = [];
let recentOrder = null;

// Fetch gym sessions from backend
async function fetchSessions() {
  try {
    const response = await fetch('http://localhost:5000/getgymservices');
    if (!response.ok) throw new Error('Failed to fetch sessions');

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) throw new Error('Invalid data format');

    sessions = data.results;
    displaySessions(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    sessionsTable.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">Failed to load sessions. Please try again later.</td>
      </tr>
    `;
  }
}

// Display sessions in the table
function displaySessions(sessions) {
  sessionsTable.innerHTML = sessions.length > 0
    ? sessions.map(session => `
        <tr>
          <td>${session.ServiceName}</td>
          <td>${session.Category}</td>
          <td>${session.Price}</td>
          <td>
            <button class="btn btn-success" onclick="addToCart(${session.ServiceID})">Book Session</button>
          </td>
        </tr>
      `).join('')
    : `
      <tr>
        <td colspan="4" class="text-center">No sessions available</td>
      </tr>
    `;
}

// Add session to cart
function addToCart(sessionId) {
  const session = sessions.find(session => session.ServiceID === sessionId);
  if (!session) return;

  cart[sessionId] = cart[sessionId]
    ? { ...cart[sessionId], quantity: cart[sessionId].quantity + 1 }
    : { ...session, quantity: 1 };

  updateBookingSummary();
}

// Remove session from cart
function removeFromCart(sessionId) {
  if (cart[sessionId].quantity > 1) {
    cart[sessionId].quantity -= 1;
  } else {
    delete cart[sessionId];
  }

  updateBookingSummary();
}

// Update booking summary
function updateBookingSummary() {
  bookingSummary.innerHTML = Object.keys(cart).length > 0
    ? Object.values(cart).map(session => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${session.ServiceName} - ${session.Price} (Quantity: ${session.quantity})
          <div>
            <button class="btn btn-danger btn-sm me-2" onclick="removeFromCart(${session.ServiceID})">Remove</button>
          </div>
        </li>
      `).join('')
    : '<li class="list-group-item text-muted text-center">No sessions booked yet.</li>';

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
    console.log('Cart Data Sent:', JSON.stringify(cart, null, 2));
    const response = await fetch('http://localhost:5000/bookgymservice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, cart }),
    });

    if (!response.ok) throw new Error('Checkout failed');

    const data = await response.json();
    alert(`Checkout successful! Order ID: ${data.orderId}`);

    // Update recent order and order history
    recentOrder = Object.values(cart);
    orderHistory.push(...recentOrder);

    // Update UI
    updateRecentBooking();
    updateBookingHistory();

    // Clear cart
    cart = {};
    updateBookingSummary();
  } catch (error) {
    console.error('Error during checkout:', error);
    alert('Checkout failed. Please try again.');
  }
}

// Update recent booking
function updateRecentBooking() {
  recentBooking.innerHTML = recentOrder
    ? recentOrder.map(session => `
        <li class="list-group-item">
          ${session.ServiceName} - ${session.Price} (Quantity: ${session.quantity})
        </li>
      `).join('')
    : '<li class="list-group-item text-muted text-center">No recent bookings.</li>';
}

// Update booking history
function updateBookingHistory() {
  bookingHistory.innerHTML = orderHistory.length > 0
    ? orderHistory.map((session, index) => `
        <li class="list-group-item">
          ${session.ServiceName} - ${session.Price} (Quantity: ${session.quantity})
        </li>
      `).join('')
    : '<li class="list-group-item text-muted text-center">No booking history.</li>';
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  fetchSessions();
  checkoutBtn.addEventListener('click', handleCheckout);
});