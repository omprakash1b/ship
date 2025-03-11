// DOM Elements
const foodItemsTable = document.getElementById('foodItemsTable');
const orderSummary = document.getElementById('orderSummary');
const checkoutBtn = document.getElementById('checkoutBtn');

let foodItems = [];
let cart = {};

// Fetch food items from backend
async function fetchFoodItems() {
  try {
    const response = await fetch('http://localhost:5000/getfooditems');
    if (!response.ok) throw new Error('Failed to fetch food items');

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) throw new Error('Invalid data format');

    foodItems = data.results;
    displayFoodItems(foodItems);
  } catch (error) {
    console.error('Error fetching food items:', error);
    foodItemsTable.innerHTML = `
      <tr>
        <td colspan="3" class="text-center">Failed to load food items. Please try again later.</td>
      </tr>
    `;
  }
}

// Display food items in the table
function displayFoodItems(items) {
  foodItemsTable.innerHTML = items.length > 0
    ? items.map(item => `
        <tr>
          <td>${item.ItemName}</td>
          <td>${item.Price}</td>
          <td>
            <button class="btn btn-success" onclick="addToCart(${item.ItemID})">Order</button>
          </td>
        </tr>
      `).join('')
    : `
      <tr>
        <td colspan="3" class="text-center">No food items available</td>
      </tr>
    `;
}

// Add item to cart
function addToCart(itemId) {
  const item = foodItems.find(item => item.ItemID === itemId);
  if (!item) return;

  cart[itemId] = cart[itemId]
    ? { ...cart[itemId], quantity: cart[itemId].quantity + 1 }
    : { ...item, quantity: 1 };

  updateOrderSummary();
}

// Remove item from cart
function removeFromCart(itemId) {
  if (cart[itemId].quantity > 1) {
    cart[itemId].quantity -= 1;
  } else {
    delete cart[itemId];
  }

  updateOrderSummary();
}

// Update order summary
function updateOrderSummary() {
  orderSummary.innerHTML = Object.keys(cart).length > 0
    ? Object.values(cart).map(item => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${item.ItemName} - ${item.Price} (Quantity: ${item.quantity})
          <div>
            <button class="btn btn-danger btn-sm me-2" onclick="removeFromCart(${item.ItemID})">Remove</button>
          </div>
        </li>
      `).join('')
    : '<li class="list-group-item text-muted text-center">No items ordered yet.</li>';

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
    const response = await fetch('http://localhost:5000/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerID: userId,
        cart: cart,
        category: 'food',
      }),
    });

    if (!response.ok) throw new Error('Checkout failed');

    const data = await response.json();
    alert(`Checkout successful! Order ID: ${data.orderId}`);
    cart = {};
    updateOrderSummary();
  } catch (error) {
    console.error('Error during checkout:', error);
    alert('Checkout failed. Please try again.');
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  fetchFoodItems();
  checkoutBtn.addEventListener('click', handleCheckout);
});