// DOM Elements
const servicesTable = document.getElementById('servicesTable');
const bookingSummary = document.getElementById('bookingSummary');
const checkoutBtn = document.getElementById('checkoutBtn');

let services = [];
let cart = {};

// Fetch services from backend
async function fetchServices() {
  try {
    const response = await fetch('http://localhost:5000/getbeautysalonlist');
    if (!response.ok) throw new Error('Failed to fetch services');

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) throw new Error('Invalid data format');

    services = data.results;
    displayServices(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    servicesTable.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">Failed to load services. Please try again later.</td>
      </tr>
    `;
  }
}

// Display services in the table
function displayServices(services) {
  servicesTable.innerHTML = services.length > 0
    ? services.map(service => `
        <tr>
          <td>${service.ServiceName}</td>
          <td>${service.Category}</td>
          <td>${service.Price}</td>
          <td>
            <button class="btn btn-success" onclick="addToCart(${service.ServiceID})">Book Service</button>
          </td>
        </tr>
      `).join('')
    : `
      <tr>
        <td colspan="4" class="text-center">No services available</td>
      </tr>
    `;
}

// Add service to cart
function addToCart(serviceId) {
  const service = services.find(service => service.ServiceID === serviceId);
  if (!service) return;

  cart[serviceId] = cart[serviceId]
    ? { ...cart[serviceId], quantity: cart[serviceId].quantity + 1 }
    : { ...service, quantity: 1 };

  updateBookingSummary();
}

// Remove service from cart
function removeFromCart(serviceId) {
  if (cart[serviceId].quantity > 1) {
    cart[serviceId].quantity -= 1;
  } else {
    delete cart[serviceId];
  }

  updateBookingSummary();
}

// Update booking summary
function updateBookingSummary() {
  bookingSummary.innerHTML = Object.keys(cart).length > 0
    ? Object.values(cart).map(service => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>
            ${service.ServiceName} - $${service.Price} (Quantity: ${service.quantity})
          </span>
          <button class="btn btn-danger btn-sm ms-3" onclick="removeFromCart(${service.ServiceID})">Remove</button>
        </li>
      `).join('')
    : '<li class="list-group-item text-muted text-center">No services booked yet.</li>';

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
    const response = await fetch('http://localhost:5000/booksalon', {
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
  fetchServices();
  checkoutBtn.addEventListener('click', handleCheckout);
});