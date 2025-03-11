// DOM Elements
const addFoodItemForm = document.getElementById('addFoodItemForm');
const foodMenu = document.getElementById('foodMenu');
const errorDiv = document.getElementById('error');
const itemNameInput = document.getElementById('itemName');
const itemPriceInput = document.getElementById('itemPrice');

let foodItems = [];

// Fetch food items
async function fetchItems() {
  try {
    const response = await fetch('http://localhost:5000/getfooditems');
    if (!response.ok) throw new Error('Failed to fetch items');

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid data format');
    }

    foodItems = data.results;
    displayItems(foodItems);
  } catch (error) {
    showError(`Could not load items: ${error.message}`);
  }
}

// Display food items
function displayItems(items) {
  foodMenu.innerHTML = items.length > 0
    ? items.map(item => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>${item.ItemName} - ₹${item.Price}</span>
          <div>
            <input
              type="text"
              class="form-control d-inline-block w-25 me-2"
              value="${item.Price}"
              onchange="handlePriceChange(${item.ItemID}, this.value)"
            />
            <button class="btn btn-success me-2" onclick="updatePrice(${item.ItemID})">Update</button>
            <button class="btn btn-danger" onclick="deleteItem(${item.ItemID})">Delete</button>
          </div>
        </li>
      `).join('')
    : '<li class="list-group-item text-muted text-center">No items available</li>';
}

// Add food item
addFoodItemForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = itemNameInput.value.trim();
  const price = itemPriceInput.value.trim();

  if (!name || !price) {
    showError('Please fill in all fields.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/addfooditem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price }),
    });

    if (!response.ok) throw new Error('Failed to add item');

    await fetchItems();
    itemNameInput.value = '';
    itemPriceInput.value = '';
  } catch (error) {
    showError(`Could not add item: ${error.message}`);
  }
});

// Delete food item
async function deleteItem(id) {
  try {
    const response = await fetch(`http://localhost:5000/deletefooditem/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete item');

    await fetchItems();
  } catch (error) {
    showError(`Could not delete item: ${error.message}`);
  }
}

// Update food item price
async function updatePrice(id) {
  const newPrice = document.querySelector(`input[onchange*="handlePriceChange(${id}"]`).value;

  try {
    const response = await fetch(`http://localhost:5000/updatefooditem/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: newPrice }),
    });

    if (!response.ok) throw new Error('Failed to update price');

    await fetchItems();
  } catch (error) {
    showError(`Could not update price: ${error.message}`);
  }
}

// Handle price change
function handlePriceChange(id, value) {
  const item = foodItems.find(item => item.ItemID === id);
  if (item) item.Price = value;
}

// Show error message
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => errorDiv.style.display = 'none', 5000);
}

// Initial load
document.addEventListener('DOMContentLoaded', fetchItems);